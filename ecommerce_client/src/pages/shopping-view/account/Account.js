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
    const isAdmin=false;

    useEffect(() => {
        fetchProducts().then((res) => {
            setOrderItems(res);
        });
    }, []);

    const handleOrderClick = (order) => {
        const enrichedItems = order.Items.map((item) => {
            const productDetails = orderItems.find(
                (product) => product.No === item
            );
            return {
                ...item,
                productDetails,
            };
        });
        setSelectedOrder({ ...order, enrichedItems });
    };

    useEffect(() => {
        if (isUserDataReady && userData?.Email) {
            getOrdersByEmail(userData.Email)
                .then((data) => {
                    setOrders(data);
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
        <div
            className="shopping-account-container"
            style={{
                minHeight: "91.3vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f4f4f4",
                padding: "20px",
            }}
        >
            {isUserDataReady ? (
                <div
                    className="shopping-account-card"
                    style={{
                        backgroundColor: "#fff",
                        padding: "30px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        textAlign: "center",
                        maxWidth: "600px",
                        width: "100%",
                    }}
                >
                    <h1
                        style={{
                            color: "#150647",
                            fontSize: "2.5rem",
                            fontWeight: "bold",
                            marginBottom: "20px",
                        }}
                    >
                        Welcome, {userData.Username}!
                    </h1>
                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "#555",
                            marginBottom: "30px",
                            lineHeight: "1.5",
                        }}
                    >
                        Here's your account information:
                    </p>
                    <ul
                        style={{
                            listStyleType: "none",
                            padding: 0,
                            textAlign: "left",
                            fontSize: "1rem",
                            color: "#333",
                        }}
                    >
                        <li style={{ marginBottom: "10px" }}>
                            <strong>Email:</strong> {userData.Email}
                        </li>
                        <li style={{ marginBottom: "10px" }}>
                            <strong>Phone:</strong> {userData.Phone}
                        </li>
                    </ul>

                    <h2
                        style={{
                            marginTop: "40px",
                            color: "#150647",
                            fontSize: "1.8rem",
                            fontWeight: "bold",
                        }}
                    >
                        Your Orders
                    </h2>
                    {isLoadingOrders ? (
                        <p style={{ fontSize: "1.2rem", color: "#999" }}>
                            Loading your orders...
                        </p>
                    ) : orders.length > 0 ? (
                        <div
                            className="orders-list"
                            style={{
                                marginTop: "20px",
                                textAlign: "left",
                                width: "100%",
                            }}
                        >
                            {orders.map((order) => (
                                <div
                                    key={order.No}
                                    className="order-card"
                                    onClick={() => handleOrderClick(order)}
                                    style={{
                                        backgroundColor: "#f9f9f9",
                                        padding: "15px",
                                        marginBottom: "15px",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <p>
                                        <strong>Date:</strong> {parseDateString(order.OrderDate).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <strong>Items:</strong> {order.Items.length}
                                    </p>
                                    <p>
                                        <strong>Total:</strong> ₹{order.TotalAmount}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p
                            style={{
                                fontSize: "1.2rem",
                                color: "#999",
                            }}
                        >
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
                <p
                    style={{
                        fontSize: "1.5rem",
                        color: "#999",
                    }}
                >
                    Loading your account details...
                </p>
            )}
        </div>
    );
}

export default ShoppingAccount;