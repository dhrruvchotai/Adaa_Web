import React, { useEffect, useState } from "react";
import './style.css';
import useUserDetails from "../../pages/useUserDetails";
import { getCartByEmail, addToCartAPI, removeFromCartAPI, getProductStock, addToWishlistAPI, removeFromWishlistAPI, getWishlistByEmail } from "../../pages/shopping-view/API";

function ProductDescription({ product, closeModal, updateCart }) {
    const { userData, isUserDataReady } = useUserDetails();
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isInCart, setIsInCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isOutOfStock, setIsOutOfStock] = useState(false);

    useEffect(() => {
        const fetchCartAndWishlist = async () => {
            if (isUserDataReady && userData?.Email) {
                try {
                    const userCart = await getCartByEmail(userData.Email);
                    const cartIds = userCart?.Cart || [];
                    setCart(cartIds);

                    const userWishlist = await getWishlistByEmail(userData.Email);
                    const wishlistIds = userWishlist?.Wishlist || [];
                    setWishlist(wishlistIds);
                } catch (error) {
                    console.error("Failed to fetch cart or wishlist products:", error);
                }
            }
        };
        fetchCartAndWishlist();
    }, [isUserDataReady, userData?.Email]);

    useEffect(() => {
        if (cart && product?.No) {
            setIsInCart(cart.includes(product.No));
        }
    }, [cart, product]);

    useEffect(() => {
        if (wishlist && product?.No) {
            setIsInWishlist(wishlist.includes(product.No));
        }
    }, [wishlist, product]);

    useEffect(() => {
        const fetchStockStatus = async () => {
            if (product?.No) {
                try {
                    const stock = await getProductStock(product.No);
                    setIsOutOfStock(stock <= 0);
                } catch (error) {
                    console.error("Failed to fetch product stock:", error);
                }
            }
        };
        fetchStockStatus();
    }, [product?.No]);

    const handleAddToCartOrRemove = async () => {
        if (isOutOfStock) {
            console.log("Product is out of stock");
            return;
        }

        try {
            if (isInCart) {
                await removeFromCartAPI(userData.Email, product.No);
                const updatedCart = cart.filter((id) => id !== product.No);
                setCart(updatedCart);
                if (updateCart) {
                    updateCart(updatedCart);
                }
            } else {
                await addToCartAPI(userData.Email, product.No);
                const updatedCart = [...cart, product.No];
                setCart(updatedCart);
                if (updateCart) {
                    updateCart(updatedCart);
                }
            }
            setIsInCart(!isInCart);
            closeModal();
        } catch (error) {
            console.error("Failed to update cart:", error);
        }
    };

    const handleAddToWishlistOrRemove = async () => {
        const productId = product._id;  // Assuming product._id is the unique identifier

        // Optimistic update of the wishlist state
        const updatedWishlist = isInWishlist 
            ? wishlist.filter((id) => id !== productId) 
            : [...wishlist, productId];

        setWishlist(updatedWishlist);
        setIsInWishlist(!isInWishlist);

        try {
            if (isInWishlist) {
                // Remove product from wishlist
                await removeFromWishlistAPI(userData.Email, productId);
            } else {
                // Add product to wishlist
                await addToWishlistAPI(userData.Email, productId);
            }
        } catch (error) {
            console.error("Failed to update wishlist:", error);
            // If API call fails, roll back the optimistic update
            setWishlist(wishlist);
            setIsInWishlist(isInWishlist);
        }
    };

    return (
        <div className="modal modal-backdrop-custom show p-5" style={{ display: "block" }} tabIndex="-1" aria-labelledby="productModalLabel">
            <div className="modal-dialog modal-lg">
                <div className="modal-content p-3">
                    <div className="modal-body d-flex">
                        <div className="w-50 pe-3">
                            <img src={product.Image} alt={product.Title} className="img-fluid" style={{ height: "100%", objectFit: "cover" }} />
                        </div>
                        <div className="w-50 ps-3">
                            <div className="h3 pb-3">{product.Title}</div>
                            <p style={{ fontSize: "17px" }}>{product.Details}</p>
                            <p className="text-secondary">
                                Category:
                                <span className="text-black fw-bold ms-2" style={{ fontSize: "18px" }}>
                                    {product.Category}
                                </span>
                            </p>
                            <p className="text-secondary">
                                Brand:
                                <span className="text-black fw-bold ms-2" style={{ fontSize: "18px" }}>
                                    {product.Brand}
                                </span>
                            </p>
                            <p className="text-secondary">
                                Price:
                                <span className="text-black fw-bold ms-2" style={{ fontSize: "18px" }}>
                                    ₹{product.SalePrice}
                                </span>
                            </p>
                            <div className="modal-footer mt-5">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={closeModal}>Close</button>
                                <button type="button" className={`btn ${isInCart ? "btn-danger" : isOutOfStock ? "btn-secondary" : "btn-primary"}`} onClick={handleAddToCartOrRemove} disabled={isOutOfStock}>
                                    {isOutOfStock ? "Out of Stock" : isInCart ? "Remove from Cart" : "Add to Cart"}
                                </button>
                                <button type="button" className={`btn ${isInWishlist ? "btn-warning" : "btn-outline-warning"}`} onClick={handleAddToWishlistOrRemove}>
                                    {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDescription;
