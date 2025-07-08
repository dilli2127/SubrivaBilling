import React, { createContext, useContext, useState, type ReactNode } from 'react'
import Header from './layout/header'
import { Layout as AntdLayout } from "antd"
import Sidebar from './layout/sidebar'
import { Outlet } from 'react-router-dom'
import { Content } from 'antd/es/layout/layout'

export const LayoutContext = createContext({})

interface SidebarProps {
  children: ReactNode;
}


const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
    width: 'calc(50% - 8px)',
    maxWidth: 'calc(50% - 8px)',
  };
  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    height: 64,
    paddingInline: 48,
    lineHeight: '64px',
    backgroundColor: '#4096ff',
  };

  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    minHeight: 120,
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#0958d9',
  };

  const siderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    color: '#fff',
    backgroundColor: '#1677ff',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#4096ff',
  };
  return (
    <div>
      <LayoutContext.Provider value={{ setCollapsed: setCollapsed, collapsed: collapsed }} >
        <AntdLayout style={{ width: "100vw",}}>
          <Header />
          <Sidebar />
          <Content style={{ padding: 24, width: "100%" }}>
            <div className='content_container'>
              <Outlet />
            </div>
          </Content>
        </AntdLayout>
      </LayoutContext.Provider>
    </div>
  )
}

export default Layout
