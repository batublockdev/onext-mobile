import { createContext, useContext, useState } from 'react';

// 1️⃣ Create the context
const AppContext = createContext();

// 2️⃣ Provide it globally
export const AppProvider = ({ children }) => {
    const [userx, setUserx] = useState(null);

    return (
        <AppContext.Provider value={{ userx, setUserx }}>
            {children}
        </AppContext.Provider>
    );
};

// 3️⃣ Hook for easy access
export const useApp = () => useContext(AppContext);
