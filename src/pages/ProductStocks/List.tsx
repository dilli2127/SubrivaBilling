import React, { useEffect } from "react";
import { useApiActions } from "../../services/api/useApiActions";
import { useDynamicSelector } from "../../services/redux";
import GlobalTable from "../../components/antd/GlobalTable";
import { Input, Row } from "antd";

const StockAvailable = () => {
  const { UnitsApi } = useApiActions();
  const { items: unitItems, loading: unit_get_loading } = useDynamicSelector(
    UnitsApi.getIdentifier("GetAll")
  );

  const columns = [
    { title: "Name", dataIndex: "variant_name", key: "variant_name" },
    { title: "Unit Type", dataIndex: "unit", key: "unit" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Pack Size", dataIndex: "pack_size", key: "pack_size" },
    { title: "Pack Type", dataIndex: "pack_type", key: "pack_type" },
  ];
  useEffect(() => {
    UnitsApi("GetAll");
  }, []);

  return(
    <>
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <h1>{"Product Stocks"}</h1>
        <div style={{ display: "flex", gap: "16px" }}>
          <Input
            placeholder={`Search ${"Prodcuts"}`}
            // value={searchText}
            // onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
      </Row>
     <GlobalTable
        columns={[
          ...columns,
        ]}
        data={[]}
        // dataSource={filteredItems}
        rowKey="_id"
        // loading={loading}
        pagination={{ pageSize: 10 }}
     />
    </>
  );
};

export default StockAvailable;
