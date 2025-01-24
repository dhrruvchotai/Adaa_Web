import { useState, useEffect } from "react";
import { fetchProducts } from "../API";
import { useLocation } from "react-router-dom";
import ProductDescription from "../../../components/shopping-view/ProductDescription";
import { getCartByEmail, removeFromCartAPI, addToCartAPI } from "../API";
import useUserDetails from "../../useUserDetails"; 

function ShoppingListing() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productIds, setProductIds] = useState([]);

    useEffect(() => {
        fetchProducts().then((res) => {
            setProducts(res);
            setFilteredProducts(res);
        });
    }, []);

    const { userData, isUserDataReady } = useUserDetails();

    useEffect(() => {
        const fetchCartProducts = async () => {
            if (isUserDataReady && userData?.Email) {
                try {
                    const user = await getCartByEmail(userData.Email);
                    const productIds = user?.Cart || [];
                    setProductIds(productIds);
                } catch (error) {
                    console.error("Failed to fetch cart products:", error);
                }
            }
        };
        fetchCartProducts();
    }, [isUserDataReady, userData?.Email]);

    const categoryMap = {
        Men: "Male",
        Women: "Female",
    };

    const productTypeMap = {
        Shirt: "Shirt",
        TShirt: "T-Shirt",
        Jeans: "Jeans",
        Top: "Top",
        Dress: "Dress",
        Suit: "Suit",
    };

    const location = useLocation();

    useEffect(() => {
        const category = location.state?.category;
    
        if (category) {
            setSelectedCategories([category]);
            setFilteredProducts(
                products.filter((product) => product.Category === category)
            );
        }
    }, [location.state, products]);
    

    const handleCategoryChange = (category) => {
        const mappedCategory = categoryMap[category];
        const updatedCategories = selectedCategories.includes(mappedCategory)
            ? selectedCategories.filter((c) => c !== mappedCategory)
            : [...selectedCategories, mappedCategory];

        setSelectedCategories(updatedCategories);

        filterProducts(updatedCategories, selectedProductTypes);
    };

    const handleProductTypeChange = (productType) => {
        const updatedProductTypes = selectedProductTypes.includes(productType)
            ? selectedProductTypes.filter((pt) => pt !== productType)
            : [...selectedProductTypes, productType];

        setSelectedProductTypes(updatedProductTypes);

        filterProducts(selectedCategories, updatedProductTypes);
    };

    const filterProducts = (categories, productTypes) => {
        setFilteredProducts(
            products.filter((product) => {
                const matchesCategory =
                    categories.length === 0 || categories.includes(product.Category);
                const matchesProductType =
                    productTypes.length === 0 || productTypes.includes(product.Title);

                return matchesCategory && matchesProductType;
            })
        );
    };

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const isProductInCart = (productId) => productIds.includes(productId);

    const handleRemoveFromCart = async (productId) => {
        try {
            await removeFromCartAPI(userData.Email, productId);
            setProductIds((prev) => prev.filter((id) => id !== productId));
        } catch (error) {
            console.error("Failed to remove product from cart:", error);
        }
    };

    const handleAddToCart = async (productId, stock) => {
        if (stock <= 0) {
            alert("This product is out of stock!");
            return;
        }

        try {
            if (!userData?.Email) {
                console.error("User email is not available");
                return;
            }
            await addToCartAPI(userData.Email, productId);
            setProductIds((prev) => [...prev, productId]);
        } catch (error) {
            console.error("Failed to add product to cart:", error);
        }
    };

    const handleCartUpdate = (updatedCart) => {
        setProductIds(updatedCart);
    };

    return (
        <div className="container-fluid">
            <div className="row pt-3 ps-2">
                <div
                    className="col-md-2 col-0 d-none d-md-block border-end"
                    style={{
                        height: "100vh",
                        position: "fixed",
                        overflowY: "auto",
                        top: 0,
                        left: 0,
                        zIndex: 10,
                        paddingTop: "65px",
                        backgroundColor: "#fcedeb",
                    }}
                >
                    <div>
                        <h3 className="fw-bold fs-2 pt-3">Filters</h3>
                        <hr />
                        <div>
                            <h5 className="fw-bold fs-5">Categories</h5>
                            <ul className="list-unstyled mt-3 ms-3">
                                {Object.keys(categoryMap).map((category) => (
                                    <li className="mb-2" key={category}>
                                        <input
                                            type="checkbox"
                                            id={category}
                                            className="form-check-input me-2"
                                            checked={selectedCategories.includes(categoryMap[category])}
                                            onChange={() => handleCategoryChange(category)}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label htmlFor={category} className="form-check-label">
                                            {category}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="fw-bold fs-5 mt-5">Product Types</h5>
                            <ul className="list-unstyled mt-3 ms-3">
                                {Object.keys(productTypeMap).map((productType) => (
                                    <li className="mb-2" key={productType}>
                                        <input
                                            type="checkbox"
                                            id={productType}
                                            className="form-check-input me-2"
                                            checked={selectedProductTypes.includes(productTypeMap[productType])}
                                            onChange={() => handleProductTypeChange(productTypeMap[productType])}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <label htmlFor={productType} className="form-check-label">
                                            {productType}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-md-10 offset-md-2">
                    <div className="row">
                        <h3 className="fw-bold fs-2 mt-1 mb-3">All Products</h3>
                        <hr />
                    </div>
                    <div className="row">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div
                                    className="col-md-4 col-sm-6 col-lg-3 mb-4"
                                    key={product.No}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleCardClick(product)}
                                >
                                    <div className="card card-product h-100 shadow-sm">
                                        <img
                                            src={product.Image}
                                            alt={product.Title}
                                            className="card-img-top"
                                            style={{ height: "200px", objectFit: "cover" }}
                                        />
                                        <div className="card-body d-flex flex-column">
                                            <h5 className="card-title">{product.Title}</h5>
                                            <p className="fw-bold mb-4">₹{product.SalePrice}</p>
                                            {product.Stock > 0 ? (
                                                isProductInCart(product.No) ? (
                                                    <button
                                                        className="btn btn-danger mt-auto"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFromCart(product.No);
                                                        }}
                                                    >
                                                        Remove from Cart
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-primary mt-auto"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(product.No, product.Stock);
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                )
                                            ) : (
                                                <button className="btn btn-secondary mt-auto" disabled>
                                                    Out of Stock
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center mt-5">
                                <p className="fs-4 text-muted">No products available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && selectedProduct && (
                <ProductDescription
                    product={selectedProduct}
                    closeModal={closeModal}
                    updateCart={handleCartUpdate}
                />
            )}
        </div>
    );
}

export default ShoppingListing;