import PleaseSignIn from "../components/PleaseSignIn";
import OrdersList from "../components/OrderList";

const OrdersPage = props => (
        <div>
                <PleaseSignIn>
                        <OrdersList />
                </PleaseSignIn>
        </div>
);

export default OrdersPage;
