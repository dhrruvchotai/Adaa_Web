import { useLocation, Navigate } from "react-router-dom";

function CheckAuthorization({ isAuthenticated, user, children }) {
    const location = useLocation();

    const isAuthPath = location.pathname.includes("/login") || location.pathname.includes("/register");
    const isAdminPath = location.pathname.includes("/admin");
    const isShoppingPath = location.pathname.includes("/shopping");

    if (!isAuthenticated && !isAuthPath) {
        return <Navigate to="/auth/login" state={{ from: location }} />;
    }

    if (isAuthenticated && isAuthPath) {
        return <Navigate to={user.role === "admin" ? "/admin" : "/shopping"} />;
    }

    if (isAuthenticated && user.Role !== "admin" && isAdminPath) {
        return <Navigate to="/auth/login" />;
    }

    if (isAuthenticated && user.Role === "admin" && isShoppingPath) {
        return <Navigate to="/admin" />;
    }

    return <>{children}</>;
}

export default CheckAuthorization;