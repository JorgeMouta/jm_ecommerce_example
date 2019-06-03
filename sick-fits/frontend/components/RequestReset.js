import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

import Form from "./styles/Form";
import Error from "./ErrorMessage";

const REQUEST_RESET_MUTATION = gql`
        mutation REQUEST_RESET_MUTATION($email: String!) {
                requestReset(email: $email) {
                        message
                }
        }
`;

class RequestReset extends Component {
        state = {
                email: "",
        };

        saveToState = event => {
                const { name, value } = event.target;
                this.setState({ [name]: value });
        };

        render() {
                return (
                        <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
                                {(reset, { error, loading, called }) => (
                                        <Form
                                                method="post"
                                                onSubmit={async event => {
                                                        event.preventDefault();
                                                        await reset();
                                                        this.setState({
                                                                email: "",
                                                        });
                                                }}
                                        >
                                                <fieldset disabled={loading} aria-busy={loading}>
                                                        <h2>Request a password reset</h2>
                                                        {!error && !loading && called && <p>Reset email sent!</p>}
                                                        <Error error={error} />
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

                                                        <button type="submit">Password reset</button>
                                                </fieldset>
                                        </Form>
                                )}
                        </Mutation>
                );
        }
}

export default RequestReset;
