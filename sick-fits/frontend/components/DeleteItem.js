import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { ALL_ITEMS_QUERY } from "./Items";
import { CURRENT_USER_QUERY } from "./User";

const DELETE_ITEM_MUTATION = gql`
        mutation DELETE_ITEM_MUTATION($id: ID!) {
                deleteItem(id: $id) {
                        id
                }
        }
`;

class DeleteItem extends Component {
        update = (cache, payload) => {
                const data = cache.readQuery({ query: ALL_ITEMS_QUERY });

                data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
                cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
        };

        render() {
                const { children, id } = this.props;
                return (
                        <Mutation
                                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                                mutation={DELETE_ITEM_MUTATION}
                                variables={{ id }}
                                update={this.update}
                        >
                                {(deleteItem, { error }) => (
                                        <button
                                                type="button"
                                                onClick={() => {
                                                        if (confirm("Are you sure you want to delete this item?")) {
                                                                deleteItem().catch(err => {
                                                                        alert(err.message);
                                                                });
                                                        }
                                                }}
                                        >
                                                {children}
                                        </button>
                                )}
                        </Mutation>
                );
        }
}

export default DeleteItem;
