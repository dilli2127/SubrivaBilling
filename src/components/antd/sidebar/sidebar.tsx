import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined, // Add this import
  BgColorsOutlined,
} from '@ant-design/icons';
import {
  Layout,
  Menu,
  Modal,
  Button,
  Avatar,
  Popover,
  Select,
  Drawer,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { menuItems as originalMenuItems } from './menu';
import './Sidebar.css';
import ThemeDrawer from './ThemeDrawer';

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const themePresets = [
  {
    key: 'classic',
    label: 'Classic',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #4e54c8 60%, #8f94fb 100%)',
      '--header-bg': 'linear-gradient(90deg, #e5daff, #c5c8ee)',
      '--menu-item-selected':
        'linear-gradient(90deg, #ff6a00 60%, #ee0979 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #ee0979 60%, #ff6a00 100%)',
      '--header-title': '#4e54c8',
      '--profile-avatar': '#4e54c8',
    },
    previewColor: '#4e54c8',
  },
  {
    key: 'sunset',
    label: 'Sunset',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #ff9966 60%, #ff5e62 100%)',
      '--header-bg': 'linear-gradient(90deg, #fceabb, #f8b500)',
      '--menu-item-selected':
        'linear-gradient(90deg, #ff9966 60%, #ff5e62 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #ff5e62 60%, #ff9966 100%)',
      '--header-title': '#ff5e62',
      '--profile-avatar': '#ff9966',
    },
    previewColor: '#ff9966',
  },
  {
    key: 'dark',
    label: 'Dark',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #232526 60%, #414345 100%)',
      '--header-bg': 'linear-gradient(90deg, #232526, #414345)',
      '--menu-item-selected':
        'linear-gradient(90deg, #232526 60%, #414345 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #414345 60%, #232526 100%)',
      '--header-title': '#fff',
      '--profile-avatar': '#fff',
    },
    previewColor: '#232526',
  },
  {
    key: 'aqua',
    label: 'Aqua',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #43cea2 60%, #185a9d 100%)',
      '--header-bg': 'linear-gradient(90deg, #43cea2, #185a9d)',
      '--menu-item-selected':
        'linear-gradient(90deg, #43cea2 60%, #185a9d 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #185a9d 60%, #43cea2 100%)',
      '--header-title': '#185a9d',
      '--profile-avatar': '#43cea2',
    },
    previewColor: '#43cea2',
  },
  {
    key: 'peach',
    label: 'Peach',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #ffecd2 60%, #fcb69f 100%)',
      '--header-bg': 'linear-gradient(90deg, #ffecd2, #fcb69f)',
      '--menu-item-selected':
        'linear-gradient(90deg, #fcb69f 60%, #ffecd2 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #ffecd2 60%, #fcb69f 100%)',
      '--header-title': '#fcb69f',
      '--profile-avatar': '#fcb69f',
    },
    previewColor: '#fcb69f',
  },
  {
    key: 'sky',
    label: 'Sky',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #36d1c4 60%, #5b86e5 100%)',
      '--header-bg': 'linear-gradient(90deg, #36d1c4, #5b86e5)',
      '--menu-item-selected':
        'linear-gradient(90deg, #36d1c4 60%, #5b86e5 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #5b86e5 60%, #36d1c4 100%)',
      '--header-title': '#36d1c4',
      '--profile-avatar': '#36d1c4',
    },
    previewColor: '#36d1c4',
  },
  {
    key: 'violet',
    label: 'Violet',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #8f94fb 60%, #4e54c8 100%)',
      '--header-bg': 'linear-gradient(90deg, #bba7ed, #cccff6)',
      '--menu-item-selected':
        'linear-gradient(90deg, #8f94fb 60%, #4e54c8 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #4e54c8 60%, #8f94fb 100%)',
      '--header-title': '#8f94fb',
      '--profile-avatar': '#8f94fb',
    },
    previewColor: '#8f94fb',
  },
  {
    key: 'rose',
    label: 'Rose',
    variables: {
      '--sidebar-bg': 'linear-gradient(180deg, #f857a6 60%, #ff5858 100%)',
      '--header-bg': 'linear-gradient(90deg, #f857a6, #ff5858)',
      '--menu-item-selected':
        'linear-gradient(90deg, #f857a6 60%, #ff5858 100%)',
      '--menu-item-hover': 'linear-gradient(90deg, #ff5858 60%, #f857a6 100%)',
      '--header-title': '#f857a6',
      '--profile-avatar': '#f857a6',
    },
    previewColor: '#f857a6',
  },
];

const themeGroups = [
  {
    title: 'Classic',
    keys: ['classic', 'violet', 'dark', 'sunset'],
  },
  {
    title: 'Modern',
    keys: ['aqua', 'peach', 'sky', 'rose'],
  },
];

const getInitialTheme = () => {
  const saved = localStorage.getItem('sidebarTheme');
  return saved || 'classic';
};

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
  const [theme, setTheme] = useState(getInitialTheme());
  const [themePopoverVisible, setThemePopoverVisible] = useState(false);
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

  // Apply theme variables
  React.useEffect(() => {
    const preset = themePresets.find(t => t.key === theme) || themePresets[0];
    Object.entries(preset.variables).forEach(([key, value]) => {
      document.body.style.setProperty(key, value);
    });
    localStorage.setItem('sidebarTheme', theme);
  }, [theme]);

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

  const ThemePreview = ({ preset, selected, onClick }: any) => (
    <div
      onClick={onClick}
      style={{
        border: selected ? '2px solid #4e54c8' : '1px solid #ccc',
        borderRadius: 12,
        padding: 10,
        margin: 6,
        width: 110,
        cursor: 'pointer',
        background: '#fff',
        boxShadow: selected ? '0 0 8px #4e54c8' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, border 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
        {preset.label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ color: '#888', fontWeight: 500 }}>Menu–1</div>
        <div style={{ color: '#888', fontWeight: 500 }}>Menu–2</div>
        <div
          style={{
            background: preset.previewColor,
            color: '#fff',
            borderRadius: 8,
            padding: '2px 8px',
            fontWeight: 600,
            width: 'fit-content',
          }}
        >
          Selected Menu
        </div>
        <div style={{ color: '#888', fontWeight: 500 }}>Menu–4</div>
      </div>
    </div>
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
                    color: 'var(--profile-avatar)',
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

      {/* Floating Theme Button */}
      <Button
        icon={<BgColorsOutlined style={{ fontSize: 22 }} />}
        style={{
          position: 'fixed',
          top: '50%',
          right: 0,
          zIndex: 2000,
          background: '#fff',
          border: '1px solid #eee',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          borderRadius: '8px 0 0 8px',
          padding: '10px 12px',
          transform: 'translateY(-50%)',
        }}
        onClick={() => setThemeDrawerOpen(true)}
      />
      {/* Theme Drawer as separate component */}
      <ThemeDrawer
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
        theme={theme}
        setTheme={setTheme}
        themePresets={themePresets}
      />

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
