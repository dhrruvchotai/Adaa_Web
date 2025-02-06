import React, { useEffect, useState } from "react";
import useUserDetails from "../../useUserDetails";
import { getWishlistByEmail, getProductByIdForWishlist } from "../API";
import ProductCard from "../../../components/shopping-view/ProductCard";

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
                    const response = await getWishlistByEmail(userData.Email);

                    if (response && response.wishlist) {
                        const productIds = response.wishlist;
                        const products = await Promise.all(
                            productIds.map(async (productId) => {
                                const productData = await getProductByIdForWishlist(productId);
                                return productData;
                            })
                        );
                        setWishlistProducts(products);
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
            <div className="row">
                <h3 className="fw-medium fs-2 mt-1 mb-3" style={{color:"white"}}>Your Wishlist</h3>
                <hr />
            </div>
            <div className="row">
                {wishlistProducts.length === 0 ? (
                    <p>No items in your wishlist.</p>
                ) : (
                    wishlistProducts.map((product) => (
                        <div key={product._id} className="col-md-3">
                            <ProductCard productId={product._id} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}



export default WishlistPage;
