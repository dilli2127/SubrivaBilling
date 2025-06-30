import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import Layout from 'antd/es/layout';
import Menu from 'antd/es/menu';
import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import { useNavigate } from 'react-router-dom';
import { menuItems as originalMenuItems } from './menu';
import './Sidebar.css';

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const navigate = useNavigate();

  // Memoize user data parsing to avoid parsing on every render
  const userItem = useMemo(() => {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }, []);

  const handleOpenChange = useCallback(
    (keys: string[]) => {
      const latestOpenKey = keys.find(key => !openKeys.includes(key));
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    },
    [openKeys]
  );

  const showLogoutConfirm = useCallback(() => setIsModalVisible(true), []);
  const handleOk = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setIsModalVisible(false);
    navigate('/billing_login');
  }, [navigate]);
  const handleCancel = useCallback(() => setIsModalVisible(false), []);
  const handleMenuClick = useCallback(
    (key: string, path?: string) => {
      setSelectedKey(key);
      if (path) navigate(path);
    },
    [navigate]
  );

  // Role-based menu permissions mapping
  const roleMenuPermissions: Record<string, string[]> = {
    Admin: [
      'dashboard',
      'SalesRecords',
      'Stock Audit',
      'customers',
      'products',
      'payments',
      'reports',
      'master_settings',
    ],
    Manager: [
      'dashboard',
      'SalesRecords',
      'Stock Audit',
      'customers',
      'products',
      'payments',
      'reports',
    ],
    Staff: ['dashboard', 'SalesRecords', 'customers', 'products'],
    tenant: [
      'dashboard',
      'SalesRecords',
      'Stock Audit',
      'customers',
      'products',
      'payments',
      'reports',
      'master_settings',
    ],
    // Add more roles as needed
  };
  console.log('userItem', userItem);
  // Memoize menu items to prevent unnecessary re-renders
  const memoizedMenuItems = useMemo(() => {
    // Get user role from userItem
    const userRole =
      userItem?.roleItems?.name || userItem?.usertype || userItem?.user_role;
    let allowedKeys: string[];
    if (userRole && roleMenuPermissions[userRole]) {
      allowedKeys = roleMenuPermissions[userRole];
    } else {
      if (userItem?.usertype === 'superadmin') {
        debugger;
        allowedKeys = originalMenuItems.map((item: any) => item.key);
      } else {
        allowedKeys = [];
      }
    }
    // Filter menu items based on allowed keys
    const filterMenu = (items: any[]) =>
      items
        .filter(item => allowedKeys.includes(item.key))
        .map(item => {
          if (item.children) {
            // Optionally filter children here if you want more granular control
            return { ...item };
          }
          return item;
        });
    const filteredMenuItems = filterMenu(originalMenuItems);
    return filteredMenuItems.map((item: any) =>
      item.children ? (
        <React.Fragment key={item.key}>
          {item?.key === 'EMemories' && 'Produce'}
          <Menu.SubMenu
            key={item.key}
            icon={item.icon}
            title={item.label}
            popupClassName="custom-submenu-popup"
          >
            {item.children.map((child: any) => (
              <Menu.Item
                key={child.key}
                icon={child.icon}
                onClick={() => handleMenuClick(child.key, child.path)}
                className={`custom-subitem ${
                  selectedKey === child.key ? 'active' : ''
                }`}
              >
                {child.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        </React.Fragment>
      ) : (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          onClick={() => handleMenuClick(item.key, item.path)}
          className={`custom-menuitem ${
            selectedKey === item.key ? 'active' : ''
          }`}
        >
          {item.label}
        </Menu.Item>
      )
    );
  }, [selectedKey, handleMenuClick, userItem]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #ff6a00, #ee0979)',
          color: '#fff',
          padding: '0 16px',
          position: 'fixed',
          width: '100%',
          zIndex: 1000,
          height: 64,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: '#fff', fontSize: 18 }}
        />
        <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
          Fresh Focuz Billing
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userItem && (
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Welcome, {(userItem?.name || userItem?.username)?.toUpperCase()}
            </span>
          )}
          <Button
            icon={<LogoutOutlined />}
            type="primary"
            danger
            onClick={showLogoutConfirm}
          >
            Logout
          </Button>
        </div>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            background: 'linear-gradient(180deg, #4e54c8, #8f94fb)',
            position: 'fixed',
            top: 64,
            height: 'calc(100vh - 64px)', // subtract header height
            overflow: 'hidden', // disable overflow here
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)',
            zIndex: 999,
          }}
        >
          <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 32 }}>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              theme="light"
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              inlineCollapsed={collapsed}
              style={{
                background: 'transparent',
                color: '#fff',
                paddingTop: 16,
                fontWeight: 500,
              }}
            >
              {memoizedMenuItems}
            </Menu>
          </div>
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 240,
            transition: 'margin-left 0.3s ease',
            background: '#f4f6f8',
          }}
        >
          <Content
            style={{
              padding: 24,
              marginTop: 64,
              background: '#fff',
              minHeight: 'calc(100vh - 64px)',
              borderRadius: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              overflowY: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Confirm Logout"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
        centered
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </Layout>
  );
};

export default Sidebar;
