import React, { createContext, useState, useEffect } from "react";

// Create the context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState(null);

  // Load user from localStorage when the app starts
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) setLoggedUser(savedUser);
  }, []);

  // Keep localStorage in sync with context
  useEffect(() => {
    if (loggedUser) {
      localStorage.setItem("user", JSON.stringify(loggedUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [loggedUser]);

  const logout = () => {
    setLoggedUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ loggedUser, setLoggedUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
