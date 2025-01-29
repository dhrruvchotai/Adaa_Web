import { useState, useEffect } from "react";
import { fetchProducts, getCartByEmail } from "../API";
import { useLocation, useNavigate } from "react-router-dom";
import ProductDescription from "./ProductDescription";
import { removeFromCartAPI, addToCartAPI } from "../API";
import useUserDetails from "../../useUserDetails"; 
import Spinner from "../../../components/shopping-view/Spinner";

function ShoppingListing() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productIds, setProductIds] = useState([]);
    const [productTypeMap, setProductTypeMap] = useState({});
    const [brandMap, setBrandMap] = useState({});
    const [loading, setLoading] = useState(true);

    const navigate=useNavigate();


    const { userData, isUserDataReady } = useUserDetails();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products and cart data in parallel
                const [productsRes, cartRes] = await Promise.all([
                    fetchProducts(),
                    isUserDataReady && userData?.Email ? getCartByEmail(userData.Email) : Promise.resolve({ Cart: [] })
                ]);

                setProducts(productsRes);
                setFilteredProducts(productsRes);

                const productTypeCount = productsRes.reduce((acc, product) => {
                    acc[product.Title] = (acc[product.Title] || 0) + 1;
                    return acc;
                }, {});

                const filteredProductTypes = Object.keys(productTypeCount)
                    .filter((productType) => productTypeCount[productType] > 3)
                    .reduce((obj, productType) => {
                        obj[productType] = productType;
                        return obj;
                    }, {});

                setProductTypeMap(filteredProductTypes);

                const brandCount = productsRes.reduce((acc, product) => {
                    acc[product.Brand] = (acc[product.Brand] || 0) + 1;
                    return acc;
                }, {});

                const filteredBrands = Object.keys(brandCount)
                    .filter((brand) => brandCount[brand] > 5)
                    .reduce((obj, brand) => {
                        obj[brand] = brand;
                        return obj;
                    }, {});

                setBrandMap(filteredBrands);
                setProductIds(cartRes.Cart || []);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isUserDataReady, userData?.Email]);

    useEffect(() => {
        const category = location.state?.category;    
        if (category) {
            setSelectedCategories([category]);
            setFilteredProducts(
                products.filter((product) => product.Category === category)
            );
        } else {
            setFilteredProducts(products);
        }
    }, [location.state, products]);

    const handleProductTypeChange = (productType) => {
        const updatedProductTypes = selectedProductTypes.includes(productType)
            ? selectedProductTypes.filter((pt) => pt !== productType)
            : [...selectedProductTypes, productType];

        setSelectedProductTypes(updatedProductTypes);
        filterProducts(updatedProductTypes, selectedBrands);
    };

    const handleBrandChange = (brand) => {
        const updatedBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter((b) => b !== brand)
            : [...selectedBrands, brand];

        setSelectedBrands(updatedBrands);
        filterProducts(selectedProductTypes, updatedBrands);
    };

    const filterProducts = (updatedProductTypes, updatedBrands) => {
        setFilteredProducts(
            products.filter((product) => {
                const matchesBrand = updatedBrands.length === 0 || updatedBrands.includes(product.Brand);
                const matchesProductType = updatedProductTypes.length === 0 || updatedProductTypes.includes(product.Title);
                const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.Category);

                return matchesBrand && matchesProductType && matchesCategory;
            })
        );
    };

    const handleCardClick = (product) => {
        navigate(`/shopping/listing/${product.No}`, { state: { product } });
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
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                    <Spinner />
                </div>
            ) : (
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
                                <h5 className="fw-bold fs-5 mt-4">Popular Brands</h5>
                                <ul className="list-unstyled mt-3 ms-3">
                                    {Object.keys(brandMap).map((brand) => (
                                        <li className="mb-2" key={brand}>
                                            <input
                                                type="checkbox"
                                                id={brand}
                                                className="form-check-input me-2"
                                                checked={selectedBrands.includes(brandMap[brand])}
                                                onChange={() => handleBrandChange(brandMap[brand])}
                                                style={{ cursor: "pointer" }}
                                            />
                                            <label htmlFor={brand} className="form-check-label">
                                                {brand}
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
                                        <div className="card card-product h-100 shadow-m">
                                            <img
                                                src={product.Image}
                                                alt={product.Title}
                                                className="card-img-top"
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title">{product.Title}</h5>
                                                <p className="mb-4 text-secondary" style={{fontSize: "17px"}}>{product.Brand}</p>
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
            )}
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