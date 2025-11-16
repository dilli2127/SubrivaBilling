import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  useEffect,
} from 'react';
import { getCurrentUser, User, clearAuthData, getAuthToken } from '../../../helpers/auth';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BgColorsOutlined,
  MenuOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Modal, Button, Avatar, Drawer, Badge, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getFilteredMenuItems } from './menu';
import './Sidebar.css';
import ThemeDrawer from './ThemeDrawer';
import { themePresets } from './themePresets';
import { useSessionStorage } from '../../../hooks/useLocalStorage';
import UpdateStatus from '../../common/UpdateStatus';
import { getApiModeConfig } from '../../../helpers/apiModeHelper';
import { isElectron } from '../../../helpers/environment';
import { useGetSubscriptionStatusQuery } from '../../../services/redux/api/endpoints';
import { processSubscriptionStatus, getSubscriptionMessage } from '../../../utils/subscriptionUtils';
import { apiSlice } from '../../../services/redux/api/apiSlice';
import { isSuperAdmin } from '../../../helpers/permissionHelper';

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const getInitialTheme = () => {
  const saved = localStorage.getItem('sidebarTheme');
  return saved || 'professional';
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
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(getInitialTheme());
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

  // Use custom hooks for better storage management
  const [sidebarBg, setSidebarBg] = useSessionStorage('sidebarBg', '');
  const [sidebarPosition, setSidebarPosition] = useSessionStorage(
    'sidebarPosition',
    'left'
  );
  
  // Get API mode for badge (Electron only)
  const isElectronApp = isElectron();
  const [apiMode, setApiMode] = useState(getApiModeConfig().mode);
  
  // Get current user - must be declared before using in subscriptionData query
  const userItem: User | null = useMemo(() => {
    return getCurrentUser();
  }, []);
  
  // Check subscription status using RTK Query
  // Skip if no user (not logged in) to prevent unnecessary calls
  const { data: subscriptionData } = useGetSubscriptionStatusQuery(undefined, {
    pollingInterval: 60 * 60 * 1000, // Poll every hour
    skip: !userItem || !getAuthToken() || isSuperAdmin(), // Skip for not logged in/no token/superadmin
  });
  
  // Show subscription warnings
  useEffect(() => {
    if (subscriptionData) {
      // Ignore non-200 or missing-tenant responses
      const statusCode = (subscriptionData as any)?.statusCode;
      const messageText = (subscriptionData as any)?.message?.toLowerCase?.() || '';
      if (statusCode !== 200 || messageText.includes('tenant id not found')) {
        return;
      }
      // Bypass subscription checks for superadmin
      if (isSuperAdmin()) {
        return;
      }
      const status = processSubscriptionStatus(subscriptionData);
      
      if (!status.isActive && status.message !== 'Working in offline mode - subscription will be verified when online') {
        Modal.warning({
          title: 'Subscription Status',
          content: getSubscriptionMessage(status.isActive, status.daysRemaining, status.expiryDate),
        });
      } else if (status.daysRemaining && status.daysRemaining <= 7) {
        // Show warning for expiring soon
        Modal.info({
          title: 'Subscription Expiring Soon',
          content: getSubscriptionMessage(status.isActive, status.daysRemaining, status.expiryDate),
        });
      }
    }
  }, [subscriptionData]);
  
  // Toggle API mode
  const handleToggleMode = () => {
    Modal.confirm({
      title: `Switch to ${apiMode === 'online' ? 'Offline' : 'Online'} Mode?`,
      content: (
        <div>
          {apiMode === 'online' ? (
            <>
              <p>You are about to switch to <strong>Offline Mode</strong>.</p>
              <p>• The application will connect to your local server</p>
              <p>• Make sure your local server is running</p>
              <p>• <strong>You will be logged out and need to login again</strong></p>
            </>
          ) : (
            <>
              <p>You are about to switch to <strong>Online Mode</strong>.</p>
              <p>• The application will connect to the default hosted server</p>
              <p>• All data will sync to online server</p>
              <p>• <strong>You will be logged out and need to login again</strong></p>
            </>
          )}
        </div>
      ),
      okText: 'Switch & Login Again',
      cancelText: 'Cancel',
      onOk: () => {
        const newMode = apiMode === 'online' ? 'offline' : 'online';
        const { setApiModeConfig } = require('../../../helpers/apiModeHelper');
        const { clearAuthData } = require('../../../helpers/auth');
        
        // Save new mode
        setApiModeConfig({ mode: newMode });
        
        // Clear all authentication data
        clearAuthData();
        
        // Clear all localStorage except the API mode config
        const apiModeConfig = localStorage.getItem('api_mode_config');
        localStorage.clear();
        if (apiModeConfig) {
          localStorage.setItem('api_mode_config', apiModeConfig);
        }
        
        // Redirect to login page
        window.location.href = '#/billing_login';
        window.location.reload();
      },
    });
  };

  // Draggable button state
  const [buttonTop, setButtonTop] = useState(20); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartTop, setDragStartTop] = useState(0);

  // Check if mobile screen - memoized to prevent recreation
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Memoize theme preset to prevent recreation
  const themePreset = useMemo(() => 
    themePresets.find(t => t.key === theme) || themePresets[0], 
    [theme]
  );

  // Apply theme variables - memoized to prevent recreation
  const applyTheme = useCallback(() => {
    Object.entries(themePreset.variables).forEach(([key, value]) => {
      document.body.style.setProperty(key, value);
    });
    localStorage.setItem('sidebarTheme', theme);
    // Enable dark mode class for the full app (for dark themes)
    const darkThemes = ['modern-dark', 'midnight-blue', 'charcoal-modern', 'navy-classic', 'corporate'];
    if (darkThemes.includes(theme)) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme, themePreset]);

  React.useEffect(() => {
    applyTheme();
  }, [applyTheme]);

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
    // Clear RTK Query cache (this clears all cached API data)
    dispatch(apiSlice.util.resetApiState());
    
    // Clear all authentication data, permissions, and cache
    clearAuthData();
    sessionStorage.clear(); // Clear all session storage
    localStorage.clear(); // Clear all local storage
    setIsModalVisible(false);
    navigate('/billing_login');
  }, [navigate, dispatch]);

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
  }, []); // Remove userItem dependency since getFilteredMenuItems doesn't use it

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
        <h2 className="header-title">
          Subriva Billing
          {isElectronApp && (
            <Badge
              count={apiMode === 'online' ? 'ONLINE' : 'OFFLINE'}
              onClick={handleToggleMode}
              style={{
                backgroundColor: apiMode === 'online' ? '#52c41a' : '#faad14',
                marginLeft: '12px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '0 8px',
                height: '22px',
                lineHeight: '22px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Click to switch mode"
            />
          )}
        </h2>
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

              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'profile',
                      label: 'My Profile',
                      icon: <UserOutlined />,
                      onClick: () => navigate('/profile'),
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'logout',
                      label: 'Logout',
                      icon: <LogoutOutlined />,
                      danger: true,
                      onClick: () => setIsModalVisible(true),
                    },
                  ],
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Avatar
                  className="profile-avatar"
                  icon={<UserOutlined />}
                  style={{
                    cursor: 'pointer',
                    background: '#fff',
                    color: 'var(--profile-avatar)',
                    marginLeft: 8,
                  }}
                />
              </Dropdown>
            </>
          )}
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
          
          <Dropdown
            menu={{
              items: [
                {
                  key: 'profile',
                  label: 'My Profile',
                  icon: <UserOutlined />,
                  onClick: () => navigate('/profile'),
                },
                {
                  key: 'settings',
                  label: 'Settings',
                  icon: <SettingOutlined />,
                  onClick: () => navigate('/settings'),
                },
                {
                  type: 'divider',
                },
                {
                  key: 'logout',
                  label: 'Logout',
                  icon: <LogoutOutlined />,
                  danger: true,
                  onClick: () => setIsModalVisible(true),
                },
              ],
            }}
            placement="topRight"
            trigger={['click']}
          >
            <button className="mobile-nav-item">
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </button>
          </Dropdown>
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
