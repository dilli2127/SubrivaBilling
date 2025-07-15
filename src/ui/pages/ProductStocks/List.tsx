import  { useEffect, useState, useCallback, memo } from "react";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import GlobalTable from "../../components/antd/GlobalTable";
import { Input, Row, Space, Tag, Typography } from "antd";
const { Text } = Typography;
const StockAvailable = () => {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { StockAvailable } = useApiActions();
  const { items: StockItems, loading: stock_get_loading } = useDynamicSelector(
    StockAvailable.getIdentifier("GetProductStockCount")
  );

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    if(value.length > 2 || value.length === 0)
    StockAvailable("GetProductStockCount", { 
      searchString: value,
      pageNumber: 1,
      pageLimit: pagination.pageSize,
    });
  }, [StockAvailable, pagination]);

  const handlePaginationChange = (pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
    StockAvailable("GetProductStockCount", {
      searchString: searchText,
      pageNumber,
      pageLimit,
    });
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

  useEffect(() => {
    StockAvailable("GetProductStockCount", { 
      searchString: searchText,
      pageNumber: pagination.current,
      pageLimit: pagination.pageSize,
    });
  }, [StockAvailable]);

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h1>{"Product Stocks"}</h1>
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
        totalCount={StockItems?.pagination?.totalCount || 0}
        pageLimit={StockItems?.pagination?.pageLimit || 10}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
};

export default memo(StockAvailable);
