import React, { useEffect, useState } from "react";
import { getProductByIdForCart } from "../API";
import "./cart-style.css";
import ProductDescription from '../../../components/shopping-view/ProductDescription';
import { removeFromCartAPI, getCartByEmail } from "../API";
import useUserDetails from "../../useUserDetails"; 
import { useNavigate } from "react-router-dom";

function ShoppingCart() {
    const [cartProducts, setCartProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const navigate=useNavigate();

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
        console.log(cartProducts)
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
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

    const removeFromCart = async (productId) => {
        try {
            const response = await removeFromCartAPI(userData.Email, productId);
            if (response.error) {
                console.error("Failed to remove product:", response.error);
                return;
            }
            if (response.updatedCart) {
                const products = await Promise.all(
                    response.updatedCart.map((productId) => getProductByIdForCart(productId))
                );
                setCartProducts(products);
            } else {
                console.error("Failed to fetch updated cart details.");
            }
        } catch (error) {
            console.error("Error removing product from cart:", error);
        }
    };

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
                {showModal && selectedProduct && (
                    <ProductDescription
                        product={selectedProduct}
                        closeModal={closeModal}
                        removeFromCart={removeFromCart}
                    />
                )}
            </div>
        </div>
    );
}

export default ShoppingCart;