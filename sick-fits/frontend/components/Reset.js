import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

import PropTypes from "prop-types";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const RESET_MUTATION = gql`
        mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
                resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
                        id
                        email
                        name
                }
        }
`;

class Reset extends Component {
        static propTypes = {
                resetToken: PropTypes.string.isRequired,
        };

        state = {
                password: "",
                confirmPassword: "",
        };

        saveToState = event => {
                const { name, value } = event.target;
                this.setState({ [name]: value });
        };

        render() {
                return (
                        <Mutation
                                mutation={RESET_MUTATION}
                                variables={{
                                        resetToken: this.props.resetToken,
                                        password: this.state.password,
                                        confirmPassword: this.state.confirmPassword,
                                }}
                                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                        >
                                {(reset, { error, loading, called }) => (
                                        <Form
                                                method="post"
                                                onSubmit={async event => {
                                                        event.preventDefault();
                                                        await reset();
                                                        this.setState({
                                                                password: "",
                                                                confirmPassword: "",
                                                        });
                                                }}
                                        >
                                                <fieldset disabled={loading} aria-busy={loading}>
                                                        <h2>Request a password reset</h2>
                                                        {!error && !loading && called && <p>Password Reseted!</p>}
                                                        <Error error={error} />
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
                                                        <label htmlFor="confirmPassword">
                                                                Confirm Password
                                                                <input
                                                                        name="confirmPassword"
                                                                        id="confirmPassword"
                                                                        type="password"
                                                                        placeholder="Confirm password"
                                                                        value={this.state.confirmPassword}
                                                                        onChange={this.saveToState}
                                                                />
                                                        </label>

                                                        <button type="submit">Password reset</button>
                                                </fieldset>
                                        </Form>
                                )}
                        </Mutation>
                );
        }
}

export default Reset;
