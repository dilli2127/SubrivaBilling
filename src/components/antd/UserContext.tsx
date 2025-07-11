import React, { createContext, useContext, useMemo } from 'react';

interface User {
  name?: string;
  username?: string;
  roleItems?: any;
  usertype?: string;
  user_role?: string;
  organisationItems?: any;
  branchItems?: any;
  // Add other user properties as needed
}

const UserContext = createContext<User | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useMemo(() => {
    const data = sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext); 