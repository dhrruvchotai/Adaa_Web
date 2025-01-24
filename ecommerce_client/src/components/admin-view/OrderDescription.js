import React, { useState, useEffect } from "react";
import { getUserByEmail } from "../../pages/admin-view/API";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "./style.css";

function OrderDescription({ order, closePopup, isAdmin }) {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      const fetchUserData = async () => {
        try {
          const data = await getUserByEmail(order.Email);
          if (data != null) {
            setUserData(data);
          } else {
            console.log("User not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [isAdmin, order.Email]);

  return (
    <Popup 
        open={true} 
        onClose={closePopup}
        contentStyle={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
            padding: "20px",
            background: "white",
            maxWidth: "850px",
            maxHeight: "100vh",
            overflowY: "auto",
            backgroundColor: "#37ab96",
            border: "3px solid black"
          }}
    >
      <div className="popup-content">
        <button onClick={closePopup}>&times;</button>
        <h3>Order ID: {order.No}</h3>

        {isAdmin && (
          <div className="text-start py-3">
            <h4 className="text-center">Customer Details</h4>
            <p>
              <strong>Email:</strong> {userData.Email}
            </p>
            <p>
              <strong>Username:</strong> {userData.Username}
            </p>
            <p>
              <strong>Phone:</strong> {userData.Phone}
            </p>
          </div>
        )}

        <h4>Order Date: {order.OrderDate}</h4>

        <h4>Products</h4>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.enrichedItems.map((item, index) => (
              <tr key={index}>
                <td>{item.productDetails.No}</td>
                <td>{item.productDetails.Title}</td>
                <td>{item.productDetails.Category}</td>
                <td>{item.productDetails.SalePrice}</td>
                <td>{item.productDetails.Quantity ?? 1}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <strong>Payment Method:</strong> {order.PaymentMethod}
        </div>
        <div>
          <strong>Total Amount:</strong> {order.TotalAmount}
        </div>
      </div>
    </Popup>
  );
}

export default OrderDescription;