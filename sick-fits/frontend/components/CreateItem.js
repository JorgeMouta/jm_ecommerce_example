import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const CREATE_ITEM_MUTATION = gql`
        mutation CREATE_ITEM_MUTATION(
                $title: String!
                $description: String!
                $price: Int!
                $image: String
                $largeImage: String
        ) {
                createItem(
                        title: $title
                        description: $description
                        price: $price
                        image: $image
                        largeImage: $largeImage
                ) {
                        id
                }
        }
`;

class CreateItem extends Component {
        state = {
                title: "",
                description: "",
                image: "",
                largeImage: "",
                price: 0,
        };

        handleChange = event => {
                const { name, value, type } = event.target;
                const val = type === "number" ? parseFloat(value) : value;
                this.setState({
                        [name]: val,
                });
        };

        uploadFile = async event => {
                const { files } = event.target;
                const data = new FormData();
                data.append("file", files[0]);
                data.append("upload_preset", "sickfits");

                const res = await fetch("https://api.cloudinary.com/v1_1/testingsickfitshop/image/upload", {
                        method: "POST",
                        body: data,
                });
                const file = await res.json();

                this.setState({
                        image: file.secure_url,
                        largeImage: file.eager[0].secure_url,
                });
        };

        render() {
                const { title, description, price, image, largeImage } = this.state;
                return (
                        <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
                                {(createItem, { loading, error }) => (
                                        <Form
                                                onSubmit={async event => {
                                                        event.preventDefault();
                                                        const res = await createItem();

                                                        Router.push({
                                                                pathname: "/item",
                                                                query: { id: res.data.createItem.id },
                                                        });
                                                }}
                                        >
                                                <Error error={error} />
                                                <fieldset disabled={loading} aria-busy={loading}>
                                                        <label htmlFor="file">
                                                                Image
                                                                <input
                                                                        name="file"
                                                                        placeholder="Upload an image"
                                                                        type="file"
                                                                        id="file"
                                                                        required
                                                                        onChange={this.uploadFile}
                                                                />
                                                                {image && <img src={image} alt={title} />}
                                                        </label>
                                                        <label htmlFor="title">
                                                                Title
                                                                <input
                                                                        name="title"
                                                                        placeholder="Title"
                                                                        type="text"
                                                                        id="title"
                                                                        required
                                                                        value={title}
                                                                        onChange={this.handleChange}
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
                                                                        value={price}
                                                                        onChange={this.handleChange}
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
                                                                        value={description}
                                                                        onChange={this.handleChange}
                                                                />
                                                        </label>
                                                        <button type="submit">Submit</button>
                                                </fieldset>
                                        </Form>
                                )}
                        </Mutation>
                );
        }
}

export default CreateItem;

export { CREATE_ITEM_MUTATION };
