import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserContext } from './pages/authorization/UserContext';
import CheckAuthorization from "./components/common/CheckAuthorization";
import AdminLayout from "./components/admin-view/Layout";
import AuthorizationLayout from "./components/authorization/Layout";
import ShoppingLayout from "./components/shopping-view/Layout";
import NotFound from "./pages/not-found/NotFound";
import Login from "./pages/authorization/Login";
import Register from "./pages/authorization/Register";
import AdminDashboard from "./pages/admin-view/dashboard/Dashboard";
import AdminOrders from "./pages/admin-view/orders/Orders";
import AdminProducts from "./pages/admin-view/products/Products";
import ShoppingHome from "./pages/shopping-view/home/Home";
import ShoppingAccount from "./pages/shopping-view/account/Account";
import ShoppingCart from "./pages/shopping-view/cart/Cart";
import ShoppingListing from "./pages/shopping-view/listing/Listing";
import ShoppingProductDescription from "./pages/shopping-view/listing/ProductDescription";
import ShoppingSearch from "./pages/shopping-view/search/Search";
import ShoppingCheckout from "./pages/shopping-view/checkout/Checkout";
import ForgotPassword from './pages/authorization/ForgotPassword'
import WishlistPage from './pages/shopping-view/wishlist/Wishlist'
import Home from "./pages/Home";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    
    const { isAuthenticated, user } = useContext(UserContext);

    return (
            <BrowserRouter>
                <ToastContainer />
                <Routes>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/auth"
                        element={
                            <CheckAuthorization isAuthenticated={isAuthenticated} user={user}>
                                <AuthorizationLayout />
                            </CheckAuthorization>
                        }
                    >
                        <Route path="/auth/login" element={<Login />} />
                        <Route path="/auth/register" element={<Register />} />
                    </Route>
                    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                    <Route
                        path="/admin"
                        element={
                            <CheckAuthorization isAuthenticated={isAuthenticated} user={user}>
                                <AdminLayout />
                            </CheckAuthorization>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="products" element={<AdminProducts />} />
                    </Route>
                    <Route
                        path="/shopping"
                        element={
                            <CheckAuthorization isAuthenticated={isAuthenticated} user={user}>
                                <ShoppingLayout />
                            </CheckAuthorization>
                        }
                    >
                        <Route index element={<ShoppingHome />} />
                        <Route path="account" element={<ShoppingAccount />} />
                        <Route path="cart" element={<ShoppingCart />} />
                        <Route path="listing" element={<ShoppingListing />} />
                        <Route path="listing/:productid" element={<ShoppingProductDescription />} />
                        <Route path="search" element={<ShoppingSearch />} />
                        <Route path="checkout" element={<ShoppingCheckout />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
    );
}

export default App;