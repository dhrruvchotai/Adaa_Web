import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../API";
import AddProduct from "../../../components/admin-view/AddProduct";
import './products-style.css';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts().then(res => setProducts(res));
    }, []);

    const handleProductClick = (product) => {
        navigate('/admin/products/'+product.No);
    };

    const onProductAdded = () => {
        fetchProducts().then(res => setProducts(res));
    };

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col text-center fw-bold" style={{ fontSize: "45px" }}>
                    Products
                </div>
            </div>
            <div className="row">
                <div className="col text-end">
                    <button className="btn btn-success my-3 btn-lg" onClick={() => setIsAddModalOpen(true)}>Add New Product</button>
                </div>
            </div>
            <div className="row mt-4">
                {products.map((product, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                        <div className="card card-product h-100" onClick={() => handleProductClick(product)} style={{ cursor: "pointer" }}>
                            <img
                                src={product.Image}
                                className="card-img-top"
                                alt={product.Title}
                                style={{ width: "100%", height: "30vh", objectFit: "cover" }}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{product.Title}</h5>
                                <p className="card-text fw-bold">Price: {product.SalePrice}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isAddModalOpen && <AddProduct setIsAddModalOpen={setIsAddModalOpen} onProductAdded={onProductAdded}/>}
        </div>
    );
}

export default AdminProducts;