import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Try to get user data from localStorage on initial load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            } catch (error) {
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const isAuthenticated = !!user;

    const setUserGlobal = (userData) => {
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
        }
        setUser(userData);
    };

    if (isLoading) {
        return null; // or a loading spinner
    }

    return (
        <UserContext.Provider value={{ user, isAuthenticated, setUserGlobal }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

export { UserContext };