import { useState, useEffect } from "react";
import { fetchProducts, getCartByEmail } from "../API";
import { useLocation, useNavigate } from "react-router-dom";
import ProductDescription from "./ProductDescription";
import { removeFromCartAPI, addToCartAPI } from "../API";
import useUserDetails from "../../useUserDetails";
import Spinner from "../../../components/shopping-view/Spinner";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

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

  const navigate = useNavigate();
  const { userData, isUserDataReady } = useUserDetails();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, cartRes] = await Promise.all([
          fetchProducts(),
          isUserDataReady && userData?.Email
            ? getCartByEmail(userData.Email)
            : Promise.resolve({ Cart: [] }),
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
      setFilteredProducts(products.filter((product) => product.Category === category));
    } else {
      setFilteredProducts(products);
    }
  }, [location.state, products]);

  const handleProductTypeChange = (productType) => {
    const updatedProductTypes = selectedProductTypes.includes(productType)
      ? selectedProductTypes.filter((pt) => pt !== productType)
      : [...selectedProductTypes, productType];

    setSelectedProductTypes(updatedProductTypes);
    filterProducts(updatedProductTypes, selectedBrands, minPrice, maxPrice);
  };

  const handleBrandChange = (brand) => {
    const updatedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(updatedBrands);
    filterProducts(selectedProductTypes, updatedBrands, minPrice, maxPrice);
  };

  const [minPrice, setMinPrice] = useState(Number(10));  // Minimum price input
  const [maxPrice, setMaxPrice] = useState(Number(3000));

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    filterProducts(selectedProductTypes, selectedBrands, min, max);
  };

  const filterProducts = (updatedProductTypes, updatedBrands, minPrice, maxPrice) => {

    if(minPrice===undefined){
      setMinPrice(Number(10));
    }

    if(maxPrice===undefined){
      setMaxPrice(Number(3000));
    }
    setFilteredProducts(
      products.filter((product) => {
        // Condition to check if product matches the selected brands
        const matchesBrand =
          updatedBrands.length === 0 || updatedBrands.includes(product.Brand);
  
        // Condition to check if product matches the selected product types
        const matchesProductType =
          updatedProductTypes.length === 0 || updatedProductTypes.includes(product.Title);
  
        // Condition to check if product falls within the selected price range
        const matchesPrice = product.SalePrice >= minPrice && product.SalePrice <= maxPrice;
  
        // Product must match all filters (brand, product type, and price)
        return matchesBrand && matchesProductType && matchesPrice;
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
          {/* Filters Sidebar */}
          <motion.div
            className="col-md-2 col-0 d-none d-md-block border-end"
            style={{
              color : "#ced4da",
              height: "100vh",
              position: "fixed",
              overflowY: "auto",
              top: 0,
              left: 0,
              zIndex: 10,
              paddingTop: "65px",
              backgroundColor: "#000814",
            }}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h3 className="fs-2 pt-3" style={{color : "white"}}>Filters</h3>
              <hr />
              <div>
                <h5 className="fs-5 mt-4" style={{ color: "white" }}>Price Range</h5>
                <div className="d-flex flex-column">
                  <label className="text-light mt-2" htmlFor="minPrice">Min Price</label>
                  <input
                    type="number"
                    id="minPrice"
                    className="form-control mb-2"
                    value={minPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value), maxPrice)}
                    min={0}
                    max={3000}
                    step="100"
                  />
                  <label className="text-light mt-2" htmlFor="maxPrice">Max Price</label>
                  <input
                    type="number"
                    id="maxPrice"
                    className="form-control"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(minPrice, Number(e.target.value))}
                    min={0}
                    max={10000}
                    step="100"
                  />
                </div>
              </div>
              <div>
                <h5 className="fs-5 mt-4" style={{color : "white"}}>Popular Brands</h5>
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
                      <label htmlFor={brand} className="fw-medium">
                        {brand}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="fs-5 mt-5" style={{color:"white"}}>Product Types</h5>
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
                      <label htmlFor={productType} className="fw-medium">
                        {productType}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="col-md-10 offset-md-2">
            <div className="row">
              <h3 className="fw-medium fs-2 mt-1 mb-3" style={{color : "white"}}>All Products</h3>
              <hr />
            </div>
            <div className="row">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.div
                    className="col-md-4 col-sm-6 col-lg-3 mb-4"
                    key={product.No}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCardClick(product)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card>
                    <motion.div
                      className="card card-product h-100"
                      style={{backgroundColor : "black", opacity:0.9}}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={product.Image}
                        alt={product.Title}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h5 className="fw-medium" style={{color:"White"}}>{product.Title}</h5>
                        <div className="d-flex">
                        <p className="mb-4" style={{ fontSize: "17px",color:"gold" }}>
                          {product.Brand}
                        </p>
                        <p className="fw-medium mb-4 fs-5" style={{color:"greenyellow",marginLeft:"8rem"}}>₹{product.SalePrice}</p>
                        </div>
                        {product.Stock > 0 ? (
                          isProductInCart(product.No) ? (
                               <motion.button
                              className="btn btn-danger mt-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromCart(product.No);
                              }}
                            >
                              Remove from Cart
                            </motion.button>
                          ) : (
                            <motion.button
                            className="btn mt-auto"
                            style={{backgroundColor : "#001845",color:"white"}}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product.No, product.Stock);
                            }}
                          >
                            Add to Cart
                          </motion.button>
                          )
                        ) : (
                          <button className="btn btn-secondary mt-auto" disabled>
                            Out of Stock
                          </button>
                        )}
                      </div>
                    </motion.div>
                    </Card>
                  </motion.div>
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

      {/* Product Description Modal */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <ProductDescription
            product={selectedProduct}
            closeModal={closeModal}
            updateCart={handleCartUpdate}
          />
        )}
      </AnimatePresence>
    </div>
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

export default ShoppingListing;