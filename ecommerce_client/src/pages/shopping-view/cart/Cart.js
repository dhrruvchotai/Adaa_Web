import React, { useEffect, useState } from "react";
import "./cart-style.css";
import { getCartByEmail, getProductByIdForCart } from "../API";
import useUserDetails from "../../useUserDetails"; 
import { useNavigate } from "react-router-dom";

function ShoppingCart() {
    const [cartProducts, setCartProducts] = useState([]);

    const navigate=useNavigate();

    const handleCardClick = (product) => {
        navigate(`/shopping/listing/${product.No}`, { state: { product, from: "cart" } });
    };

    const { userData, isUserDataReady } = useUserDetails();

    useEffect(() => {
        const fetchCartProducts = async () => {
            if (isUserDataReady && userData?.Email) {
                try {
                    const user = await getCartByEmail(userData.Email);
                    const productIds = user?.Cart || [];
                    const products = await Promise.all(
                        productIds.map(async (productId) => {
                            return await getProductByIdForCart(productId);
                        })
                    );
                    setCartProducts(products);
                } catch (error) {
                    console.error("Failed to fetch cart products:", error);
                }
            }
        }
        fetchCartProducts();
    }, [isUserDataReady, userData?.Email]);

    return (
        <div className="shopping-cart-page">
            <div className="shopping-cart mx-auto">
                <h1>Shopping Cart</h1>
                {cartProducts.length > 0 ? (
                    <div className="cart-items">
                        {cartProducts.map((productArray, index) => (
                            <div className="cart-item" key={index} onClick={() => handleCardClick(productArray[0])}>
                                <img
                                    src={productArray[0]?.Image || "/placeholder.jpg"}
                                    alt={productArray[0]?.Title || "Product"}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <h3 className="cart-item-title">{productArray[0]?.Title}</h3>
                                    <p className="cart-item-price">Price: ₹{productArray[0]?.SalePrice}</p>
                                    <p className="cart-item-category">
                                        {productArray[0]?.Category || "No category available."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Your cart is empty.</p>
                )}
                {cartProducts.length > 0 && (
                    <button className="proceed-to-buy-btn" onClick={() => navigate('/shopping/checkout')}>
                        Proceed to Buy
                    </button>
                )}
            </div>
        </div>
    );
}

export default ShoppingCart;