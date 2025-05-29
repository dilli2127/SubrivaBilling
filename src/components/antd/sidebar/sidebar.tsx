import React, { ReactNode, useState } from "react";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { menuItems } from "./menu";
import "./Sidebar.css";

const { Header, Content, Sider } = Layout;

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();

  const showLogoutConfirm = () => setIsModalVisible(true);
  const handleOk = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsModalVisible(false);
    navigate("/login");
  };
  const handleCancel = () => setIsModalVisible(false);
  const handleMenuClick = (key: string, path?: string) => {
    setSelectedKey(key);
    if (path) navigate(path);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(90deg, #fc466b, #3f5efb)",
          color: "#fff",
          padding: "0 16px",
          position: "fixed",
          width: "100%",
          zIndex: 1000,
          height: 64,
          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: "#fff", fontSize: 18 }}
        />
        <h2 style={{ margin: 0, color: "#fff", flex: 1, textAlign: "center" }}>
          Fresh Focuz Studio
        </h2>
        <Button
          icon={<LogoutOutlined />}
          type="primary"
          danger
          onClick={showLogoutConfirm}
        >
          Logout
        </Button>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            background: "linear-gradient(180deg,rgb(178, 182, 244), #8f94fb)",
            position: "fixed",
            top: 64,
            height: "100vh",
            overflow: "auto",
            boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            theme="light"
            inlineCollapsed={collapsed} // This triggers popup submenu on collapse
            style={{
              background: "transparent",
              color: "#fff",
              paddingTop: 16,
              fontWeight: 500,
            }}
          >
            {menuItems.map((item) =>
              item.children ? (
                <>
                  {item?.key === "EMemories" && "Produce"}
                  <Menu.SubMenu
                    key={item.key}
                    icon={item.icon}
                    title={item.label}
                    popupClassName="custom-submenu-popup"
                  >
                    {item.children.map((child) => (
                      <Menu.Item
                        key={child.key}
                        icon={child.icon}
                        onClick={() => handleMenuClick(child.key, child.path)}
                        className={`custom-subitem ${
                          selectedKey === child.key ? "active" : ""
                        }`}
                      >
                        {child.label}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                </>
              ) : (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  onClick={() => handleMenuClick(item.key, item.path)}
                  className={`custom-menuitem ${
                    selectedKey === item.key ? "active" : ""
                  }`}
                >
                  {item.label}
                </Menu.Item>
              )
            )}
          </Menu>
        </Sider>

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 240,
            transition: "margin-left 0.3s ease",
            background: "#f4f6f8",
          }}
        >
          <Content
            style={{
              padding: 24,
              marginTop: 64,
              background: "#fff",
              minHeight: "calc(100vh - 64px)",
              borderRadius: 12,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              overflowY: "auto",
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
