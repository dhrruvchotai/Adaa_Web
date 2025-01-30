import homeImg from './homeImg.jpg';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Home.css'; // Import the CSS file for animations and styles

function Home() {
    const navigate = useNavigate();

    return (
        <>
            <div
                className="home-container"
                style={{
                    backgroundImage: `url(${homeImg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "0 5%",
                }}
            >
                <div className="home-heading" style={{ fontSize: "40px", marginBottom: "20px" }}>
                    Get into the World of Shopping
                </div>
                <div className="home-subheading" style={{ fontSize: "70px", marginBottom: "40px" }}>
                    Best Online Store
                </div>
                <button
                    className="home-button"
                    onClick={() => navigate('./auth/login')}
                >
                    Let's Go
                </button>
            </div>
        </>
    );
}

export default Home;