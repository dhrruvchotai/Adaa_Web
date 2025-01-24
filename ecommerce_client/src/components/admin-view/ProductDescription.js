import { useNavigate } from 'react-router-dom';

function ProductDescription({ selectedProduct, closeModal, deleteModal }) {
    const navigate = useNavigate();
    return (
        <div className="modal show d-block modal-backdrop-custom" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{selectedProduct.Title}</h5>
                        <button
                            type="button"
                            className="btn btn-close fw-bold"
                            onClick={closeModal}
                            style={{ position: "absolute", top:"15px", right: "15px", zIndex: "10" }}
                        >X</button>
                    </div>
                    <div className="modal-body">
                        <img
                            src={selectedProduct.Image}
                            alt={selectedProduct.Title}
                            style={{ width: "100%", height: "50vh", objectFit: "cover" }}
                        />
                        <p>{selectedProduct.Description}</p>
                        <p className="fw-bold">Cost Price: {selectedProduct.Price}</p>
                        <p className="fw-bold">Sale Price: {selectedProduct.SalePrice}</p>
                        <p className="fw-bold">Stock: {selectedProduct.Stock}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={() => { deleteModal(selectedProduct.No, navigate) }}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDescription;