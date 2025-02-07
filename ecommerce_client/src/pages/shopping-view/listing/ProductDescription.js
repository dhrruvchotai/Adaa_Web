import React, { useEffect, useState } from "react";
import "./style.css";
import useUserDetails from "../../useUserDetails";
import { useLocation, useNavigate } from "react-router-dom";
import {
    getCartByEmail,
    addToCartAPI,
    removeFromCartAPI,
    getProductStock,
    addToWishlistAPI,
    getWishlistByEmail,
    addReviewAPI,
    getReviewsAPI
} from "../API";
import Swal from "sweetalert2";

function ShoppingProductDescription() {
    const { userData, isUserDataReady } = useUserDetails();
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [isInCart, setIsInCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [review, setReview] = useState("");
    const [reviews, setReviews] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const product = location.state?.product;
    const fromPage = location.state?.from || "listing";

    useEffect(() => {
        const fetchCartAndWishlist = async () => {
            if (isUserDataReady && userData?.Email) {
                try {
                    const [userCart, userWishlist] = await Promise.all([
                        getCartByEmail(userData.Email),
                        getWishlistByEmail(userData.Email),
                    ]);

                    const cartIds = userCart?.Cart || [];
                    const wishlistIds = userWishlist?.wishlist || [];

                    setCart(cartIds);
                    setWishlist(wishlistIds);

                    setIsInCart(cartIds.includes(product?.No));
                    setIsInWishlist(wishlistIds.includes(product?._id));
                } catch (error) {
                    console.error("Failed to fetch cart or wishlist:", error);
                }
            }
        };

        fetchCartAndWishlist();
    }, [isUserDataReady, userData?.Email, product]);

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
        if (isOutOfStock) return;

        try {
            if (isInCart) {
                await removeFromCartAPI(userData.Email, product.No);
                setCart((prev) => prev.filter((id) => id !== product.No));
            } else {
                await addToCartAPI(userData.Email, product.No);
                setCart((prev) => [...prev, product.No]);
            }
            setIsInCart(!isInCart);
        } catch (error) {
            console.error("Failed to update cart:", error);
        }
    };

    const handleAddToWishlistOrRemove = async () => {
        try {
            const productId = product._id;

            const updatedWishlist = isInWishlist
                ? wishlist.filter((id) => id !== productId)
                : [...wishlist, productId];

            setWishlist(updatedWishlist);
            setIsInWishlist(!isInWishlist);

            await addToWishlistAPI(userData.Email, productId);
        } catch (error) {
            console.error("Failed to update wishlist:", error);
        }
    };

    useEffect(() => {
        const fetchReviews = async () => {
            if (product?.No) {
                try {
                    const fetchedReviews = await getReviewsAPI(product.No);
                    setReviews(fetchedReviews);
                } catch (error) {
                    console.error("Failed to fetch reviews:", error);
                }
            }
        };

        fetchReviews();
    }, [product?.No]);

    const handleReviewSubmit = async () => {
        if (!review.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Review can't be empty!",
            });
            return;
        }

        try {
            await addReviewAPI(product.No, userData.Username, review);
            setReviews([...reviews, { username: userData.Username, review }]);
            setReview("");
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "We value your feedback. Thanks for the review!",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            console.error("Failed to submit review:", error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Failed to save review! Please try again later!",
            });
        }
    };

    const handleBackClick = () => {
        switch (fromPage) {
            case "search":
                navigate("/shopping/search");
                break;
            case "wishlist":
                navigate("/shopping/wishlist");
                break;
            case "home":
                navigate("/shopping");
                break;
            case "cart":
                navigate("/shopping/cart");
                break;
            default:
                navigate("/shopping/listing");
        }
    };

    return (
        <div className="product-description-page container py-5">
            <div className="row flex-wrap">
                <div className="col-md-6 d-flex align-items-start image">
                    <i
                        className="bi bi-arrow-left-circle-fill me-3 product-back-arrow"
                        onClick={handleBackClick}
                    ></i>
                    <img
                        src={product.Image}
                        alt={product.Title}
                        className="img-fluid"
                        style={{ height: "100%", objectFit: "cover",maxWidth :"450px"}}
                    />
                </div>
                <div className="col-md-6">
                    <h3 style={{color:"white"}} className="fs-2">{product.Title}</h3>
                    <p style={{color : "#6c757d"}}>{product.Details}</p>
                    <p className="text-light fs-5 ">
                        Category : <span className="text-light">{product.Category}</span>
                    </p>
                    <p className="text-light">
                        Brand : <span style={{color:"gold"}}>{product.Brand}</span>
                    </p>
                    <p className="text-light">
                        Price : <span style={{color:"greenyellow"}}>₹{product.SalePrice}</span>
                    </p>

                    <div className="mt-4">
                        <button
                            type="button"
                            className={`btn ${isInCart
                                    ? "btn-danger"
                                    : isOutOfStock
                                        ? "btn-secondary"
                                        : "btn-primary"
                                }`}
                            
                            onClick={handleAddToCartOrRemove}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock
                                ? "Out of Stock"
                                : isInCart
                                    ? "Remove from Cart"
                                    : "Add to Cart"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-warning ms-3"
                            onClick={handleAddToWishlistOrRemove}
                        >
                            {isInWishlist ? (
                                <>
                                    <i className="bi bi-heart-fill me-2"></i> Remove from
                                    Wishlist
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-heart me-2"></i> Add to Wishlist
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-4">
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Write your review here..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn btn-primary mt-2"
                            onClick={handleReviewSubmit}
                        >
                            Submit Review
                        </button>
                    </div>

                    <div className="mt-4">
                        <h5 style={{color:"#fcbf49"}}>Reviews:</h5>
                        {reviews.length > 0 ? (
                            reviews.map((r, index) => (
                                <div key={index} className="review-item text-light">
                                    <strong className="review-username">{r.username}</strong>
                                    <p className="review-text" style={{color:"#eae2b7"}}>{r.review}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-danger">No reviews yet. Be the first to review!</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default ShoppingProductDescription;