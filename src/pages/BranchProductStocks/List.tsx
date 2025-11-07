import React, { useState, useMemo, useCallback, memo } from "react";
import { apiSlice } from "../../services/redux/api/apiSlice";
import { useGetBranchStockCountQuery } from "../../services/redux/api/endpoints";
import GlobalTable from "../../components/antd/GlobalTable";
import { Input, Row, Space, Tag, Typography } from "antd";
const { Text } = Typography;
const BranchStockAvailable = () => {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Use RTK Query for branch stock data
  const { data: stockData, isLoading: stock_get_loading, refetch } = useGetBranchStockCountQuery({
    searchString: searchText.length > 2 || searchText.length === 0 ? searchText : undefined,
    pageNumber: pagination.current,
    pageLimit: pagination.pageSize,
  });

  const StockItems = useMemo(() => stockData || {}, [stockData]);

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    if(value.length > 2 || value.length === 0) {
      // RTK Query will automatically refetch when parameters change
      refetch();
    }
  }, [pagination, refetch]);

  const handlePaginationChange = (pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
    // RTK Query will automatically refetch when parameters change
    refetch();
  };

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

  // RTK Query automatically fetches on mount and when params change

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
        data={Array.isArray((StockItems as any)?.result) ? (StockItems as any).result : []}
        rowKey="_id"
        loading={stock_get_loading}
        totalCount={(StockItems as any)?.pagination?.totalCount || 0}
        pageLimit={(StockItems as any)?.pagination?.pageLimit || 10}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default memo(BranchStockAvailable);
