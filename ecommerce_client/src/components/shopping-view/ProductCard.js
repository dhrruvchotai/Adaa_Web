import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductByIdForWishlist } from '../../pages/shopping-view/API';
import './style.css';

function ProductCard({ productId }) {
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const data = await getProductByIdForWishlist(productId);

                if (data) {
                    setProduct(data);
                } else {
                    console.log('No product found for the given ID.');
                    setProduct(null);
                }
            } catch (error) {
                console.error("Failed to fetch product details:", error);
                setProduct(null);
            }
        };

        fetchProductDetails();
    }, [productId]);

    const handleCardClick = (product) => {
        if (product?.No) {
            navigate(`/shopping/listing/${product.No}`, { state: { product, from: "wishlist" } });
        }
    };

    return (
        <div
            className="product-card-wishlist"
            onClick={() => product && handleCardClick(product)}
            style={{ cursor: product ? 'pointer' : 'default' }}
        >
            {product ? (
                <>
                    <div className="product-image-wishlist">
                        <img src={product.Image} alt={product.Title} className="img-fluid" />
                    </div>
                    <div className="product-details-wishlist">
                        <h5 className="product-title-wishlist">{product.Title}</h5>
                        <p className="product-description-wishlist">{product.Details}</p>
                        <p className="product-price-wishlist">₹{product.SalePrice}</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="product-image-wishlist skeleton"></div>
                    <div className="product-details-wishlist">
                        <h5 className="product-title-wishlist skeleton">Loading...</h5>
                        <p className="product-description-wishlist skeleton">Loading...</p>
                        <p className="product-price-wishlist skeleton">₹ --</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProductCard;