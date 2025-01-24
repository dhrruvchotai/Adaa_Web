import './home-style.css';
import img1 from '../../../components/Images/img1.jpg';
import img2 from '../../../components/Images/img2.jpg';
import img3 from '../../../components/Images/img3.jpg';
import img4 from '../../../components/Images/img4.jpg';
import { Link } from 'react-router-dom';
import { fetchProducts, getRecommendations } from '../API';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProductDescription from '../../../components/shopping-view/ProductDescription';
import { useImageContext } from '../../ImageContext';
import useUserDetails from '../../useUserDetails';

function ShoppingHome() {
    const initialImages = [img1, img2, img3, img4];
    const { selectedImage } = useImageContext();
    const [products, setProducts] = useState([]);
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [error, setError] = useState(null);
    const { userData, isUserDataReady } = useUserDetails();

    const [orderedImages, setOrderedImages] = useState([]);

    useEffect(() => {
        if (selectedImage !== null) {
            const reorderedImages = [
                initialImages[selectedImage],
                ...initialImages.filter((_, index) => index !== selectedImage),
            ];
            setOrderedImages(reorderedImages);
        } else {
            setOrderedImages(initialImages);
        }
    }, [selectedImage]);

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
        setSelectedProduct(product);
        setShowModal(true);    
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
                    {orderedImages.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-item ${index === 0 ? 'active' : ''}`}
                        >
                            <img src={image} className="d-block w-100" alt={`carousel-item-${index}`} />
                            <div className="carousel-caption">
                                <div className='head'>We picked every item with care</div>
                                <div className='body'>You must Try</div>
                                <Link to='/shopping/listing' className='linkToCollection'>
                                    <button className="btn btn-dark mt-md-5 ms-1">
                                        Go to collection<i className="fa-solid fa-arrow-right ms-3"></i>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
            <div className='container my-md-4 my-3 mb-5'>
                <div className='row'>
                    <div className='col h1 text-center'>
                        Shop by category
                    </div>
                </div>
                <div className='row justify-content-center'>
                    <div className='col-auto'>
                        <Link
                            className={`nav-link me-2 ${selectedCategory === "Male" ? "fw-bold" : ""
                                }`}
                            to="/shopping/listing"
                            state={{ category: "Male" }}
                        >
                            <div className="card card-product mt-4" style={{ width: "16rem", cursor: "pointer" }}>
                                <div className="card-body text-center">
                                    <h1><i className="fa-solid fa-person"></i></h1>
                                    <h4 className="card-title">
                                        Men
                                    </h4>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <div className='col-auto'>
                        <Link
                            className={`nav-link me-2 ${selectedCategory === "Female" ? "fw-bold" : ""
                                }`}
                            to="/shopping/listing"
                            state={{ category: "Female" }}
                        >
                            <div className="card card-product mt-4" style={{ width: "16rem", cursor: "pointer" }}>
                                <div className="card-body text-center">
                                    <h1><i className="fa-solid fa-person-dress"></i></h1>
                                    <h4 className="card-title">
                                        Women
                                    </h4>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="container mt-5">
                <div className="row">
                    <div className="col h1 text-center">Recommended For You</div>
                </div>
                <div className="slider-container position-relative">
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
            </div>
            <div className="container mt-5">
                <div className="row">
                    <div className="col h1 text-center">Latest Additions</div>
                </div>
                <div className="slider-container position-relative">
                    <button className="slider-btn slider-btn-left" onClick={() => scrollLeft(latestSliderRef)}>
                        <i className="fa fa-chevron-left"></i>
                    </button>
                    <div
                        className="horizontal-slider"
                        ref={latestSliderRef}
                        onScroll={() => handleScroll(latestSliderRef, setProducts, products)}
                    >
                        {products.map((product, index) => (
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
                    <button className="slider-btn slider-btn-right" onClick={() => scrollRight(latestSliderRef)}>
                        <i className="fa fa-chevron-right"></i>
                    </button>
                </div>
                {showModal && selectedProduct && (
                    <ProductDescription
                        product={selectedProduct}
                        closeModal={closeModal}
                    />
                )}
            </div>
        </>
    );
}

export default ShoppingHome;