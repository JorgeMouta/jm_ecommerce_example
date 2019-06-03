import React, { Component } from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";

const SIGN_OUT_MUTATION = gql`
        mutation SIGN_OUT_MUTATION {
                signout {
                        message
                }
        }
`;

const Signout = props => (
        <Mutation refetchQueries={[{ query: CURRENT_USER_QUERY }]} mutation={SIGN_OUT_MUTATION}>
                {signout => (
                        <button onClick={signout} type="button">
                                Sign Out
                        </button>
                )}
        </Mutation>
);

export default Signout;
