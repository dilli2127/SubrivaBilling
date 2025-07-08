import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Modal } from "antd";
import React, { useCallback, useContext, useState } from "react";
import { LayoutContext } from "../layout";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const { userItem, collapsed, setCollapsed }: any = useContext(LayoutContext)
  const { Header: LayoutHeader } = Layout;

  const handleLogout = useCallback(() => {
    sessionStorage.clear();
    setIsModalVisible(false);
    navigate('/billing_login');
  }, [navigate]);

  return (
    <React.Fragment>
      <LayoutHeader
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        //  background: 'linear-gradient(90deg, #ff6a00, #ee0979)',
          backgroundColor:'var(--layout-header-color)',
          color: '#fff',
          padding: '0 16px',
          position: 'fixed',
          width: '100%',
          zIndex: 1000,
          height: 64,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <div className="">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#fff', fontSize: 18 }}
          />
          <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            Subriva Billing
          </h2>
        </div>
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
      </LayoutHeader>
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
    </React.Fragment>
  )
}

export default Header
