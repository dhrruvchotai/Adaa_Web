import homeImg from './homeImg.jpg';
import { useNavigate } from 'react-router-dom';
import React from 'react';

function Home() {
    const navigate = useNavigate();
    return (
        <>
            <div style={{
                backgroundImage: "url(" + homeImg + ")",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                height: "100vh",
                width: "100vw",
            }}>
                <div className='mb-3' style={{ fontSize: "40px", padding: "150px 20px 20px 30px" }}>Get into the World of Shopping</div>
                <div className='fw-bold mb-3' style={{ fontSize: "70px", padding: "10px 20px 10px 30px" }}>Best Online Store</div>
                <button
                    className='btn btn-lg fw-bold rounded border text-light fs-3 px-3 my-3'
                    style={{
                        backgroundColor: "#ff6347",
                        margin: "5px 20px 20px 30px"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#ff4500"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#ff6347"}
                    onClick={() => { navigate('./auth/login') }}
                >
                    Let's Go
                </button>
            </div>
        </>
    );
}

export default Home;