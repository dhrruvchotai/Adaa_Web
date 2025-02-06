import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, getReviewsAPI } from '../../shopping-view/API';
import { updateStockAPI, deleteProduct, renumberProducts } from '../API';
import Swal from 'sweetalert2';
function AdminProductDescription() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [stockChange, setStockChange] = useState();
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response);
            } catch (error) {
                console.error("Failed to fetch product:", error);
            }
        };
        const fetchReviews = async () => {
            try {
                const response = await getReviewsAPI(id);
                setReviews(response || []);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };
        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);
    const handleStockUpdate = async (isAdding) => {
        const updatedStock = isAdding
            ? product[0].Stock + stockChange
            : product[0].Stock - stockChange;
        if (updatedStock < 0) {
            Swal.fire({
                icon: "error",
                title: "Invalid Stock",
                text: "Stock cannot be negative.",
            });
            return;
        }
        await updateStockAPI(product[0].No, updatedStock);
        const response = await getProductById(product[0].No);
        setProduct(response);
        setStockChange('');
    };
    const deleteModal = async (id, navigate) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You won't be able to retrieve the ${product[0].Category} ${product[0].Title} back!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteProduct(id);
                await renumberProducts(id);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The product has been deleted successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                navigate('/admin/products');
            }
        });
    };
    if (!product) return <p>Loading product details...</p>;
    return (
        <div className="container mt-4">
            <button className="btn btn-dark mb-3" onClick={() => navigate('/admin/products')}>← Back</button>
            <div className="row">
                {/* Image Section - Half Page */}
                <div className="col-md-5 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F0F0F0' }}>
                    <img
                        src={product[0].Image}
                        alt={product[0].Title}
                        className="img-fluid rounded"
                        style={{ maxHeight: "450px", objectFit: "contain", width: "100%" }}
                    />
                </div>
                {/* Details Section */}
                <div className="col-md-6 offset-lg-1 mt-2">
                    <h1 className="fw-bold mb-3">{product[0].Title}</h1>
                    <p><strong>Brand:</strong> {product[0].Brand}</p>
                    <p><strong>Details:</strong> {product[0].Details}</p>
                    <p><strong>Cost Price:</strong> ₹{product[0].Price}</p>
                    <p><strong>Sale Price:</strong> ₹{product[0].SalePrice}</p>
                    <p><strong>Stock:</strong> {product[0].Stock}</p>
                    {/* Modify Stock Section */}
                    <div className="mt-3 p-3 border rounded bg-light">
                        <p className="fw-bold mb-2">Modify Stock:</p>
                        <div className="d-flex gap-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Enter quantity"
                                value={stockChange}
                                onChange={(e) => setStockChange(Number(e.target.value))}
                                style={{ maxWidth: "150px" }}
                            />
                            <button
                                className="btn btn-success"
                                onClick={() => handleStockUpdate(true)}
                                disabled={stockChange <= 0}
                            >
                                Add Stock
                            </button>
                            <button
                                className="btn btn-warning"
                                onClick={() => handleStockUpdate(false)}
                                disabled={stockChange <= 0}
                            >
                                Remove Stock
                            </button>
                        </div>
                    </div>
                    {/* Delete Button */}
                    <button
                        className="btn btn-danger mt-3 w-100"
                        onClick={() => deleteModal(product[0].No, navigate)}
                    >
                        Delete Product
                    </button>
                </div>
            </div>
            {/* Reviews Section */}
            <div className="mt-4">
                <h4 className="fw-bold">Customer Reviews</h4>
                {reviews.length > 0 ? (
                    <div className="border rounded p-3 bg-white shadow-sm" style={{ maxHeight: "250px", overflowY: "auto" }}>
                        {reviews.map((review, index) => (
                            <div key={index} className="mb-3 p-2 border-bottom">
                                <strong className="text-primary">{review.username}</strong>
                                <p className="text-muted m-0">{review.review}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">No reviews available for this product.</p>
                )}
            </div>
        </div>
    );
}
export default AdminProductDescription;