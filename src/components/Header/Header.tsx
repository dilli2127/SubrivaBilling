import React, { useState, useEffect } from "react";
import { Layout, Menu, Drawer, Button } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./Header.css";
import SubMenu from "antd/es/menu/SubMenu";

const { Header } = Layout;

const AppHeader = () => {
  const [visible, setVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showHeader, setShowHeader] = useState(true); // Control menu visibility
  const token = sessionStorage.getItem("token");
  const userItem = sessionStorage.getItem("user")
    ? JSON.parse(sessionStorage.getItem("user")!)
    : null;
  const showDrawer = () => {
    setVisible(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(lastScrollY > currentScrollY || currentScrollY < 100); // Show on scroll up or near top
      lastScrollY = currentScrollY;
      setScrollPosition(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const headerStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, #6a11cb, #2575fc)`,
    color: "white",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70px",
    transition: "background 0.3s ease, height 0.3s ease, transform 0.3s ease",
    boxShadow: scrollPosition > 50 ? "0 4px 12px rgba(0, 0, 0, 0.2)" : "none",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    transform: showHeader ? "translateY(0)" : "translateY(-100%)",
  };

  const logoStyle = {
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
  };
 const dynamicLogoStyle = 
  window.innerWidth <= 320
    ? { ...logoStyle, fontSize: "15px" } 
    : window.innerWidth <= 768 
      ? { ...logoStyle, fontSize: "20px" } 
      : { ...logoStyle, fontSize: "28px" };
  const logoImgStyle = {
    width: "90px",
    marginRight: "10px",
    transition: "transform 0.3s ease",
  };

  return (
    <Header style={headerStyle}>
      <div className="logo" style={dynamicLogoStyle}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          <img
            src="https://freshfocuzstudio.s3.ap-south-1.amazonaws.com/ffs+logo.png"
            alt="Fresh Focuz Studio Logo"
            style={logoImgStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          Fresh Focuz Studio
        </Link>
      </div>

      <div className="desktop-nav">
        <Menu
          mode="horizontal"
          theme="dark"
          className="nav-links"
          style={{ background: "transparent", borderBottom: "none" }}
        >
          <Menu.Item key="home">
            <Link to="/" className="menu-link">
              Home
            </Link>
          </Menu.Item>
          <Menu.Item key="gallery">
            <Link to="/gallery" className="menu-link">
              Gallery
            </Link>
          </Menu.Item>
          <Menu.Item key="e-invite">
            <Link to="/einvite" className="menu-link">
              E-invite
            </Link>
          </Menu.Item>

          <Menu.Item key="services">
            <Link to="/services" className="menu-link">
              Pricing
            </Link>
          </Menu.Item>
          <Menu.Item key="contact">
            <Link to="/contact" className="menu-link">
              Contact
            </Link>
          </Menu.Item>
          {token && (
            <SubMenu key="userlogin" title={<>E-Memories</>}>
              <Menu.Item key="e-album">
                <Link to="/ealbum" className="menu-link">
                  E-album
                </Link>
              </Menu.Item>
              <Menu.Item key="e-gallery">
              <Link to="/egallery" className="menu-link">
                  E-gallery
                </Link>
              </Menu.Item>
            </SubMenu>
          )}
          {token ? (
            <SubMenu
              key="user"
              title={
                <>
                  <UserOutlined style={{ fontSize: "15px" }} />
                  {`${userItem?.name}`}
                </>
              }
            >
              <Menu.Item key="logout" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </SubMenu>
          ) : (
            <Menu.Item key="login">
              <Link to="/login" className="menu-link">
                <UserOutlined style={{ fontSize: "15px" }} /> Login
              </Link>
            </Menu.Item>
          )}
        </Menu>
      </div>

      <div className="mobile-nav">
        <Button
          type="primary"
          icon={<MenuOutlined />}
          onClick={showDrawer}
          className="menu-icon"
        />
        <Drawer
          title={<span className="drawer-title"> Menu</span>}
          placement="right"
          onClose={onClose}
          visible={visible}
          width={250}
        >
          <Menu
            mode="vertical"
            theme="light"
            className="mobile-nav-links"
            onClick={onClose}
          >
            <Menu.Item key="home">
              <Link to="/" className="menu-link">
                Home
              </Link>
            </Menu.Item>
            <Menu.Item key="gallery">
              <Link to="/gallery" className="menu-link">
                Gallery
              </Link>
            </Menu.Item>
            <Menu.Item key="e-invite">
              <Link to="/einvite" className="menu-link">
                E-invite
              </Link>
            </Menu.Item>
            <Menu.Item key="services">
              <Link to="/services" className="menu-link">
                Pricing
              </Link>
            </Menu.Item>
            <Menu.Item key="contact">
              <Link to="/contact" className="menu-link">
                Contact
              </Link>
            </Menu.Item>
            {token && (
            <SubMenu key="userlogin" title={<>E-Memories</>}>
              <Menu.Item key="e-album">
                <Link to="/ealbum" className="menu-link">
                  E-album
                </Link>
              </Menu.Item>
              <Menu.Item key="e-gallery">
                <Link to="/egallery" className="menu-link">
                  E-gallery
                </Link>
              </Menu.Item>
            </SubMenu>
          )}
          {token ? (
            <SubMenu
              key="user"
              title={
                <>
                  <UserOutlined style={{ fontSize: "15px" }} />
                  {`${userItem?.name}`}
                </>
              }
            >
              <Menu.Item key="logout" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </SubMenu>
          ) : (
            <Menu.Item key="login">
              <Link to="/login" className="menu-link">
                <UserOutlined style={{ fontSize: "15px" }} /> Login
              </Link>
            </Menu.Item>
          )}
          </Menu>
        </Drawer>
      </div>
    </Header>
  );
};

export default AppHeader;
