import React, { useState } from 'react';
import './style.css';
import { addProducts } from '../../pages/admin-view/API';
import Swal from 'sweetalert2';

function AddProduct({ setIsAddModalOpen, onProductAdded }) {
    const [newProduct, setNewProduct] = useState({
        Title: "",
        Category: "",
        Image: "",
        Price: "",
        SalePrice: "",
        Stock: "",
        Details: "",
        Brand: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requiredFields = ['Title', 'Category', 'Image', 'Price', 'Stock', 'Details', 'Brand'];
        for (let field of requiredFields) {
            if (!newProduct[field]) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `${field} is required!`,
                });
                return;
            }
        }
        try {
            const response = await addProducts(newProduct);
            if (response.product) {
                setIsAddModalOpen(false);
                onProductAdded();
                Swal.fire({
                    icon: 'success',
                    title: 'Product Added!',
                    text: 'The product has been successfully added.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                console.error("Error adding product:", response.message);
            }
        } catch (error) {
            console.error("Error occurred while adding product:", error);
        }
    };

    return (
        <div className="modal-overlay-add-product">
            <div className="modal-box-add">
                <h2>Add New Product</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group fg">
                            <label>Product Title:</label>
                            <input
                                type="text"
                                name="Title"
                                value={newProduct.Title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Details:</label>
                            <input
                                type="text"
                                name="Details"
                                value={newProduct.Details}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Brand:</label>
                            <input
                                type="text"
                                name="Brand"
                                value={newProduct.Brand}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Category:</label>
                            <input
                                type="text"
                                name="Category"
                                value={newProduct.Category}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Image URL:</label>
                            <input
                                type="text"
                                name="Image"
                                value={newProduct.Image}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Price:</label>
                            <input
                                type="number"
                                name="Price"
                                value={newProduct.Price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Sale Price:</label>
                            <input
                                type="number"
                                name="SalePrice"
                                value={newProduct.SalePrice}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group fg">
                            <label>Stock:</label>
                            <input
                                type="number"
                                name="Stock"
                                value={newProduct.Stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-actions fa">
                        <button type="submit" className='btnAdd'>Add Product</button>
                        <button type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;