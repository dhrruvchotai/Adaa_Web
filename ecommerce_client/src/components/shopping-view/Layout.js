import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from 'lucide-react';
import { FiShoppingBag } from "react-icons/fi";
import useUserDetails from "../../pages/useUserDetails";
import { getCartByEmail } from "../../pages/shopping-view/API";
import Chatbot from "../../components/shopping-view/Chatbot";
import './style.css';

function ShoppingLayout() {
    const location = useLocation();
    const { userData, isUserDataReady } = useUserDetails();
    const [userInitial, setUserInitial] = useState("");
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        localStorage.removeItem("user");
        sessionStorage.removeItem('user');
        window.location.href = "/";
    };

    const handleNavigation = (path) => {
        setIsChatbotOpen(false);
        setIsMenuOpen(false);
        navigate(path);
    };

    const isActive = (item) => {
        if (item.state?.category) {
            return selectedCategory === item.state.category;
        }
        return location.pathname === item.path && !selectedCategory;
    };

    const navItems = [
        { path: "/shopping", label: "Home" },
        { path: "/shopping/listing", label: "Products" },
        { path: "/shopping/listing", label: "Men", state: { category: "Male" } },
        { path: "/shopping/listing", label: "Women", state: { category: "Female" } },
        { path: "/shopping/search", label: "Search" },
        { path: "/shopping/wishlist", label: "Wishlist" }
    ];

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
                        <motion.div>
                            <motion.h1>Adaa</motion.h1>
                        </motion.div>
                    </Link>

                    {/* Mobile menu button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="navbar-toggler border-0"
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-controls="navbarContent"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
                    >
                        {isMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
                    </motion.button>

                    <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarContent">
                        {/* Navigation Items */}
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                            {navItems.map((item) => {
                                const active = isActive(item);
                                return (
                                    <motion.li
                                        key={item.label}
                                        className="nav-item"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            to={item.path}
                                            state={item.state}
                                            className={`nav-link px-3 position-relative text-white ${active ? 'active fw-bold' : ''}`}
                                            onClick={() => handleNavigation(item.path)}
                                        >
                                            {item.label}
                                            {active && (
                                                <motion.div
                                                    className="position-absolute bottom-0 start-0 w-100"
                                                    style={{ height: '2px', backgroundColor: '#fff' }}
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </ul>

                        {/* User Actions */}
                        <div className="d-flex align-items-center gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/shopping/cart" className="position-relative text-white">
                                    <FiShoppingBag size={30} />
                                    {cartItemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        >
                                            {cartItemCount}
                                        </motion.span>
                                    )}
                                </Link>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/shopping/account" className="text-decoration-none">
                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center text-dark"
                                         style={{ width: '32px', height: '32px' }}>
                                        {userInitial}
                                    </div>
                                </Link>
                            </motion.div>

                            {userData && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="btn btn-danger d-flex align-items-center gap-2"
                                >
                                    <LogOut size={19} />
                                    {/* <span>Logout</span> */}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            <div className="pt-5 mt-3">
                <Outlet />
            </div>

            {/* Chatbot */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className="btn btn-teal position-fixed bottom-0 end-0 m-4 rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                    width: '56px', 
                    height: '56px',
                    backgroundColor: 'black',
                    color: 'white',
                    zIndex: 1050 
                }}
            >
                💬
            </motion.button>

            <AnimatePresence>
                {isChatbotOpen && (
                    <>
                        {/* <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50"
                            style={{ zIndex: 1040 }}
                            onClick={() => setIsChatbotOpen(false)}
                        /> */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="position-fixed bottom-0 end-0 mb-5 me-4"
                            style={{ zIndex: 1050 }}
                        >
                            {/* <div className="chatbot-container"> */}
                                <Chatbot setIsChatbotOpen={setIsChatbotOpen} />
                            {/* </div> */}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default ShoppingLayout;