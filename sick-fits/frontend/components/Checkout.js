import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import NProgress from "nprogress";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import CalcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const CREATE_ORDER_MUTATION = gql`
        mutation CREATE_ORDER_MUTATION($token: String!) {
                createOrder(token: $token) {
                        id
                        charge
                        total
                        items {
                                id
                                title
                        }
                }
        }
`;

function totalItems(cart) {
        return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class CheckOut extends React.Component {
        onToken = async (res, createOrder) => {
                NProgress.start();
                const order = await createOrder({
                        variables: {
                                token: res.id,
                        },
                }).catch(err => {
                        alert(err.message);
                });
                Router.push({
                        pathname: "/order",
                        query: { id: order.data.createOrder.id },
                });
        };

        render() {
                return (
                        <User>
                                {({ data: { me } }) => (
                                        <Mutation
                                                mutation={CREATE_ORDER_MUTATION}
                                                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                                        >
                                                {createOrder => (
                                                        <StripeCheckout
                                                                amount={CalcTotalPrice(me.cart)}
                                                                name="Sick Fits"
                                                                description={`Order of ${totalItems(me.cart)} ${
                                                                        totalItems(me.cart) > 1 ? "Items" : "Item"
                                                                }`}
                                                                image={
                                                                        (me.cart.length &&
                                                                                me.cart[0].item &&
                                                                                me.cart[0].item.image) ||
                                                                        null
                                                                }
                                                                stripeKey="pk_test_yChb5Yo4wFzk5Ut43LJR6YCD000ZLzVWUj"
                                                                currency="USD"
                                                                email={me.email}
                                                                token={res => this.onToken(res, createOrder)}
                                                        >
                                                                {this.props.children}
                                                        </StripeCheckout>
                                                )}
                                        </Mutation>
                                )}
                        </User>
                );
        }
}

export default CheckOut;
