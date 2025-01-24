import React, { useState, useEffect } from "react";
import { fetchProducts, deleteProduct, renumberProducts } from "../API";
import Swal from 'sweetalert2';
import ProductDescription from "../../../components/admin-view/ProductDescription";
import AddProduct from "../../../components/admin-view/AddProduct";
import './products-style.css';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchProducts().then(res => setProducts(res));
    }, []);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const onProductAdded = () => {
        fetchProducts().then(res => setProducts(res));
    };

    const deleteModal = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You won't be able to retrieve the ${selectedProduct.Category} ${selectedProduct.Title} back!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteProduct(id);
                await renumberProducts(id);
                closeModal();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The product has been deleted successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
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

            {selectedProduct && (
                <ProductDescription 
                    selectedProduct={selectedProduct} 
                    closeModal={closeModal} 
                    deleteModal={deleteModal} 
                />
            )}

            {isAddModalOpen && <AddProduct setIsAddModalOpen={setIsAddModalOpen} onProductAdded={onProductAdded}/>}
        </div>
    );
}

export default AdminProducts;