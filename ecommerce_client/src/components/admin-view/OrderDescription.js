import React, { useState, useEffect } from "react";
import { getUserByEmail } from "../../pages/admin-view/API";
import "./style.css";

function OrderDescription({ order, closePopup, isAdmin }) {
  const [userData, setUserData] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

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

  const handleClose = () => {
    setIsVisible(false);
    closePopup();
  };

  return (
    <div className={`order-description-popup-container ${isVisible ? "visible" : "hidden"}`} style={{width:"120vw"}}>
      <div className="order-description-popup">
        <button className="popup-close-btn mt-5" onClick={handleClose}>
          &times;
        </button>
        <h3 className="order-id fs-4 mb-3">
          {isAdmin ? `Order ID: ${order.No}` : 'Order'}
        </h3>

        {isAdmin && (
          <div className="customer-details">
            <h4 className="section-title">Customer Details</h4>
            <p className="detail">
              <strong>Email:</strong> {userData.Email}
            </p>
            <p className="detail">
              <strong>Username:</strong> {userData.Username}
            </p>
            <p className="detail">
              <strong>Phone:</strong> {userData.Phone}
            </p>
          </div>
        )}

        <h4 className="order-date">Order Date: {order.OrderDate}</h4>

        <h4 className="products-title">Products</h4>
        <table className="products-table">
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
                <td>{isAdmin ? item.productDetails.No : index + 1}</td>
                <td>{item.productDetails.Title}</td>
                <td>{item.productDetails.Category}</td>
                <td>{item.productDetails.SalePrice}</td>
                <td>{item.Quantity ?? 1}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="payment-method">
          <strong>Payment Method:</strong> {order.PaymentMethod}
        </div>
        <div className="total-amount">
          <strong>Total Amount:</strong> {order.TotalAmount}
        </div>
      </div>
    </div>
  );
}

export default OrderDescription;