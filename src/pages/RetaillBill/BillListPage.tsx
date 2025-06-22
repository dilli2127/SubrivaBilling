import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useDynamicSelector } from "../../services/redux";
import { getEntityApiRoutes } from "../../helpers/CrudFactory";
import { Table, Button, Space, Tag } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const BillListPage = () => {
  const dispatch = useDispatch();
  
  // 🎯 Use the new automated system
  const SalesRecordApi = getEntityApiRoutes("SalesRecord");
  
  const { items: RetailBillList, loading } = useDynamicSelector(
    SalesRecordApi.get.identifier
  );

  useEffect(() => {
    // Fetch all sales records
    dispatch({
      type: "dynamic_request",
      payload: {
        method: SalesRecordApi.get.method,
        endpoint: SalesRecordApi.get.endpoint,
        data: {},
      },
      meta: SalesRecordApi.get.identifier,
    });
  }, [dispatch]);

  const columns = [
    {
      title: "Bill Number",
      dataIndex: "bill_number",
      key: "bill_number",
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number) => `₹${amount?.toFixed(2) || 0}`,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "paid" ? "green" : "orange"}>
          {status?.toUpperCase() || "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record: any) => {
    // Handle view logic
    console.log("View record:", record);
  };

  const handleEdit = (record: any) => {
    // Handle edit logic
    console.log("Edit record:", record);
  };

  const handleDelete = (record: any) => {
    // Handle delete logic
    console.log("Delete record:", record);
  };

  return (
    <div>
      <h2>Retail Bills</h2>
      <Table
        columns={columns}
        dataSource={RetailBillList?.result || []}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  );
};

export default BillListPage;
