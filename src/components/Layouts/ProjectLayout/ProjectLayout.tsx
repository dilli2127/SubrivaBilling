import React from "react";
import { Sidebar } from "../../../components/Sidebar/Sidebar";
import { Menu } from "../../../components/Sidebar/Menu";
import { MenuItem } from "../../../components/Sidebar/MenuItem";
import { SubMenu } from "../../../components/Sidebar/SubMenu";
import { menuClasses } from "../../../utilis/utilityClasses";
import { MenuItemStyles } from "../../../components/Sidebar/Menu";
import { Switch } from "../../../components/Sidebar/Switch";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarFooter } from "../../../components/Sidebar/SidebarFooter";
import { Badge } from "../../../components/Sidebar/Badge";
import { Typography } from "../../../components/Sidebar/Typography";
import { PackageBadges } from "../../../components/Sidebar/PackageBadges";
import { layoutStyles } from "../../../Styles/Index";
import { Breadcrumb } from "antd";
import { useDynamicSelector } from "../../../services/redux";
import {
  Link,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ApiOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  FunctionOutlined,
  MenuUnfoldOutlined,
  MobileOutlined,
  TeamOutlined,
} from "@ant-design/icons";

type Theme = "light" | "dark";

const themes = {
  light: {
    sidebar: {
      backgroundColor: "#ffffff",
      color: "#607489",
    },
    menu: {
      menuContent: "#fbfcfd",
      icon: "#0098e5",
      hover: {
        backgroundColor: "#c5e4ff",
        color: "#44596e",
      },
      disabled: {
        color: "#9fb6cf",
      },
    },
  },
  dark: {
    sidebar: {
      backgroundColor: "#0b2948",
      color: "#8ba1b7",
    },
    menu: {
      menuContent: "#082440",
      icon: "#59d0ff",
      hover: {
        backgroundColor: "#00458b",
        color: "#b6c8d9",
      },
      disabled: {
        color: "#3e5e7e",
      },
    },
  },
};

// hex to rgba converter
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const Playground: React.FC = () => {
  const navigate = useNavigate();
  const { pageBreadcrumbs } = useDynamicSelector("pageBreadcrumbs");
  const { ProjectTitle } = useDynamicSelector("ProjectTitle");
  const [collapsed, setCollapsed] = React.useState(false);
  const { id } = useParams();
  const [toggled, setToggled] = React.useState(false);
  const [broken, setBroken] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  const [hasImage, setHasImage] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>("light");

  // handle on RTL change event
  const handleRTLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRtl(e.target.checked);
  };

  // handle on theme change event
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.checked ? "dark" : "light");
  };

  // handle on image change event
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasImage(e.target.checked);
  };
  type Theme = "light" | "dark";
  const menuItemStyles: MenuItemStyles = {
    root: {
      fontSize: "13px",
      fontWeight: 400,
    },
    icon: {
      color: themes[theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: "#b6b7b9",
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(
              themes[theme].menu.menuContent,
              hasImage && !collapsed ? 0.4 : 1
            )
          : "transparent",
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      "&:hover": {
        backgroundColor: hexToRgba(
          themes[theme].menu.hover.backgroundColor,
          hasImage ? 0.8 : 1
        ),
        color: themes[theme].menu.hover.color,
      },
    },
    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  return (
    <div
      // style={{
      //   display: "flex",
      //   height: "100%",
      //   direction: rtl ? "rtl" : "ltr",
      // }}
      style={layoutStyles.container}
    >
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        onBreakPoint={setBroken}
        image="https://user-images.githubusercontent.com/25878302/144499035-2911184c-76d3-4611-86e7-bc4e8ff84ff5.jpg"
        rtl={rtl}
        breakPoint="md"
        backgroundColor={hexToRgba(
          themes[theme].sidebar.backgroundColor,
          hasImage ? 0.9 : 1
        )}
        rootStyles={{
          color: themes[theme].sidebar.color,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <SidebarHeader ProjectTitle={ProjectTitle} />
          <div style={{ flex: 1, marginBottom: "32px" }}>
            <div
              style={{
                padding: "0 24px",
                marginBottom: "8px",
                marginTop: "15px",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" ,color:"#ae0051"}}
              >
                Backend
              </Typography>
            </div>
            <Menu menuItemStyles={menuItemStyles}>
              <SubMenu label="Database" icon={<DatabaseOutlined />}>
                <MenuItem
                  component={
                    <Link
                      to={`/database-tables/${id || "default"}`}
                      style={layoutStyles.sidebarLink}
                    />
                  }
                >
                  Tables
                </MenuItem>
                <MenuItem
                  component={
                    <Link to={`/database-enumerators/${id || "default"}`} />
                  }
                >
                  Enumerator
                </MenuItem>
              </SubMenu>
              <MenuItem
                icon={<ApiOutlined />}
                component={<Link to={`/endpoints/${id || "default"}`} />}
              >
                Endpoints
              </MenuItem>
              <MenuItem
                component={<Link to={`/roles/${id || "default"}`} />}
                icon={<TeamOutlined />}
              >
                Roles
              </MenuItem>
              <MenuItem
                icon={<FunctionOutlined />}
                component={<Link to={`/functions/${id || "default"}`} />}
              >
                Functions
              </MenuItem>
            </Menu>
            <div
              style={{
                padding: "0 24px",
                marginBottom: "8px",
                marginTop: "15px",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" ,color:"#ae0051"}}
              >
                Frontend
              </Typography>
            </div>

            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem
                icon={<ClusterOutlined />}
                component={<Link to={`/frontend-types/${id || "default"}`} />}
              >
                Types
              </MenuItem>
              <SubMenu label="Portal" icon={<AppstoreOutlined />}>
                <MenuItem
                  component={<Link to={`/layouts/${id || "default"}`} />}
                >
                  Layouts
                </MenuItem>
                <MenuItem
                  component={<Link to={`/components/${id || "default"}`} />}
                >
                  Components
                </MenuItem>
                <MenuItem component={<Link to={`/pages/${id || "default"}`} />}>
                  Pages
                </MenuItem>
              </SubMenu>
              <SubMenu label="Mobile" icon={<MobileOutlined />}>
                <MenuItem
                  component={<Link to={`/mobile-screens/${id || "default"}`} />}
                >
                  Screens
                </MenuItem>
              </SubMenu>
            </Menu>
          </div>
          {/* <SidebarFooter collapsed={collapsed} /> */}
        </div>
      </Sidebar>

      <div style={layoutStyles.mainContent}>
        <header style={layoutStyles.header}>
        <div style={{ marginBottom: '16px' }}>
            {broken && (
              <button className="sb-button" onClick={() => setToggled(!toggled)}>
                <MenuUnfoldOutlined />
              </button>
            )}
          </div>
          {/* <h1>{ProjectTitle}</h1> */}
          {/* <Breadcrumb>
            {pageBreadcrumbs &&
              pageBreadcrumbs.map((crumb, index) => (
                <Breadcrumb.Item
                  key={index}
                  onClick={() => navigate(crumb.path)}
                  className={
                    index + 1 < pageBreadcrumbs.length ? "breadcrumb-link" : ""
                  }
                >
                  {crumb.name}
                </Breadcrumb.Item>
              ))}
          </Breadcrumb> */}
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Playground;
