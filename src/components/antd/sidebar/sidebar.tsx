import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import { getCurrentUser, User } from '../../../helpers/auth';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined, // Add this import
  BgColorsOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Modal, Button, Avatar, Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { menuItems as originalMenuItems, getFilteredMenuItems } from './menu';
import './Sidebar.css';
import ThemeDrawer from './ThemeDrawer';
import { themePresets } from './themePresets';
import { useSessionStorage } from '../../../hooks/useLocalStorage';
import UpdateStatus from '../../common/UpdateStatus';

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const getInitialTheme = () => {
  const saved = localStorage.getItem('sidebarTheme');
  return saved || 'classic';
};

// Removed getAllowedMenuKeys - now using permission-based filtering

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false); // Start with expanded sidebar
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getInitialTheme());
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

  // Use custom hooks for better storage management
  const [sidebarBg, setSidebarBg] = useSessionStorage('sidebarBg', '');
  const [sidebarPosition, setSidebarPosition] = useSessionStorage(
    'sidebarPosition',
    'left'
  );

  // Draggable button state
  const [buttonTop, setButtonTop] = useState(20); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartTop, setDragStartTop] = useState(0);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply theme variables
  React.useEffect(() => {
    const preset = themePresets.find(t => t.key === theme) || themePresets[0];
    Object.entries(preset.variables).forEach(([key, value]) => {
      document.body.style.setProperty(key, value);
    });
    localStorage.setItem('sidebarTheme', theme);
    // Enable dark mode class for the full app
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  const userItem: User | null = useMemo(() => {
    return getCurrentUser();
  }, []);

  // Removed allowedKeys - now using permission-based filtering

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
      // Close mobile drawer when menu item is clicked
      if (isMobile) {
        setMobileDrawerOpen(false);
      }
    },
    [navigate, isMobile]
  );

  const handleLogout = useCallback(() => {
    sessionStorage.clear();
    setIsModalVisible(false);
    navigate('/billing_login');
  }, [navigate]);

  // Draggable button handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStartY(e.clientY);
      setDragStartTop(buttonTop);
    },
    [buttonTop]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStartY;
      const windowHeight = window.innerHeight;
      const buttonHeight = 44; // Approximate button height
      const maxTop = windowHeight - buttonHeight;

      // Convert percentage to pixels for calculation
      const currentTopPx = (dragStartTop / 100) * windowHeight;
      const newTopPx = Math.max(0, Math.min(maxTop, currentTopPx + deltaY));
      const newTopPercent = (newTopPx / windowHeight) * 100;

      setButtonTop(newTopPercent);
    },
    [isDragging, dragStartY, dragStartTop]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  useLayoutEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Memoize filteredMenuItems
  const filteredMenuItems = useMemo(() => {
    // Use the new permission-based filtering directly
    const items = getFilteredMenuItems();
    return items;
  }, [userItem]); // Re-compute when user changes

  // Memoize renderMenuItems
  const renderMenuItems = useCallback(
    (items: any[]) =>
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
      ),
    [selectedKey, handleMenuClick]
  );

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  // Motivational messages
  const messages = [
    "🚀 Let's make today amazing!",
    '💡 Remember: Small steps = Big results.',
    '🔥 Stay positive, work hard, make it happen!',
    '🎯 Focus and win the day.',
    '🌟 Welcome back! Ready to shine?',
    "Unlike the stomach, the brain doesn't alert when it's empty",
  ];
  function getRandomMessage() {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header className="custom-header">
        <div className="header-left">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle-btn"
          />
          <div className="logo-placeholder">
            <img
              src={require('../../../assets/img/ffslogo.png')}
              alt="Logo"
              className="login-logo-rich"
              style={{ marginTop: '10px' }}
            />
          </div>
          <div className="description-branch">
            {userItem?.roleItems?.description ? (
              <>
                <div>{userItem?.roleItems?.name}</div>
                <div>{userItem?.branchItems?.branch_name}</div>
              </>
            ) : (
              <>
                <div>{userItem?.user_role?.toUpperCase()}</div>
                <div>{userItem?.usertype?.toUpperCase()}</div>
              </>
            )}
          </div>
        </div>
        <h2 className="header-title">Subriva Billing</h2>
        <div className="header-right">
          <UpdateStatus className="update-status-header" />

          {userItem && (
            <>
              <div>
                <span className="welcome-mse">{getGreeting()},</span>
                <span className="welcome-text">
                  {(userItem.name || userItem.organization_name)?.toUpperCase()}
                </span>
                <div className="have-a-nice-day">{getRandomMessage()}</div>
              </div>

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
        {sidebarPosition !== 'top' && !isMobile && (
          <Sider
            collapsible
            collapsed={collapsed}
            width={240}
            className="custom-sider"
            style={{
              background: sidebarBg
                ? `url(${sidebarBg}) center center / cover no-repeat`
                : 'var(--sidebar-bg, linear-gradient(180deg, #4e54c8 60%, #8f94fb 100%))',
              position: 'fixed',
              left: sidebarPosition === 'left' ? 0 : 'auto',
              right: sidebarPosition === 'right' ? 0 : 'auto',
            }}
          >
            {' '}
            {sidebarBg && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(24, 25, 26, 0.65)',
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />
            )}
            <div
              className="sidebar-content"
              style={{ position: 'relative', zIndex: 2 }}
            >
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
        )}
        {sidebarPosition === 'top' && (
          <div
            style={{
              width: '100%',
              position: 'fixed',
              top: 64,
              left: 0,
              zIndex: 999,
              background: sidebarBg
                ? `url(${sidebarBg}) center center / cover no-repeat`
                : 'var(--sidebar-bg, linear-gradient(180deg, #4e54c8 60%, #8f94fb 100%))',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              minHeight: 56,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              theme="light"
              className="custom-menu"
              style={{ flex: 1, background: 'transparent' }}
            >
              {renderMenuItems(filteredMenuItems)}
            </Menu>
          </div>
        )}
        <Layout
          style={{
            marginLeft: isMobile ? 0 : (sidebarPosition === 'left' ? (collapsed ? 80 : 240) : 0),
            marginRight: isMobile ? 0 : (sidebarPosition === 'right' ? (collapsed ? 80 : 240) : 0),
            marginTop: sidebarPosition === 'top' ? 120 : 64, // 64 header + 56 menu
            transition:
              'margin-left 0.3s ease, margin-right 0.3s ease, margin-top 0.3s ease',
            background: '#f4f6f8',
          }}
        >
          <Content
            style={{
              padding: 24,
              marginTop: 0,
              background: '#fff',
              minHeight: 'calc(100vh - 64px)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              overflowY: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      {/* Floating Theme Button - Now Draggable */}
      {!isMobile && (
        <Button
          icon={<BgColorsOutlined style={{ fontSize: 22 }} />}
          style={{
            position: 'fixed',
            top: `${buttonTop}%`,
            right: 0,
            zIndex: 2000,
            background: '#fff',
            border: '1px solid #eee',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            borderRadius: '8px 0 0 8px',
            padding: '10px 12px',
            transform: 'translateY(-50%)',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
          onClick={() => setThemeDrawerOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          <button
            className={`mobile-nav-item ${selectedKey === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard', '/dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </button>
          
          <button
            className={`mobile-nav-item ${selectedKey.includes('bill') ? 'active' : ''}`}
            onClick={() => handleMenuClick('retail_bill', '/retail-bill')}
          >
            <span className="nav-icon">📄</span>
            <span className="nav-label">Billing</span>
          </button>
          
          <button
            className="mobile-nav-item mobile-nav-menu-btn"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <span className="nav-icon menu-icon">
              <MenuOutlined />
            </span>
            <span className="nav-label">Menu</span>
          </button>
          
          <button
            className={`mobile-nav-item ${selectedKey.includes('report') ? 'active' : ''}`}
            onClick={() => handleMenuClick('reports', '/reports')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Reports</span>
          </button>
          
          <button
            className="mobile-nav-item"
            onClick={() => navigate('/profile')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        title="All Navigation"
        placement="bottom"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        height="70vh"
        styles={{
          header: {
            background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
            borderBottom: 'none',
          },
          body: {
            padding: 0,
            background: 'linear-gradient(180deg, #4e54c8 60%, #8f94fb 100%)',
          },
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          theme="light"
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          className="custom-menu"
          style={{
            background: 'transparent',
            border: 'none',
            height: '100%',
          }}
        >
          {renderMenuItems(filteredMenuItems)}
        </Menu>
      </Drawer>
      {/* Theme Drawer as separate component */}
      <ThemeDrawer
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
        theme={theme}
        setTheme={setTheme}
        themePresets={themePresets}
        sidebarBg={sidebarBg}
        setSidebarBg={setSidebarBg}
        sidebarPosition={sidebarPosition}
        setSidebarPosition={setSidebarPosition}
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
