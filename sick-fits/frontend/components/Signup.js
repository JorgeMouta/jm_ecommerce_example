import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const SIGNUP_MUTATION = gql`
        mutation SIGNUP_MUTATION($name: String!, $email: String!, $password: String!) {
                signup(name: $name, email: $email, password: $password) {
                        id
                        name
                        email
                }
        }
`;

class Signup extends Component {
        state = {
                name: "",
                email: "",
                password: "",
        };

        saveToState = event => {
                const { name, value } = event.target;
                this.setState({ [name]: value });
        };

        render() {
                return (
                        <Mutation
                                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                                mutation={SIGNUP_MUTATION}
                                variables={this.state}
                        >
                                {(signup, { error, loading }) => (
                                        <Form
                                                method="post"
                                                onSubmit={async event => {
                                                        event.preventDefault();
                                                        const res = await signup();
                                                        this.setState({
                                                                name: "",
                                                                email: "",
                                                                password: "",
                                                        });
                                                }}
                                        >
                                                <fieldset disabled={loading} aria-busy={loading}>
                                                        <h2>Sign Up for an Account!</h2>
                                                        <Error error={error} />
                                                        <label htmlFor="name">
                                                                Name{" "}
                                                                <input
                                                                        name="name"
                                                                        id="name"
                                                                        type="text"
                                                                        placeHolder="Name"
                                                                        value={this.state.name}
                                                                        onChange={this.saveToState}
                                                                />
                                                        </label>
                                                        <label htmlFor="email">
                                                                Email
                                                                <input
                                                                        name="email"
                                                                        id="email"
                                                                        type="email"
                                                                        placeHolder="Email"
                                                                        value={this.state.email}
                                                                        onChange={this.saveToState}
                                                                />
                                                        </label>
                                                        <label htmlFor="password">
                                                                Password
                                                                <input
                                                                        name="password"
                                                                        id="password"
                                                                        type="password"
                                                                        placeHolder="Password"
                                                                        value={this.state.password}
                                                                        onChange={this.saveToState}
                                                                />
                                                        </label>
                                                        <button type="submit">Sign Up!</button>
                                                </fieldset>
                                        </Form>
                                )}
                        </Mutation>
                );
        }
}

export default Signup;
