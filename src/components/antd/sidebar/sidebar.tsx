import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Modal, Button } from 'antd';
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
      <Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          Subriva Billing
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userItem && (
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              Welcome, {(userItem.name || userItem.username)?.toUpperCase()}
            </span>
          )}
          <Button
            icon={<LogoutOutlined />}
            type="primary"
            danger
            onClick={() => setIsModalVisible(true)}
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
          style={{
            background: 'linear-gradient(180deg, #4e54c8, #8f94fb)',
            position: 'fixed',
            top: 64,
            height: 'calc(100vh - 64px)',
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
