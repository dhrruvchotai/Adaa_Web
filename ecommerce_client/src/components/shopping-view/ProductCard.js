import React, { useState, useEffect } from 'react';
import { getProductByIdForWishlist } from '../../pages/shopping-view/API'; // Ensure this fetches the full product

function ProductCard({ productId }) {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const data = await getProductByIdForWishlist(productId);  // Fetch product data using the productId
                console.log('Fetched product:', data); // Log the fetched product data
                
                if (data) {
                    setProduct(data);  // Assuming the data is the full product object
                } else {
                    console.log('No product found for the given ID.');
                    setProduct(null); // Set null if no product found
                }
            } catch (error) {
                console.error("Failed to fetch product details:", error);
                setProduct(null); // Handle error case
            }
        };
    
        fetchProductDetails();
    }, [productId]);  // Re-fetch if productId changes

    if (!product) {
        return <div>Loading product details...</div>; // Add loading message while the product is being fetched
    }

    return (
        <div className="product-card" key={product._id}>
            <h5>{product.Title}</h5>
            <p>{product.Details}</p>
            <p>{product.SalePrice}</p>
        </div>
    );
}

export default ProductCard;
