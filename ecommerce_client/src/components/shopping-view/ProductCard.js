import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductByIdForWishlist } from '../../pages/shopping-view/API';
import './style.css';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Card = styled(motion.div)`
  background: black;
  border-radius: 10px;
  color: white;
  min-height: 15vh;
  min-width: 18rem;
  opacity: 0.9;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: scale(1.01);
  }
`;


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
            onClick={() => product && handleCardClick(product)}
            style={{ cursor: product ? 'pointer' : 'default' }}
        >
            {product ? (
                 <Card 
                className='mt-3 p-3'
                 style={{ backgroundColor: "black", border: "1px solid grey", cursor: "pointer", height : "45vh"}}
                 onClick={handleCardClick}
             >
                 <motion.div 
                     className="card-img-top"
                     whileHover={{ scale: 1.03 }}
                     whileTap={{ scale: 0.95 }}
                 >
                     <img
                         src={product.Image}
                         alt={product.Title}
                         className="img-fluid"
                         style={{ height: "200px", objectFit: "cover", width: "100%" }}
                     />
                 </motion.div>
     
                 <div className="card-body d-flex flex-column">
                     <h5 className="fw-medium text-white mt-4">{product.Title}</h5>
                     <div className="d-flex justify-content-between">
                         <p className="mb-0 text-warning" style={{ fontSize: "17px" }}>{product.Brand}</p>
                         <p className="fw-medium fs-5 text-success mb-0">₹{product.SalePrice}</p>
                     </div>
                 </div>
             </Card>
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