import React, { Component } from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Head from "next/head";
import Link from "next/link";
import PaginationStyles from "./styles/PaginationStyles";
import { perPage } from "../config";

const PAGINATION_QUERY = gql`
        query PAGINATION_QUERY {
                itemsConnection {
                        aggregate {
                                count
                        }
                }
        }
`;

class Pagination extends Component {
        render() {
                const { page } = this.props;
                return (
                        <Query query={PAGINATION_QUERY}>
                                {({ error, loading, data }) => {
                                        if (loading) return <p>Loading...</p>;
                                        const { count } = data.itemsConnection.aggregate;
                                        const pages = Math.ceil(count / perPage);

                                        return (
                                                <PaginationStyles>
                                                        <Head>
                                                                <title>
                                                                        Sick Fits! - {page} of {pages}
                                                                </title>
                                                        </Head>
                                                        <Link
                                                                prefetch
                                                                href={{
                                                                        pathname: "items",
                                                                        query: { page: page - 1 },
                                                                }}
                                                        >
                                                                <a className="prev" aria-disabled={page <= 1}>
                                                                        ← Prev
                                                                </a>
                                                        </Link>
                                                        <p>
                                                                Page {page} of {pages}
                                                        </p>
                                                        <p>{count} total items </p>
                                                        <Link
                                                                prefetch
                                                                href={{
                                                                        pathname: "items",
                                                                        query: { page: page + 1 },
                                                                }}
                                                        >
                                                                <a className="next" aria-disabled={page >= pages}>
                                                                        Next →
                                                                </a>
                                                        </Link>
                                                </PaginationStyles>
                                        );
                                }}
                        </Query>
                );
        }
}

export default Pagination;
