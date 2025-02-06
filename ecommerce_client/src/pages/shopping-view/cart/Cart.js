import React, { useEffect, useState } from "react";
import "./cart-style.css";
import { getCartByEmail, getProductByIdForCart, removeFromCartAPI } from "../API";
import useUserDetails from "../../useUserDetails";
import { useNavigate } from "react-router-dom";
import { ShoppingCart as CartIcon } from 'lucide-react';

function ShoppingCart() {
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { userData, isUserDataReady } = useUserDetails();

    const handleCardClick = (product) => {
        navigate(`/shopping/listing/${product.No}`, { state: { product, from: "cart" } });
    };

    const handleRemoveFromCart = async (productId) => {
        if (!userData?.Email) return;
        try {
            await removeFromCartAPI(userData.Email, productId);
            setCartProducts(prevCart => prevCart.filter(productArray => productArray[0]?.No !== productId));
        } catch (error) {
            console.error("Failed to remove product from cart:", error);
        }
    };

    const calculateTotal = () => {
        return cartProducts.reduce((total, productArray) => {
            return total + (productArray[0]?.SalePrice || 0);
        }, 0);
    };

    useEffect(() => {
        const fetchCartProducts = async () => {
            if (isUserDataReady && userData?.Email) {
                try {
                    setLoading(true);
                    const user = await getCartByEmail(userData.Email);
                    const productIds = Array.isArray(user?.Cart) ? user.Cart : [];
                    const products = await Promise.all(
                        productIds.map(async (productId) => {
                            return await getProductByIdForCart(productId);
                        })
                    );
                    setCartProducts(products);
                } catch (error) {
                    console.error("Failed to fetch cart products:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCartProducts();
    }, [isUserDataReady, userData?.Email]);

    if (loading) {
        return (
            <div className="shopping-cart-page d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="shopping-cart-page d-flex align-items-center">
            <div className="container">
                <div className="cart-header text-center d-flex flex-row align-items-center justify-content-between">
                    <h1 className="display-5 d-flex align-items-center">
                        <CartIcon className="me-3" size={32} />
                        Shopping Cart
                    </h1>
                    <span className="badge bg-primary rounded-pill fs-5">
                        {cartProducts.length} items
                    </span>
                </div>

                {cartProducts.length > 0 ? (
                    <div className="d-flex flex-column align-items-center">
                        <div className="cart-items w-100 d-flex flex-column align-items-center">
                            {cartProducts.map((productArray, index) => (
                                <div
                                    className="cart-item w-75"
                                    key={index}
                                    onClick={() => handleCardClick(productArray[0])}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="row g-0">
                                        <div className="col-md-4">
                                            <img
                                                src={productArray[0]?.Image || "/placeholder.jpg"}
                                                alt={productArray[0]?.Title || "Product"}
                                                className="cart-item-image"
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <div className="cart-item-details">
                                                <h3 className="cart-item-title">{productArray[0]?.Title}</h3>
                                                <p className="cart-item-price">₹{(productArray[0]?.SalePrice || 0).toLocaleString()}</p>
                                                <p className="cart-item-category">
                                                    {productArray[0]?.Category || "No category available"}
                                                </p>
                                                <button className="btn btn-outline-danger btn-sm mt-2" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        if (productArray[0]?.No) handleRemoveFromCart(productArray[0]?.No); 
                                                    }}>
                                                    Remove from Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="cart-summary-container w-75 mt-4">
                            <div className="cart-summary p-3">
                                <h3>Order Summary</h3>
                                <div className="summary-item">
                                    <span>Subtotal</span>
                                    <span>₹{calculateTotal().toLocaleString()}</span>
                                </div>
                                <div className="summary-item">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-item">
                                    <span>Tax</span>
                                    <span>₹{(calculateTotal() * 0.18).toLocaleString()}</span>
                                </div>
                                <div className="summary-item summary-total">
                                    <span>Total</span>
                                    <span>₹{(calculateTotal() * 1.18).toLocaleString()}</span>
                                </div>
                                <button
                                    className="proceed-to-buy-btn w-100 mt-3"
                                    onClick={() => navigate('/shopping/checkout')}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart text-center">
                        <CartIcon size={64} className="mb-4 text-muted" />
                        <p>Your cart is empty</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/shopping')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShoppingCart;
