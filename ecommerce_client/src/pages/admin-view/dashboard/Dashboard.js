import img1 from '../../../components/Images/img1.jpg';
import img2 from '../../../components/Images/img2.jpg';
import img3 from '../../../components/Images/img3.jpg';
import img4 from '../../../components/Images/img4.jpg';
import './dashboard-style.css';
import { useState } from 'react';
import { useImageContext } from '../../ImageContext';

function AdminDashboard() {
    const initialImages = [img1, img2, img3, img4];
    const [images, setImages] = useState(initialImages);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const { setSelectedImage } = useImageContext();

    const handleImageUpload = (event) => {
        const files = event.target.files;
        if (files) {
            const newImages = [];
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push(reader.result);
                    if (newImages.length === files.length) {
                        setImages((prevImages) => [...prevImages, ...newImages]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleImageSelect = (index) => {
        setSelectedImage(images[index]);
        setSelectedImageIndex(index);
    };

    return (
        <div className="container">
            <div className="row mt-4">
                <div className="col">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="form-control ms-2 fileUpload"
                    />
                </div>
            </div>
            {images.map((image, index) => (
                <div
                    className="row mb-4"
                    key={index}
                    onClick={() => handleImageSelect(index)}
                >
                    <div
                        className={`col px-4 ${selectedImageIndex === index ? 'selected' : ''}`}
                        style={{
                            backgroundImage: `url(${image})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            margin: '20px',
                            height: '300px',
                            backgroundPosition: 'center 10%',
                            cursor: 'pointer',
                        }}
                    >
                        <div className="mt-5 fs-4">We picked every item with care</div>
                        <div className="mt-2 fw-bold try">You Must Try</div>
                        <button className="btn btn-dark mt-5">
                            Go to collection<i className="fa-solid fa-arrow-right ms-3"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminDashboard;