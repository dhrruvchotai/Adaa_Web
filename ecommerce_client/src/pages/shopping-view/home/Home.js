import './home-style.css';
import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, getRecommendations } from '../API';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProductDescription from '../listing/ProductDescription';
import useUserDetails from '../../useUserDetails';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import styled from "styled-components";


const SplitCardsUI = () => {
    const navigate = useNavigate();
    
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{opacity : 0.9}}>
        <div className="w-100 mw-100 h-80 d-flex justify-content-center position-relative">
          {/* Left Card - Men's Section */}
          <motion.div 
            className="position-relative w-50 group cursor-pointer overflow-hidden"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/shopping/listing', { state: { category: "Male" } })}
            style={{height : "60vh",borderRadius : '0.8vw'}}
          >
            <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-primary-subtle transform-skew z-0" />
            <div className="position-relative h-100 d-flex flex-column justify-content-between p-4 z-1">
              <div>
                <h2 className="display-4 fw-bold text-primary mb-2">Men's</h2>
                <p className="text-primary fs-4">Spring Collection 2024</p>
              </div>
              
              <img
                src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800"
                alt="Men's Fashion"
                className="position-absolute end-0 bottom-0 h-90 object-fit-cover transform-scale"
                style={{height:"60vh"}}
              />
              
              <motion.div 
                className="d-flex align-items-center gap-2 text-primary fw-medium z-1"
                whileHover={{ x: 10 }}
              >
                <ShoppingBag size={20} />
                <span>Shop Men</span>
                <ChevronRight size={20} />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Right Card - Women's Section */}
          <motion.div 
            className="position-relative w-50 group cursor-pointer overflow-hidden"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            style={{height : "60vh",borderRadius : '0.8vw'}}
            onClick={() => navigate('/shopping/listing', { state: { category: "Female" } })}
          >
            <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-danger-subtle transform-neg-skew z-0" />
            <div className="position-relative h-100 d-flex flex-column justify-content-between p-4 z-1">
              <div>
                <h2 className="display-4 fw-bold text-danger mb-2">Women's</h2>
                <p className="text-danger fs-4">Spring Collection 2024</p>
              </div>
              
              <img
                src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&q=80&w=800"
                alt="Women's Fashion"
                className="position-absolute end-0 bottom-0 h-90 object-fit-cover transform-scale"
                style={{height:"70vh", width : "20vw"}}
              />
              
              <motion.div 
                className="d-flex align-items-center gap-2 text-danger fw-medium z-1"
                whileHover={{ x: 10 }}
              >
                <ShoppingBag size={20} />
                <span>Shop Women</span>
                <ChevronRight size={20} />
              </motion.div>
            </div>
          </motion.div>
          
    
        </div>
      </div>
    );
};

// Add custom CSS for missing Bootstrap equivalents
const customStyles = `
<style>
  .h-80 {
    height: 80vh;
  }
  
  .h-90 {
    height: 90%;
  }
  
  .transform-skew {
    transform: skewX(6deg);
    transform-origin: top right;
  }
  
  .transform-neg-skew {
    transform: skewX(-6deg);
    transform-origin: top left;
  }
  
  .transform-scale {
    transition: transform 0.5s;
  }
  
  .group:hover .transform-scale {
    transform: scale(1.05);
  }
  
  .cursor-pointer {
    cursor: pointer;
  }
  
  .gap-2 {
    gap: 0.5rem;
  }
  
  .z-0 {
    z-index: 0;
  }
  
  .z-1 {
    z-index: 1;
  }
</style>
`;

