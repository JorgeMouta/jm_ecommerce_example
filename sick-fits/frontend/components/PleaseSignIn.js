import { Query } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";
import Signin from "./Signin";

const PleaseSignIn = props => (
        <div>
                <Query query={CURRENT_USER_QUERY}>
                        {({ data, loading }) => {
                                if (loading) return <p>Loading...</p>;
                                if (!data.me)
                                        return (
                                                <div>
                                                        <p>Please Sign In!</p>
                                                        <Signin />
                                                </div>
                                        );
                                return props.children;
                        }}
                </Query>
        </div>
);

export default PleaseSignIn;
