import React, { useState, useMemo, useCallback, useContext } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { menuItems as originalMenuItems } from './menu';
import './Sidebar.css';
import { getAllowedMenuKeys } from '../../../helpers/auth';
import { LayoutContext } from '../layout';

const { Sider } = Layout;


const Sidebar: React.FC = () => {
  const { collapsed }: any = useContext(LayoutContext)
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [openKeys, setOpenKeys] = useState<string[]>([]);
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
          className="custom-submenu-popup"
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
    <Sider
      collapsible
      collapsed={collapsed}
      width={240}
      style={{
        // background: 'linear-gradient(180deg, #4e54c8, #8f94fb)',
        backgroundColor: "var(--layout-conent-color)",
        height: '100vh',
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
            paddingTop: "16px",
          }}
        >
          {renderMenuItems(originalMenuItems)}
        </Menu>
      </div>
    </Sider>

  );
};

export default Sidebar;
