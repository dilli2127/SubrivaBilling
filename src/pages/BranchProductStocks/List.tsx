import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import GlobalTable from "../../components/antd/GlobalTable";
import { Input, Row, Space, Tag, Typography } from "antd";
const { Text } = Typography;
const BranchStockAvailable = () => {
  const [searchText, setSearchText] = useState("");
  const { BranchStockAvailable } = useApiActions();
  const { items: StockItems, loading: stock_get_loading } = useDynamicSelector(
    BranchStockAvailable.getIdentifier("GetBranchStockCount")
  );

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    if(value.length > 2 || value.length === 0)
      BranchStockAvailable("GetBranchStockCount", { searchString: value });
  }, [BranchStockAvailable]);

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_:any, record:any) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.productItem.name}</Text>
          <Text type="secondary">SKU: {record.productItem.sku}</Text>
        </Space>
      ),
    },
    {
      title: "Category",
      key: "category",
      render: (_:any, record:any) => {
        const category = record.productItem.CategoryItem;
        return (
          <Tag color="blue">
            {category?.category_name || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Variant",
      key: "variant",
      render: (_:any, record:any) => {
        const v = record.productItem.VariantItem;
        return (
          <Space direction="vertical" size={0}>
            <Text>{v?.variant_name}</Text>
            <Tag color="purple">{v?.pack_size} {v?.unit} / {v?.pack_type}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Available",
      key: "quantity",
      render: (_:any, record:any) => (
        <Space direction="vertical" size={0}>
          <Text>
            <strong>{record.totalAvailableQuantity}</strong> Pack(s)
          </Text>
          <Text type="secondary">
            + {record.totalAvailableLooseQuantity} Loose
          </Text>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    BranchStockAvailable("GetBranchStockCount", { searchString: searchText });
  }, []);

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h1>{"Branch Available Stocks"}</h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <Input
            placeholder={`Search ${"Products"}`}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
      </Row>
      <GlobalTable
        columns={[...columns]}
        data={Array.isArray(StockItems?.result) ? StockItems.result : []}
        rowKey="_id"
        loading={stock_get_loading}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
};

export default memo(BranchStockAvailable);
