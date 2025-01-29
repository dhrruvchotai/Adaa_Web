import { useState, useEffect } from "react";
import { fetchProducts } from "../API";
import { useNavigate } from "react-router-dom";
import './search-style.css';

function Search() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const navigate=useNavigate();
 
    useEffect(() => {
        fetchProducts().then((res) => {
            setProducts(res);
            setFilteredProducts(res);
        });
    }, []);

    useEffect(() => {
        const results = products.filter((product) => {
            const combinedString = (product.Title+' '+product.Details+' '+product.Brand).toLowerCase();
            const searchWords = searchQuery.toLowerCase().split(" ").filter(word => word.trim() !== "");

            return searchWords.every(word => combinedString.includes(word));
        });
        setFilteredProducts(results);
    }, [searchQuery, products]);    

    const handleCardClick = (product) => {
        navigate(`/shopping/listing/${product.No}`, { state: { product, from: "search" } });
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
                                <p className="product-brand text-secondary">{product.Brand}</p>
                                <p className="product-price">₹{product.SalePrice}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-results">No products found</p>
                )}
            </div>
        </div>
    );
}

export default Search;