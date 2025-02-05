import { BrowserRouter, Routes, Route, RouterProvider} from "react-router-dom";
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
import React, { useContext } from "react";
import { 
    createBrowserRouter
} from "react-router-dom";



function App() {
    const { isAuthenticated, user } = useContext(UserContext);

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/auth",
            element: (
                <CheckAuthorization isAuthenticated={isAuthenticated} user={user}>
                    <AuthorizationLayout />
                </CheckAuthorization>
            ),
            children: [
                { path: "login", element: <Login /> },
                { path: "register", element: <Register /> }
            ]
        },
        {
            path: "/auth/forgot-password",
            element: <ForgotPassword />
        },
        {
            path: "/admin",
            element: (
                <CheckAuthorization isAuthenticated={isAuthenticated} user={user}>
                    <AdminLayout />
                </CheckAuthorization>
            ),
            children: [
                { index: true, element: <AdminDashboard /> },
                { path: "orders", element: <AdminOrders /> },
                { path: "products", element: <AdminProducts /> }
            ]
        },
        {
            path: "/shopping",
            element: (
                <CheckAuthorization isAuthenticated={isAuthenticated} user={user}>
                    <ShoppingLayout />
                </CheckAuthorization>
            ),
            children: [
                { index: true, element: <ShoppingHome /> },
                { path: "account", element: <ShoppingAccount /> },
                { path: "cart", element: <ShoppingCart /> },
                { path: "listing", element: <ShoppingListing /> },
                { path: "listing/:productid", element: <ShoppingProductDescription /> },
                { path: "search", element: <ShoppingSearch /> },
                { path: "checkout", element: <ShoppingCheckout /> },
                { path: "wishlist", element: <WishlistPage /> }
            ]
        },
        {
            path: "*",
            element: <NotFound />
        }
    ]);

    return (
        <>
            <ToastContainer />
            <RouterProvider router={router} />
        </>
    );
}

export default App;