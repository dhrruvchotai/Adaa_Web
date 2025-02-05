import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserDetails from "../../pages/useUserDetails";
import { getCartByEmail } from "../../pages/shopping-view/API";
import Chatbot from "../../components/shopping-view/Chatbot";
import { useNavigate } from 'react-router-dom';
import './style.css';
import Swal from 'sweetalert2';

function ShoppingLayout() {
    const location = useLocation();
    const { userData, isUserDataReady } = useUserDetails();
    const [userInitial, setUserInitial] = useState("");
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isUserDataReady) {
            setUserInitial("?");
        } else {
            setUserInitial(userData.Username.charAt(0).toUpperCase());
        }
    }, [userData, isUserDataReady]);

    useEffect(() => {
        const getCartItemCount = async () => {
            if (isUserDataReady && userData?.Email) {
                const cart = await getCartByEmail(userData.Email);
                setCartItemCount(cart.length);
            }
        };
        getCartItemCount();
    }, [userData, isUserDataReady]);

    const selectedCategory = location.state?.category;

    const handleLogout = () => {
        Swal.fire({
                    title: "Are you sure you want to logout?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes"
                  }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.removeItem("user");
                        window.location.href = "/";
                    }
                });
    };

    const handleNavigation = (path) => {
        setIsChatbotOpen(false);
        navigate(path);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="navbar navbar-expand-lg fixed-top navbar-dark"
                style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <div className="container">
                    {/* Logo */}
                    <Link to="/shopping" className="navbar-brand">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: "120px", height: "auto" }} // Adjust size
                        >
                            <img src='/Adaa.png' alt="Adaa Logo" style={{ width: "100%", height: "auto" }} />
                        </motion.div>
                    </Link>


                    {/* Mobile menu button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="navbar-toggler border-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fs-5">
                            <li className="nav-item">
                                <Link
                                    className={`nav-link me-2 ${location.pathname === "/shopping" ? "fw-bold" : ""}`}
                                    to="/shopping"
                                    onClick={() => handleNavigation("/shopping")}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link me-2 ${location.pathname === "/shopping/listing" &&
                                        !selectedCategory
                                        ? "fw-bold"
                                        : ""
                                        }`}
                                    to="/shopping/listing"
                                >
                                    Products
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link me-2 ${selectedCategory === "Male" ? "fw-bold" : ""}`}
                                    to="/shopping/listing"
                                    state={{ category: "Male" }}
                                >
                                    Men
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link me-2 ${selectedCategory === "Female" ? "fw-bold" : ""}`}
                                    to="/shopping/listing"
                                    state={{ category: "Female" }}
                                >
                                    Women
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link me-2 ${location.pathname === "/shopping/search" &&
                                        !selectedCategory
                                        ? "fw-bold"
                                        : ""
                                        }`}
                                    to="/shopping/search"
                                >
                                    Search
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    className={`nav-link me-2 ${location.pathname === "/shopping/wishlist" &&
                                        !selectedCategory
                                        ? "fw-bold"
                                        : ""
                                        }`}
                                    to={`/shopping/wishlist`}
                                >
                                    Wishlist
                                </Link>
                            </li>
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item pt-1 mb-1">
                                <Link
                                    to="/shopping/cart"
                                    style={{
                                        textDecoration: "none",
                                        display: "inline-block",
                                    }}
                                    className="text-dark"
                                >
                                    <i className="fa-solid fa-cart-shopping fs-3 me-3"></i>
                                    {cartItemCount > 0 && (
                                        <span
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                            style={{
                                                fontSize: "0.75rem",
                                                padding: "0.25rem 0.5rem",
                                            }}
                                        >
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                            <li className="nav-item pt-1 mb-2">
                                <Link
                                    to="/shopping/account"
                                    style={{
                                        textDecoration: "none",
                                        display: "inline-block",
                                    }}
                                >
                                    <div
                                        className="bg-dark rounded-circle px-2 fs-5 mx-lg-3 text-light"
                                        style={{ border: "55px", cursor: "pointer" }}
                                    >
                                        {userInitial}
                                    </div>
                                </Link>
                            </li>
                            <li className="nav-item">
                                {userData && (
                                    <div
                                        className="mx-lg-2 btn btn-danger logout-btn"
                                        onClick={() => handleLogout()}
                                    >
                                        Logout
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div style={{ marginTop: "75px" }}>
                <Outlet />
            </div>

            {/* Chatbot */}
            <div>
                <button
                    className="chatbot-toggle-btn"
                    onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        backgroundColor: "#00796b",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        zIndex: "2000",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    💬
                </button>

                {/* Overlay */}
                {isChatbotOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999,
                        }}
                        onClick={() => setIsChatbotOpen(false)}
                    ></div>
                )}

                {/* Chatbot Container */}
                {isChatbotOpen && (
                    <div
                        className="chatbot-container"
                    >
                        <Chatbot setIsChatbotOpen={setIsChatbotOpen} />
                    </div>
                )}
            </div>
        </>
    );
}

export default ShoppingLayout;