import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const SIGNIN_MUTATION = gql`
        mutation SIGNIN_MUTATION($email: String!, $password: String!) {
                signin(email: $email, password: $password) {
                        id
                        name
                        email
                }
        }
`;

class Signin extends Component {
        state = {
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
                                mutation={SIGNIN_MUTATION}
                                variables={this.state}
                        >
                                {(signin, { error, loading }) => (
                                        <Form
                                                method="post"
                                                onSubmit={async event => {
                                                        event.preventDefault();
                                                        const res = await signin();
                                                        this.setState({
                                                                email: "",
                                                                password: "",
                                                        });
                                                }}
                                        >
                                                <fieldset disabled={loading} aria-busy={loading}>
                                                        <h2>Sign into your account</h2>
                                                        <Error error={error} />
                                                        <label htmlFor="email">
                                                                Email
                                                                <input
                                                                        name="email"
                                                                        id="email"
                                                                        type="email"
                                                                        placeholder="Email"
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
                                                                        placeholder="Password"
                                                                        value={this.state.password}
                                                                        onChange={this.saveToState}
                                                                />
                                                        </label>
                                                        <button type="submit">Sign In!</button>
                                                </fieldset>
                                        </Form>
                                )}
                        </Mutation>
                );
        }
}

export default Signin;
