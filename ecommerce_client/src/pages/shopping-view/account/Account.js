import React, { useState, useEffect } from "react";
import useUserDetails from "../../useUserDetails";
import { getOrdersByEmail, fetchProducts } from "../API";
import './account-style.css';
import OrderDescription from "../../../components/admin-view/OrderDescription";

function ShoppingAccount() {
    const { userData, isUserDataReady } = useUserDetails();
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const isAdmin = false;

    useEffect(() => {
        fetchProducts().then((res) => {
            setOrderItems(res.reverse());
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

    useEffect(() => {
        if (isUserDataReady && userData?.Email) {
            getOrdersByEmail(userData.Email)
                .then((data) => {
                    setOrders(data.reverse());
                    setIsLoadingOrders(false);
                })
                .catch((error) => {
                    console.error("Error fetching orders:", error);
                    setIsLoadingOrders(false);
                });
        }
    }, [isUserDataReady, userData?.Email]);

    const parseDateString = (dateString) => {
        const [day, month, year] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const closePopup = () => {
        setSelectedOrder(null);
    };

    return (
        <div className="shopping-account-container">
            {isUserDataReady ? (
                <div className="shopping-account-card">
                    <h1 className="welcome-heading">
                        Welcome, <span className="username">{userData.Username}</span>!
                    </h1>
                    <p className="account-info-text">
                        Here's your account information:
                    </p>
                    <ul className="account-info-list">
                        <li>
                            <strong>Email:</strong> {userData.Email}
                        </li>
                        <li>
                            <strong>Phone:</strong> {userData.Phone}
                        </li>
                    </ul>

                    <h2 className="orders-heading">
                        Your Orders
                    </h2>
                    {isLoadingOrders ? (
                        <p className="loading-text">
                            Loading your orders...
                        </p>
                    ) : orders.length > 0 ? (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div
                                    key={order.No}
                                    className="order-card"
                                    onClick={() => handleOrderClick(order)}
                                >
                                    <p>
                                        <strong>Date:</strong> {parseDateString(order.OrderDate).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>Items:</strong> {order.Items.reduce((sum, item) => sum + item.Quantity, 0)}
                                    </p>
                                    <p>
                                        <strong>Total:</strong> ₹{order.TotalAmount}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-orders-text">
                            You have no orders yet.
                        </p>
                    )}  

                    {selectedOrder && (
                        <OrderDescription
                            order={selectedOrder}
                            closePopup={closePopup}
                            isAdmin={isAdmin}
                        />
                    )}
                </div>
            ) : (
                <p className="loading-text">
                    Loading your account details...
                </p>
            )}
        </div>
    );
}

export default ShoppingAccount;