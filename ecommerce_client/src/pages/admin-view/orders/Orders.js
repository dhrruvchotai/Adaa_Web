import { useEffect, useState } from "react";
import { fetchOrders, fetchProducts } from "../API";
import OrderDescription from "../../../components/admin-view/OrderDescription";

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const isAdmin=true;

    useEffect(() => {
        const getOrders = async () => {
            try {
                const data = await fetchOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };

        getOrders();
    }, []);

    useEffect(() => {
            fetchProducts().then((res) => {
                setOrderItems(res);
            });
        }, []);

    const handleOrderClick = (order) => {
        const enrichedItems = order.Items.map((item) => {
            const productDetails = orderItems.find(
                (product) => product.No === item.No
            );
    
            if (productDetails) {
                return {
                    ...item,
                    productDetails,
                };
            } else {
                return item;
            }
        });
        setSelectedOrder({ ...order, enrichedItems });
    };

    const closePopup = () => {
        setSelectedOrder(null);
    };

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col text-center fw-bold" style={{ fontSize: "45px" }}>
                    Orders
                </div>
            </div>
            <div className="row my-4">
                <div className="col">
                    <table className="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Order Date</th>
                                <th>Payment Method</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.No} onClick={() => handleOrderClick(order)} style={{ cursor: "pointer" }}>
                                    <td>{order.No}</td>
                                    <td>{order.OrderDate}</td>
                                    <td>{order.PaymentMethod}</td>
                                    <td>{order.TotalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDescription
                    order={selectedOrder}
                    closePopup={closePopup}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}

export default AdminOrders;