import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined, // Add this import
} from '@ant-design/icons';
import { Layout, Menu, Modal, Button, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { menuItems as originalMenuItems } from './menu';
import './Sidebar.css';

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const getAllowedMenuKeys = (user: any): string[] => {
  const role =
    user?.roleItems?.name?.toLowerCase() ||
    user?.usertype?.toLowerCase() ||
    user?.user_role?.toLowerCase();

  const allowed = Array.isArray(user?.roleItems?.allowedMenuKeys)
    ? user.roleItems.allowedMenuKeys
    : [];

  if (role === 'superadmin') {
    // Return all menu keys (including children) for superadmin
    const getAllKeys = (items: any[]): string[] =>
      items.reduce((acc: string[], item: any) => {
        acc.push(item.key);
        if (item.children) {
          acc.push(...getAllKeys(item.children));
        }
        return acc;
      }, []);
    return getAllKeys(originalMenuItems);
  }

  if (role === 'tenant') {
    return getAllKeysExcludingTenantManage(originalMenuItems);
  }

  return allowed;
};

const getAllKeysExcludingTenantManage = (items: any[]): string[] =>
  items.reduce((acc: string[], item: any) => {
    if (item.key === 'tenant_manage') return acc;
    acc.push(item.key);
    if (item.children) {
      acc.push(...getAllKeysExcludingTenantManage(item.children));
    }
    return acc;
  }, []);

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const userItem = useMemo(() => {
    const data = sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }, []);

  const allowedKeys = useMemo(() => getAllowedMenuKeys(userItem), [userItem]);

  const handleOpenChange = useCallback(
    (keys: string[]) => {
      const latestOpenKey = keys.find(key => !openKeys.includes(key));
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    },
    [openKeys]
  );

  const handleMenuClick = useCallback(
    (key: string, path?: string) => {
      setSelectedKey(key);
      if (path) navigate(path);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    sessionStorage.clear();
    setIsModalVisible(false);
    navigate('/billing_login');
  }, [navigate]);

  const filteredMenuItems = useMemo(() => {
    const filterMenu = (items: any[]): any[] =>
      items
        .filter(
          (item: any) =>
            allowedKeys.includes(item.key) ||
            item.children?.some((child: any) => allowedKeys.includes(child.key))
        )
        .map((item: any) => {
          if (item.children) {
            const children = filterMenu(item.children);
            return children.length > 0 ? { ...item, children } : null;
          }
          return item;
        })
        .filter(Boolean);

    return filterMenu(originalMenuItems);
  }, [allowedKeys]);

  const renderMenuItems = (items: any[]) =>
    items.map(item =>
      item.children ? (
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
              className={`custom-subitem ${selectedKey === child.key ? 'active' : ''}`}
            >
              {child.label}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ) : (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          onClick={() => handleMenuClick(item.key, item.path)}
          className={`custom-menuitem ${selectedKey === item.key ? 'active' : ''}`}
        >
          {item.label}
        </Menu.Item>
      )
    );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header className="custom-header">
        <div className="header-left">
          <div className="logo-placeholder">
            <img
              src={require('../../../assets/img/ffslogo.png')}
              alt="Logo"
              className="login-logo-rich"
              style={{ marginTop: '10px' }}
            />
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle-btn"
          />
        </div>
        <h2 className="header-title">Subriva Billing</h2>
        <div className="header-right">
          {userItem && (
            <>
              <span className="welcome-text">
                Welcome, {(userItem.name || userItem.username)?.toUpperCase()}
              </span>
              <span title="Profile">
                <Avatar
                  className="profile-avatar"
                  icon={<UserOutlined />}
                  onClick={() => navigate('/profile')}
                  style={{
                    cursor: 'pointer',
                    background: '#fff',
                    color: '#4e54c8',
                    marginLeft: 8,
                  }}
                />
              </span>
            </>
          )}
          <Button
            icon={<LogoutOutlined />}
            type="primary"
            danger
            onClick={() => setIsModalVisible(true)}
            className="logout-btn"
          >
            Logout
          </Button>
        </div>
      </Header>

      {/* Sidebar + Content */}
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          width={240}
          className="custom-sider"
        >
          <div className="sidebar-content">
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              theme="light"
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              inlineCollapsed={collapsed}
              className="custom-menu"
            >
              {renderMenuItems(filteredMenuItems)}
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

      {/* Logout Modal */}
      <Modal
        title="Confirm Logout"
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsModalVisible(false)}
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
