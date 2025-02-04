import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

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

    return (
        <UserContext.Provider value={{ user, isAuthenticated, setUserGlobal }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

export { UserContext };