function ShoppingHome() {
    const [products, setProducts] = useState([]);
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [error, setError] = useState(null);
    const { userData, isUserDataReady } = useUserDetails();
    const [orderedImages, setOrderedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBackgrounds = async () => {
            try {
                const response = await fetch('https://adaa-web-backend.onrender.com/bgs');
                if (!response.ok) {
                    throw new Error('Failed to fetch backgrounds');
                }
                const data = await response.json();
                const selectedImage = data.find((img) => img.selected === true);
                const otherImages = data.filter((img) => img.selected !== true);

                setOrderedImages(selectedImage
                    ? [selectedImage.URL, ...otherImages.map((img) => img.URL)]
                    : data.map((img) => img.URL))
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBackgrounds();
    }, []);

    useEffect(() => {
        if (userData && userData.Email) {
            const email = userData.Email;

            const fetchRecommendations = async () => {
                try {
                    const recommendations = await getRecommendations(email);
                    if (Array.isArray(recommendations)) {
                        setRecommendedProducts(recommendations);
                    } else {
                        setError("No recommendations available");
                    }
                } catch (err) {
                    setError(err.message);
                }
            };

            fetchRecommendations();
        }
    }, [userData]);

    useEffect(() => {
        fetchProducts().then((res) => {
            const limitedProducts = res.slice().reverse().slice(0, 6);
            setProducts([...limitedProducts]);
        });
    }, []);

    const handleCardClick = (product) => {
        navigate(`/shopping/listing/${product.No}`, { state: { product, from: "home" } });
    };

    const latestSliderRef = useRef(null);
    const recommendedSliderRef = useRef(null);

    const scrollLeft = (sliderRef) => {
        sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = (sliderRef) => {
        sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    };

    const handleScroll = (sliderRef, setProducts, products) => {
        const slider = sliderRef.current;
        if (!slider) return;

        if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 100) {
            const updatedProducts = [...products, ...products];
            setProducts(updatedProducts);
        }

        if (slider.scrollLeft <= 100) {
            const updatedProducts = [...products, ...products];
            setProducts(updatedProducts);

            slider.scrollLeft += slider.offsetWidth;
        }
    };

    const selectedCategory = location.state?.category;

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    return (
        <>
            <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {loading ? (
                        <div className="carousel-item active">
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                <span>Loading...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="carousel-item active">
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                <span className="text-danger">{error}</span>
                            </div>
                        </div>
                    ) : (
                        orderedImages.map((image, index) => (
                            <div
                                key={index}
                                className={`carousel-item ${index === 0 ? 'active' : ''}`}
                            >
                                <img src={image} className="d-block w-100" alt={`carousel-item-${index}`} />
                                <div className="carousel-caption">
                                    <div className="head">We picked every item with care</div>
                                    <div className="body">You must Try</div>
                                    <Link to="/shopping/listing" className="linkToCollection">
                                        <button className="btn btn-dark mt-md-5 ms-1">
                                            Go to collection<i className="fa-solid fa-arrow-right ms-3"></i>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#carouselExample"
                    data-bs-slide="prev"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#carouselExample"
                    data-bs-slide="next"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Replace the Men and Women cards with the SplitCardsUI component */}
            <div className='container my-md-4 my-3' >
                <div className='row'>
                    <div className='col h1 text-center text-white-important mt-5'>
                        Shop by Category

                    </div>
                </div>
                <div className='row justify-content-center' style={{marginTop : "-13vh"}}>
                    <SplitCardsUI />
                </div>
            </div>
{/* 
            <div className="container" style={{marginTop : "-10vh"}}>
                <div className="row">
                    <div className="col h1 text-center text-white-important mb-5">Recommended For You</div>
                </div>
                <div className="slider-container position-relative" style={{marginTop : "1vh"}}>
                    <button className="slider-btn slider-btn-left" onClick={() => scrollLeft(recommendedSliderRef)}>
                        <i className="fa fa-chevron-left"></i>
                    </button>
                    <div
                        className="horizontal-slider"
                        ref={recommendedSliderRef}
                        onScroll={() => handleScroll(recommendedSliderRef, setRecommendedProducts, recommendedProducts)}
                    >
                        {recommendedProducts.map((product, index) => (
                            <div
                                className="card h-100 shadow-lg border-0 mx-3"
                                key={index}
                                style={{
                                    cursor: "pointer",
                                    minWidth: "18rem",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                }}
                                onClick={() => handleCardClick(product)}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "scale(1.1)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "scale(1)")
                                }
                            >
                                <img
                                    src={product.Image}
                                    className="card-img-top"
                                    alt={product.Title}
                                    style={{
                                        width: "100%",
                                        height: "20vh",
                                        objectFit: "cover",
                                        borderRadius: "10px 10px 0 0",
                                    }}
                                />
                                <div className="card-body text-center">
                                    <h5 className="card-title fw-bold text-primary">
                                        {product.Title}
                                    </h5>
                                    <p className="card-text fs-5 text-dark">
                                        Price: <span className="text-success">{product.SalePrice}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="slider-btn slider-btn-right" onClick={() => scrollRight(recommendedSliderRef)}>
                        <i className="fa fa-chevron-right"></i>
                    </button>
                </div>
                {showModal && selectedProduct && (
                    <ProductDescription
                        product={selectedProduct}
                        closeModal={closeModal}
                    />
                )}
            </div> */}
            <div className="container mb-5" style={{ marginTop: "-10vh" }}>
  <div className="row">
    <div className="col h1 text-center text-white-important mb-5">
      Recommended For You
    </div>
  </div>
  <div className="slider-container position-relative" style={{ marginTop: "1vh" }}>
    <button className="slider-btn slider-btn-left" onClick={() => recommendedSliderRef.current.scrollBy({ left: -300, behavior: "smooth" })}>
      <i className="fa fa-chevron-left"></i>
    </button>
    <div className="horizontal-slider" ref={recommendedSliderRef}>
      {recommendedProducts.map((product, index) => (
        <motion.div 
          key={index}
          className="mx-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          style={{ minWidth: "18rem", cursor: "pointer" }}
          onClick={() => handleCardClick(product)}
        >
          <Card>
            <motion.img
              src={product.Image}
              alt={product.Title}
              style={{ width: "100%", height: "50vh", objectFit: "cover", padding: '1rem', borderRadius : "20px"}}
              whileHover={{ rotate: [-1, 1, -1], transition: { repeat: Infinity, duration: 1 } }}
            />
            <CardBody className="text-center d-flex justify-content-between mt-2" style={{height:"10vh"}}>
              <h5>{product.Title}</h5>
              <span className="fw-medium" style={{color : "greenyellow"}}>₹{product.SalePrice}</span>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
    <button className="slider-btn slider-btn-right" onClick={() => recommendedSliderRef.current.scrollBy({ left: 300, behavior: "smooth" })}>
      <i className="fa fa-chevron-right"></i>
    </button>
  </div>
            </div>

            {/* <div className="container mt-5 mb-5">
  <div className="row">
    <div className="col h1 text-center text-white-important">
      Latest Additions
    </div>
  </div>
  <div className="slider-container position-relative" style={{ marginTop: "1vh" }}>
    <button className="slider-btn slider-btn-left" onClick={() => latestSliderRef.current.scrollBy({ left: -300, behavior: "smooth" })}>
      <i className="fa fa-chevron-left"></i>
    </button>
    <div className="horizontal-slider" ref={latestSliderRef}>
      {products.map((product, index) => (
        <motion.div 
          key={index}
          className="mx-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          style={{ minWidth: "18rem", cursor: "pointer" }}
          onClick={() => handleCardClick(product)}
        >
          <Card>
            <motion.img
              src={product.Image}
              alt={product.Title}
              style={{ width: "100%", height: "50vh", objectFit: "cover", padding: '1rem', borderRadius : "20px"}}
              whileHover={{ rotate: [-1, 1, -1], transition: { repeat: Infinity, duration: 1 } }}
            />
            <CardBody className="text-center d-flex justify-content-between mt-2" style={{height:"10vh"}}>
              <h5>{product.Title}</h5>
              <span className="text-success fw-bold">₹ {product.SalePrice}</span>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
    <button className="slider-btn slider-btn-right" onClick={() => latestSliderRef.current.scrollBy({ left: 300, behavior: "smooth" })}>
      <i className="fa fa-chevron-right"></i>
    </button>
  </div>
            </div> */}
            <div className="container mt-5 mb-5">
  <div className="row">
    <div className="col h1 text-center text-white-important mb-5">
      Latest Additions
    </div>
  </div>
  <div className="slider-container position-relative" style={{ marginTop: "1vh" }}>
    <button 
      className="slider-btn slider-btn-left" 
      onClick={() => latestSliderRef.current.scrollBy({ left: -300, behavior: "smooth" })}
      style={{
        position: 'absolute',
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '10',
        background: 'rgba(0,0,0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer'
      }}
    >
      <i className="fa fa-chevron-left"></i>
    </button>
    
    <div 
      className="horizontal-slider" 
      ref={latestSliderRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        msOverflowStyle: 'none',  // Hide scrollbar IE and Edge
        scrollbarWidth: 'none',   // Hide scrollbar Firefox
        '&::-webkit-scrollbar': { display: 'none' }  // Hide scrollbar Chrome
      }}
    >
      {products.map((product, index) => (
        <motion.div
          key={index}
          className="mx-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          style={{ minWidth: "18rem", cursor: "pointer" }}
          onClick={() => handleCardClick(product)}
        >
          <Card>
            <motion.img
              src={product.Image}
              alt={product.Title}
              style={{ 
                width: "100%", 
                height: "50vh", 
                objectFit: "cover", 
                padding: '1rem', 
                borderRadius: "20px"
              }}
              whileHover={{ 
                rotate: [-1, 1, -1], 
                transition: { repeat: Infinity, duration: 1 } 
              }}
            />
            <CardBody className="text-center d-flex justify-content-between mt-2" style={{height:"10vh"}}>
              <h5>{product.Title}</h5>
              <span className="fw-medium" style={{color:"greenyellow"}}>₹ {product.SalePrice}</span>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
    
    <button 
      className="slider-btn slider-btn-right"
      onClick={() => latestSliderRef.current.scrollBy({ left: 300, behavior: "smooth" })}
      style={{
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: '10',
        background: 'rgba(0,0,0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer'
      }}

      
    >
      <i className="fa fa-chevron-right"></i>
    </button>
  </div>
            </div>

{/* Add this CSS to your stylesheet */}
<style>
{`
  .slider-container {
    position: relative;
    padding: 0 20px;
  }

  .horizontal-slider {
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    -ms-overflow-style: none;  /* Hide scrollbar IE and Edge */
    scrollbar-width: none;  /* Hide scrollbar Firefox */
  }

  .horizontal-slider::-webkit-scrollbar {
    display: none; /* Hide scrollbar Chrome */
  }

  .slider-btn {
    transition: all 0.3s ease;
  }

`}
</style>
        </>
    );
}

const Card = styled(motion.div)`
  background:black;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: white;
  min-height : 10vh;
  min-width: 18rem;
  opacity : 0.9;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: scale(1.01);
  }
`;

const CardBody = styled.div`
  padding: 1rem;
  text-align: center;
`;

const AddToCartButton = styled(motion.button)`
  background-color: #333333;
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  &:hover {
    background-color: #444444;
  }
`;


export default ShoppingHome;


