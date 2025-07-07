import { Spin } from "antd";

const Loader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh", // Full height of viewport
    }}
  >
    <Spin size="large" tip="Loading..." />
  </div>
);

export default Loader;
