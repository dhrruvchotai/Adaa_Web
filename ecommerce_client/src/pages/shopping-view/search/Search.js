import { useState, useEffect } from "react";
import { fetchProducts } from "../API";
import ProductDescription from "../../../components/shopping-view/ProductDescription";
import './search-style.css';

function Search() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
 
    useEffect(() => {
        fetchProducts().then((res) => {
            setProducts(res);
            setFilteredProducts(res);
        });
    }, []);

    useEffect(() => {
        const results = products.filter((product) =>
            product.Title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchQuery, products]);

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    return (
        <div className="search-page">
            <div className="search-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search for T-Shirt, Shirt, Jeans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="search-results">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div
                            className="product-card"
                            key={product.No}
                            onClick={() => handleCardClick(product)}
                            style={{ cursor: "pointer" }}
                        >
                            <img
                                src={product.Image}
                                alt={product.Title}
                                className="product-image"
                            />
                            <div className="product-info">
                                <h5>{product.Title}</h5>
                                <p className="product-price">₹{product.SalePrice}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-results">No products found</p>
                )}
            </div>

            {showModal && selectedProduct && (
                <ProductDescription
                    product={selectedProduct}
                    closeModal={closeModal}
                />
            )}
        </div>
    );
}

export default Search;