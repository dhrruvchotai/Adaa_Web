import React, { useEffect, useState } from "react";
import useUserDetails from "../../pages/useUserDetails";
import { getWishlistByEmail, getProductByIdForWishlist } from "../../pages/shopping-view/API";
import ProductCard from "./ProductCard";

function WishlistPage() {
    const { userData, isUserDataReady } = useUserDetails();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (isUserDataReady && userData?.Email) {
                setLoading(true);
                setError(null);
                try {
                    console.log('Email:', userData.Email);
                    
                    const response = await getWishlistByEmail(userData.Email);
                    console.log('Wishlist response:', response); // Check the raw response

                    // If the wishlist is empty or has products, fetch the details for each product
                    if (response && response.wishlist) {
                        const productIds = response.wishlist;
                        const products = await Promise.all(
                            productIds.map(async (productId) => {
                                const productData = await getProductByIdForWishlist(productId);
                                return productData; // Return the product data
                            })
                        );
                        setWishlistProducts(products);  // Set full product data
                    }
                } catch (err) {
                    setError("Failed to fetch wishlist. Please try again.");
                    console.error("Failed to fetch wishlist products:", err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchWishlist();
    }, [isUserDataReady, userData?.Email]);

    if (loading) {
        return <div>Loading your wishlist...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container py-5">
            <h3>Your Wishlist</h3>
            <div className="row">
                {wishlistProducts.length === 0 ? (
                    <p>No items in your wishlist.</p>
                ) : (
                    wishlistProducts.map((product) => (
                        <div key={product._id} className="col-md-4">
                            <ProductCard productId={product._id} />  {/* Pass product ID */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default WishlistPage;
