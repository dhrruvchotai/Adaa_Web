import { useState, useEffect } from "react";
import { fetchProducts } from "../API";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import "./search-style.css";

function Search() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts().then((res) => {
            setProducts(res);
            setFilteredProducts(res);
        });
    }, []);

    useEffect(() => {
        const results = products.filter((product) => {
            const combinedString = (product.Title + ' ' + product.Details + ' ' + product.Brand).toLowerCase();
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
                        <motion.div
                            className="col-md-4 col-sm-6 col-lg-3 mb-4"
                            key={product.No}
                            onClick={() => handleCardClick(product)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card>
                                <motion.div
                                    className="card card-product h-100"
                                    whileHover={{ scale: 1.03 }}
                                    style={{backgroundColor : "black",borderBottom : "1px solid grey"}}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <img
                                        src={product.Image}
                                        alt={product.Title}
                                        className="card-img-top"
                                        style={{ height: "200px", objectFit: "cover" }}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="fw-medium" style={{ color: "white" }}>{product.Title}</h5>
                                        <div className="d-flex">
                                            <p className="mb-4" style={{ fontSize: "17px", color: "gold" }}>{product.Brand}</p>
                                            <p className="fw-medium mb-4 fs-5" style={{ color: "greenyellow", marginLeft: "8rem" }}>₹{product.SalePrice}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <p className="no-results">No products found</p>
                )}
            </div>
        </div>
    );
}

const Card = styled(motion.div)`
  background: black;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: white;
  min-height: 10vh;
  min-width: 18rem;
  opacity: 0.9;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: scale(1.01);
  }
`;

export default Search;
