import React, { useCallback, useEffect, useState } from "react";
import CrudModule from "../../components/common/CrudModule";
import {
  getApiRouteCategory,
  getApiRouteProduct,
  getApiRouteVariant,
} from "../../helpers/Common_functions";
import { Input, Select, Switch, Tag } from "antd";
import { dynamic_request, useDynamicSelector } from "../../services/redux";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";

const { Option } = Select;

type Variant = {
  _id: string;
  variant_name: string;
  unit: string;
  pack_type: string;
  pack_size: string;
};

type Category = {
  _id: string;
  category_name: string;
};

const ProductCrud = () => {
  const dispatch: Dispatch<any> = useDispatch();

  const variantRoute = getApiRouteVariant("Get");
  const categoryRoute = getApiRouteCategory("Get");

  const { loading: variantLoading, items: variantItems } = useDynamicSelector(variantRoute.identifier);
  const { loading: categoryLoading, items: categoryItems } = useDynamicSelector(categoryRoute.identifier);

  const [variantMap, setVariantMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(() => {
    [variantRoute, categoryRoute].forEach(route => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createMap = (items: any[], labelKey: string) =>
    items.reduce((acc: Record<string, string>, item) => {
      acc[item._id] = item[labelKey];
      return acc;
    }, {});

  useEffect(() => {
    setVariantMap(createMap(variantItems?.result || [], "variant_name"));
  }, [variantItems]);

  useEffect(() => {
    setCategoryMap(createMap(categoryItems?.result || [], "category_name"));
  }, [categoryItems]);

  const formItems = [
    {
      label: "Product Name",
      name: "name",
      rules: [{ required: true, message: "Please enter the product name!" }],
      component: <Input placeholder="e.g., HP Toner 85A" />,
    },
    {
      label: "Category",
      name: "category",
      rules: [{ required: true, message: "Please select a category!" }],
      component: (
        <Select placeholder="Select category" loading={categoryLoading} showSearch allowClear>
          {(categoryItems?.result || []).map((cat: Category) => (
            <Option key={cat._id} value={cat._id}>
              {cat.category_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      label: "SKU / Code",
      name: "sku",
      rules: [],
      component: <Input placeholder="Optional SKU code" />,
    },
    {
      label: "Variant",
      name: "variant",
      rules: [{ required: true, message: "Please select a variant!" }],
      component: (
        <Select placeholder="Select variant" loading={variantLoading} allowClear showSearch>
          {(variantItems?.result || []).map((variant: Variant) => (
            <Option key={variant._id} value={variant._id}>
              {variant.variant_name} - {variant.unit} - {variant.pack_type} ({variant.pack_size})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      label: "Status",
      name: "status",
      valuePropName: "checked",
      component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />,
    },
  ];

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (id: string) => categoryMap[id] || "-",
    },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
      render: (id: string) => variantMap[id] || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "volcano"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  const apiRoutes = {
    get: getApiRouteProduct("GetAll"),
    create: getApiRouteProduct("Create"),
    update: getApiRouteProduct("Update"),
    delete: getApiRouteProduct("Delete"),
  };

  return (
    <CrudModule
      title="Products"
      formItems={formItems}
      columns={columns}
      apiRoutes={apiRoutes}
      formColumns={2}
    />
  );
};

export default ProductCrud;
 