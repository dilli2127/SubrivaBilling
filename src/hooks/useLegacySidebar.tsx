import React from 'react';
import {
  LegacySidebarContext,
  LegacySidebarContextProps,
} from '../components/Sidebar/LegacySidebarContext';

export const useLegacySidebar = (): LegacySidebarContextProps | undefined => {
  const context = React.useContext(LegacySidebarContext);

  return context;
};
