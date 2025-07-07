import React from "react";
import { Drawer } from "antd";

interface GlobalDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

const GlobalDrawer: React.FC<GlobalDrawerProps> = ({
  title,
  open,
  onClose,
  children,
  width = 600,
}) => {
  return (
    <Drawer
      title={title}
      onClose={onClose}
      open={open}
      destroyOnClose
      width={width}
      bodyStyle={{
        background: "linear-gradient(135deg, rgb(231 235 255), rgb(218 183 253))",
        color: "white",
        padding: "24px",
      }}
    >
      {children}
    </Drawer>
  );
};

export default GlobalDrawer;
