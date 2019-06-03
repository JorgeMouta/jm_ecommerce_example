import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const SINGLE_ITEM_QUERY = gql`
        query SINGLE_ITEM_QUERY($id: ID!) {
                item(where: { id: $id }) {
                        id
                        title
                        description
                        price
                }
        }
`;

const UPDATE_ITEM_MUTATION = gql`
        mutation UPDATE_ITEM_MUTATION($id: ID!, $title: String, $description: String, $price: Int) {
                updateItem(id: $id, title: $title, description: $description, price: $price) {
                        id
                        title
                        description
                        price
                }
        }
`;

class UpdateItem extends Component {
        state = {};

        handleChange = event => {
                const { name, value, type } = event.target;
                const val = type === "number" ? parseFloat(value) : value;
                this.setState({
                        [name]: val,
                });
        };

        updateItem = async (e, updateItemMutation) => {
                e.preventDefault();
                console.log("updating...");
                console.log(this.state);
                const res = await updateItemMutation({
                        variables: {
                                id: this.props.id,
                                ...this.state,
                        },
                });
                console.log("updated!!!");
        };

        render() {
                const { title, description, price, image, largeImage } = this.state;
                const { id } = this.props;
                return (
                        <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
                                {({ data, loading }) => {
                                        if (loading) return <p>Loading...</p>;
                                        if (!data.item)
                                                return (
                                                        <p>
                                                                Item with id of{" "}
                                                                <span style={{ color: "red" }}>{id}</span> not found
                                                        </p>
                                                );
                                        return (
                                                <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
                                                        {(updateItem, { loading, error }) => (
                                                                <Form onSubmit={e => this.updateItem(e, updateItem)}>
                                                                        <Error error={error} />
                                                                        <fieldset
                                                                                disabled={loading}
                                                                                aria-busy={loading}
                                                                        >
                                                                                <label htmlFor="title">
                                                                                        Title
                                                                                        <input
                                                                                                name="title"
                                                                                                placeholder="Title"
                                                                                                type="text"
                                                                                                id="title"
                                                                                                required
                                                                                                defaultValue={
                                                                                                        data.item.title
                                                                                                }
                                                                                                onChange={
                                                                                                        this
                                                                                                                .handleChange
                                                                                                }
                                                                                        />
                                                                                </label>
                                                                                <label htmlFor="price">
                                                                                        Price
                                                                                        <input
                                                                                                name="price"
                                                                                                placeholder="Price"
                                                                                                type="number"
                                                                                                id="price"
                                                                                                required
                                                                                                defaultValue={
                                                                                                        data.item.price
                                                                                                }
                                                                                                onChange={
                                                                                                        this
                                                                                                                .handleChange
                                                                                                }
                                                                                        />
                                                                                </label>

                                                                                <label htmlFor="description">
                                                                                        Description
                                                                                        <textarea
                                                                                                name="description"
                                                                                                placeholder="Enter A Description"
                                                                                                type="text"
                                                                                                id="description"
                                                                                                required
                                                                                                defaultValue={
                                                                                                        data.item
                                                                                                                .description
                                                                                                }
                                                                                                onChange={
                                                                                                        this
                                                                                                                .handleChange
                                                                                                }
                                                                                        />
                                                                                </label>
                                                                                <button type="submit">
                                                                                        Sav{loading ? "ing" : "e"}{" "}
                                                                                        Changes
                                                                                </button>
                                                                        </fieldset>
                                                                </Form>
                                                        )}
                                                </Mutation>
                                        );
                                }}
                        </Query>
                );
        }
}

export default UpdateItem;

export { UPDATE_ITEM_MUTATION };
