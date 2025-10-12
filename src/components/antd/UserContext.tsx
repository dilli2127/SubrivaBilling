import React, { createContext, useContext, useMemo } from 'react';
import { getCurrentUser, User } from '../../helpers/auth';

const UserContext = createContext<User | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useMemo(() => {
    return getCurrentUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext); 