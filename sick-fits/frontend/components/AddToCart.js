import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

const ADD_TO_CART_MUTATION = gql`
        mutation ADD_TO_CART_MUTATION($id: ID!) {
                addToCart(id: $id) {
                        id
                        quantity
                }
        }
`;

class AddToCart extends React.Component {
        render() {
                const { id } = this.props;
                return (
                        <Mutation
                                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                                mutation={ADD_TO_CART_MUTATION}
                                variables={{ id }}
                        >
                                {(addToCart, { loading }) => (
                                        <button disabled={loading} type="button" onClick={addToCart}>
                                                Add{loading && "ing"} to cart
                                        </button>
                                )}
                        </Mutation>
                );
        }
}

export default AddToCart;
