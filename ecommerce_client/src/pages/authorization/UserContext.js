import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const isAuthenticated = !!user;

    return (
        <UserContext.Provider value={{ user, isAuthenticated, setUserGlobal: setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};

export { UserContext };