import React, { ReactNode, useState } from "react";
import {
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { menuItems } from "./menu";
// import auditBackground from '../../../assets/img/audit.jpg';

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard"); // Track selected menu item
  const navigate = useNavigate();

  const showLogoutConfirm = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsModalVisible(false);
    navigate("/login");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleMenuClick = (key: string, path?: string) => {
    setSelectedKey(key);
    if (path) navigate(path);
  };

  return (
    <Layout style={{ position: "relative", color: "black" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "black",
          position: "fixed",
          top: "0",
          zIndex: 100,
          background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
          width: "100%",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ marginRight: 16, color: "white" }}
        />
        <h2
          style={{
            margin: 0,
            flexGrow: 1,
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          Fresh Focuz Studio
        </h2>
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          style={{
            alignSelf: "center",
            backgroundColor: "#ff4d4f",
            borderColor: "#ff4d4f",
          }}
          onClick={showLogoutConfirm}
        >
          Logout
        </Button>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          width={200}
          style={{
            position: "fixed",
            top: 64,
            color: "white",
            height: "100vh",
            background: "linear-gradient(180deg, #2C3E50, #4CA1AF)",
            boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              // background: `url(${auditBackground}) no-repeat center center`,
              // backgroundSize: "cover",
              opacity: 0.2,
              zIndex: 0,
            }}
          />

          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{
              borderRight: 0,
              background: "transparent",
              color: "white",
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
            theme="dark"
          >
            {menuItems.map((item) => {
              if (item.children) {
                return (
                  <Menu.SubMenu
                    key={item.key}
                    icon={item.icon}
                    title={item.label}
                  >
                    {item.children.map((child) => (
                      <Menu.Item
                        key={child.key}
                        onClick={() => handleMenuClick(child.key, child.path)}
                        style={{
                          backgroundColor:
                            selectedKey === child.key
                              ? "#16A085"
                              : "transparent",
                          color:
                            selectedKey === child.key ? "#ffffff" : "#ffffff",
                        }}
                      >
                        {child.label}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                );
              } else {
                return (
                  <Menu.Item
                    key={item.key}
                    icon={item.icon}
                    onClick={() => handleMenuClick(item.key, item.path)}
                    style={{
                      backgroundColor:
                        selectedKey === item.key ? "#16A085" : "transparent",
                      color: selectedKey === item.key ? "#ffffff" : "#ffffff",
                    }}
                  >
                    {item.label}
                  </Menu.Item>
                );
              }
            })}
          </Menu>
        </Sider>

        <Layout
          style={{
            padding: "0 24px",
            marginLeft: collapsed ? 80 : 200,
            transition: "margin-left 0.2s",
            background: "#ffffff",
            height: "100vh",
          }}
        >
          <Content
            style={{
              padding: 20,
              marginTop: 64,
              height: "calc(90vh - 64px)", // Adjusting height to ensure equal space
              background: "#ffffff",
              borderRadius: 8,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              overflowY: "auto", // Enable scrolling for content
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Confirm Logout"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </Layout>
  );
};

export default Sidebar;
