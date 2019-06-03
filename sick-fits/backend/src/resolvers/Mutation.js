const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const Mutations = {
        async createItem(parent, args, ctx, info) {
                if (!ctx.request.userId) throw new Error("Please login to be able to sell items!");
                const item = await ctx.db.mutation.createItem(
                        {
                                data: {
                                        user: {
                                                connect: {
                                                        id: ctx.request.userId,
                                                },
                                        },
                                        ...args,
                                },
                        },
                        info
                );

                return item;
        },
        updateItem(parent, args, ctx, info) {
                const updates = { ...args };
                delete updates.id;
                return ctx.db.mutation.updateItem(
                        {
                                data: updates,
                                where: {
                                        id: args.id,
                                },
                        },
                        info
                );
        },
        async deleteItem(parent, args, ctx, info) {
                const where = { id: args.id };
                const item = await ctx.db.query.item({ where }, "{id title user{id}}");
                const ownsItem = item.user.id === ctx.request.userId;
                const hasPermissions = ctx.request.user.permissions.some(permission =>
                        ["ADMIN", "DELETEITEM"].includes(permission)
                );

                if (!ownsItem && !hasPermissions) {
                        throw new Error("You don't have permission to do that!");
                }

                return ctx.db.mutation.deleteItem({ where }, info);
        },

        async signup(parent, args, ctx, info) {
                args.email = args.email.toLowerCase();
                const password = await bcrypt.hash(args.password, 10);

                const user = await ctx.db.mutation.createUser(
                        {
                                data: {
                                        ...args,
                                        password,
                                        permissions: { set: ["USER"] },
                                },
                        },
                        info
                );
                const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
                ctx.response.cookie("token", token, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24 * 365,
                });
                return user;
        },

        async signin(parent, { email, password }, ctx, info) {
                const user = await ctx.db.query.user({ where: { email } });
                if (!user) {
                        throw new Error(`The email: ${email} provived is invalid, please try again.`);
                }

                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                        throw new Error("The password provided is invalid, please try again!");
                }
                const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
                ctx.response.cookie("token", token, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24 * 365,
                });
                return user;
        },

        signout(parent, args, ctx, info) {
                ctx.response.clearCookie("token");
                return { message: "Good Bye!" };
        },
        async requestReset(parent, args, ctx, info) {
                const user = await ctx.db.query.user({ where: { email: args.email } });
                if (!user) throw new Error(`The mail ${args.email} was not found!`);
                const resetTokenPromiseified = promisify(randomBytes);
                const resetToken = (await resetTokenPromiseified(20)).toString("hex");
                const resetTokenExpiry = Date.now() + 3600000;
                const res = await ctx.db.mutation.updateUser({
                        where: { email: args.email },
                        data: { resetToken, resetTokenExpiry },
                });
                const mailRes = await transport.sendMail({
                        from: "askdmouta@gmail.com",
                        to: user.email,
                        subject: "Your password reset Token",
                        html: makeANiceEmail(
                                `Your password token is here!"\n \n <a href=${
                                        process.env.FRONTEND_URL
                                }/reset?resetToken=${resetToken}>Click to reset!</a>`
                        ),
                });
                return { message: "Thanks!" };
        },
        async resetPassword(parent, args, ctx, info) {
                if (args.password !== args.confirmPassword) {
                        throw new Error("Passwords don't match!");
                }

                const [user] = await ctx.db.query.users({
                        where: {
                                resetToken: args.resetToken,
                                resetTokenExpiry_gte: Date.now() - 3600000,
                        },
                });
                if (!user) {
                        throw new Error("This token is either invalid or expired!");
                }
                const password = await bcrypt.hash(args.password, 10);
                const updatedUser = await ctx.db.mutation.updateUser({
                        where: { email: user.email },
                        data: {
                                password,
                                resetToken: null,
                                resetTokenExpiry: null,
                        },
                });
                const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
                ctx.response.cookie("token", token, {
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24 * 365,
                });
                console.log(updatedUser);
                return updatedUser;
        },
        async updatePermissions(parent, args, ctx, info) {
                if (!ctx.request.userId) throw new Error("You must be logged in!");
                const currentUser = await ctx.db.query.user(
                        {
                                where: {
                                        id: ctx.request.userId,
                                },
                        },
                        info
                );
                hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
                return ctx.db.mutation.updateUser(
                        {
                                data: {
                                        permissions: {
                                                set: args.permissions,
                                        },
                                },
                                where: {
                                        id: args.userId,
                                },
                        },
                        info
                );
        },
        async addToCart(parent, args, ctx, info) {
                const { userId } = ctx.request;
                if (!userId) throw new Error("You must be signed in!");
                const [existingCartItem] = await ctx.db.query.cartItems({
                        where: {
                                user: {
                                        id: userId,
                                },
                                item: {
                                        id: args.id,
                                },
                        },
                });
                if (existingCartItem) {
                        console.log("This item already exists in the cart");
                        return ctx.db.mutation.updateCartItem(
                                {
                                        where: { id: existingCartItem.id },
                                        data: { quantity: existingCartItem.quantity + 1 },
                                },
                                info
                        );
                }
                return ctx.db.mutation.createCartItem(
                        {
                                data: {
                                        user: {
                                                connect: {
                                                        id: userId,
                                                },
                                        },
                                        item: {
                                                connect: {
                                                        id: args.id,
                                                },
                                        },
                                },
                        },
                        info
                );
        },
        async removeFromCart(parent, args, ctx, info) {
                const cartItem = await ctx.db.query.cartItem(
                        {
                                where: {
                                        id: args.id,
                                },
                        },
                        "{id, user{id}}"
                );
                if (!cartItem) throw new Error("Cart Item not found.");
                if (cartItem.user.id !== ctx.request.userId) {
                        throw new Error("Cheatin huuuuhhh");
                }
                return ctx.db.mutation.deleteCartItem(
                        {
                                where: { id: args.id },
                        },
                        info
                );
        },
        async createOrder(parent, args, ctx, info) {
                const { userId } = ctx.request;

                if (!userId) throw new Error("You must be signed in to complete this order");

                const user = await ctx.db.query.user(
                        { where: { id: userId } },
                        `{id
                        name
                        email
                        cart {
                                id
                                quantity
                                item {
                                        title price id description image largeImage
                                }
                        }}`
                );

                const amount = user.cart.reduce(
                        (tally, cartItem) => tally + cartItem.quantity * cartItem.item.price,
                        0
                );
                console.log(`Going to charge a total of ${amount}`);

                const charge = await stripe.charges.create({
                        amount,
                        currency: "USD",
                        source: args.token,
                });
                const orderItems = user.cart.map(cartItem => {
                        const orderItem = {
                                ...cartItem.item,
                                quantity: cartItem.quantity,
                                user: { connect: { id: userId } },
                        };
                        delete orderItem.id;
                        return orderItem;
                });
                const order = ctx.db.mutation.createOrder({
                        data: {
                                total: charge.amount,
                                charge: charge.id,
                                items: { create: orderItems },
                                user: { connect: { id: userId } },
                        },
                });
                const cartItemsIds = user.cart.map(cartItem => cartItem.id);
                await ctx.db.mutation.deleteManyCartItems({
                        where: {
                                id_in: cartItemsIds,
                        },
                });
                return order;
        },
};

module.exports = Mutations;
