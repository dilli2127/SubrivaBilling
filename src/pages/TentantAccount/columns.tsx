import { Tag, Tooltip } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

export const tenantAccountColumns = [
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (email: string) => (
      <Tooltip title="Login Email">
        <MailOutlined style={{ marginRight: 6 }} />
        {email}
      </Tooltip>
    ),
  },
  {
    title: "Mobile",
    dataIndex: "mobile",
    key: "mobile",
    render: (mobile: string) => (
      <Tooltip title="Mobile Number">
        <PhoneOutlined style={{ marginRight: 6 }} />
        {mobile}
      </Tooltip>
    ),
  },
  {
    title: "Plan",
    dataIndex: "plan_type",
    key: "plan_type",
    render: (plan: string) => {
      let color = "default";
      if (plan === "starter") color = "blue";
      else if (plan === "standard") color = "orange";
      else if (plan === "pro") color = "purple";

      return (
        <Tag color={color} style={{ textTransform: "capitalize" }}>
          {plan}
        </Tag>
      );
    },
  },
  {
    title: "License Period",
    key: "license_period",
    render: (_: any, record: any) => (
      <Tooltip title="License Validity">
        <CalendarOutlined style={{ marginRight: 6 }} />
        {record.license_start?.split("T")[0]} -{" "}
        {record.license_expiry?.split("T")[0]}
      </Tooltip>
    ),
  },
  {
    title: "Max Limits",
    key: "limits",
    render: (_: any, record: any) => (
      <>
        <Tag color="cyan">Org: {record.max_organisations}</Tag>
        <Tag color="geekblue">Branches: {record.max_branches}</Tag>
        <Tag color="volcano">Users: {record.max_users}</Tag>
      </>
    ),
  },
  {
    title: "Location",
    key: "location",
    render: (_: any, record: any) => (
      <Tooltip title="Registered Address">
        <EnvironmentOutlined style={{ marginRight: 6 }} />
        {record.city}, {record.state}
      </Tooltip>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: boolean) =>
      status ? (
        <CheckCircleTwoTone twoToneColor="#52c41a" />
      ) : (
        <CloseCircleTwoTone twoToneColor="#ff4d4f" />
      ),
  },
];
