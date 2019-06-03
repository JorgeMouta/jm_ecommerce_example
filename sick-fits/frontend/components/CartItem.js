import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import formatMoney from "../lib/formatMoney";
import RemoveFromCart from "./RemoveFromCart";

const CartItemStyles = styled.li`
        padding: 1rem 0;
        border-bottom: 1px solid ${props => props.theme.lightgrey};
        display: grid;
        align-items: center;
        grid-template-columns: auto 1fr auto;
        img {
                margin-right: 10px;
        }
        h3,
        p {
                margin: 0;
        }
`;

const CartItem = props => {
        CartItem.propTypes = {
                cartItem: PropTypes.object.isRequired,
        };
        if (!props.cartItem.item)
                return (
                        <CartItemStyles>
                                <p>This Item has been removed.</p>
                                <RemoveFromCart id={props.cartItem.id} />
                        </CartItemStyles>
                );
        const { image, title, name, id, price } = props.cartItem.item;

        return (
                <CartItemStyles>
                        <img width="100" src={image} alt={title} />
                        <div className="cart-items-details">
                                <h3>{title} </h3>
                                <p>
                                        {formatMoney(price * props.cartItem.quantity)}
                                        {" - "}
                                        <em>
                                                {props.cartItem.quantity} &times; {formatMoney(price)} each
                                        </em>
                                </p>
                        </div>
                        <RemoveFromCart id={props.cartItem.id} />
                </CartItemStyles>
        );
};

export default CartItem;
