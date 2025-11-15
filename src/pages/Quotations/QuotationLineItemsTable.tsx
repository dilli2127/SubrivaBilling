import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  Table,
  Button,
  InputNumber,
  Select,
  Input,
  Popconfirm,
  Space,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { QuotationLineItem } from '../../types/quotation';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { calculateLineItemTotals } from '../../helpers/quotationCalculations';

interface QuotationLineItemsTableProps {
  value?: QuotationLineItem[];
  onChange?: (items: QuotationLineItem[]) => void;
  disabled?: boolean;
  isGstIncluded?: boolean;  // Whether GST is included in prices
}

const QuotationLineItemsTable: React.FC<QuotationLineItemsTableProps> = ({
  value = [],
  onChange,
  disabled = false,
  isGstIncluded = true,  // Default to GST included
}) => {
  // Product dropdown with server-side debounced search and infinite scroll
  const [productSearchString, setProductSearchString] = useState('');
  const [productDebouncedSearch, setProductDebouncedSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const productSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingMoreProductsRef = useRef(false);

  // Debounce product search
  useEffect(() => {
    // Skip if search hasn't changed
    if (productSearchString === productDebouncedSearch) {
      return;
    }

    if (productSearchTimerRef.current) {
      clearTimeout(productSearchTimerRef.current);
    }
    
    productSearchTimerRef.current = setTimeout(() => {
      setProductDebouncedSearch(productSearchString);
      setProductPage(1);
      setAllProducts([]);
      setHasMoreProducts(true);
      isLoadingMoreProductsRef.current = false;
    }, 300);
    return () => {
      if (productSearchTimerRef.current) {
        clearTimeout(productSearchTimerRef.current);
      }
    };
  }, [productSearchString, productDebouncedSearch]);

  // Fetch products with server-side search
  const productQueryParams = useMemo(() => ({
    page: productPage,
    limit: 20,
    searchString: productDebouncedSearch || '',
  }), [productPage, productDebouncedSearch]);

  const { data: productsData, isLoading: productsLoading, isFetching: productsFetching } = apiSlice.useGetProductQuery(
    productQueryParams,
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );

  // Accumulate products
  useEffect(() => {
    if (productsData) {
      const newProducts = (productsData as any)?.result || [];
      const totalCount = (productsData as any).pagination?.totalCount || (productsData as any).pagination?.total || 0;
      
      setAllProducts(prev => {
        if (productPage === 1) {
          // For page 1, replace all
          setHasMoreProducts(newProducts.length < totalCount && newProducts.length > 0);
          return newProducts;
        } else {
          // Append products for subsequent pages
          const existingIds = new Set(prev.map((p: any) => p._id));
          const uniqueNewProducts = newProducts.filter((p: any) => !existingIds.has(p._id));
          if (uniqueNewProducts.length === 0) {
            return prev;
          }
          const updated = [...prev, ...uniqueNewProducts];
          setHasMoreProducts(updated.length < totalCount && uniqueNewProducts.length > 0);
          return updated;
        }
      });
      isLoadingMoreProductsRef.current = false;
    }
  }, [productsData, productPage]);

  // Product scroll handler for infinite loading
  const handleProductPopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.7 && hasMoreProducts && !productsLoading && !isLoadingMoreProductsRef.current) {
      isLoadingMoreProductsRef.current = true;
      setProductPage(prev => prev + 1);
    }
  }, [hasMoreProducts, productsLoading]);

  const onProductDropdownVisibleChange = useCallback((open: boolean) => {
    // Don't trigger any actions - let the query hook handle data loading
  }, []);

  // Keep products list for backward compatibility with handleProductSelect
  const products = allProducts;

  // Component for stock audit dropdown per row
  const StockAuditDropdownForRow: React.FC<{
    record: QuotationLineItem;
    index: number;
    disabled: boolean;
    onStockAuditSelect: (index: number, stockAuditId: string | undefined, stockAudit?: any) => void;
  }> = React.memo(({ record, index, disabled, onStockAuditSelect }) => {
    const [searchString, setSearchString] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [allItems, setAllItems] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoadingMoreRef = useRef(false);
    const prevProductIdRef = useRef<string | undefined>(undefined);
    const prevQueryParamsRef = useRef<string>('');
    const dataLoadedRef = useRef(false);
    const productId = record.product_id;

    // Debounce search
    useEffect(() => {
      // Skip if search hasn't changed
      if (searchString === debouncedSearch) {
        return;
      }

      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      
      searchTimerRef.current = setTimeout(() => {
        setDebouncedSearch(searchString);
        setPage(1);
        setAllItems([]);
        setHasMore(true);
        isLoadingMoreRef.current = false;
        dataLoadedRef.current = false;
      }, 300);
      return () => {
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current);
        }
      };
    }, [searchString, debouncedSearch]);

    // Reset when product_id changes
    useEffect(() => {
      if (prevProductIdRef.current !== productId) {
        prevProductIdRef.current = productId;
        setPage(1);
        setAllItems([]);
        setHasMore(true);
        setSearchString('');
        setDebouncedSearch('');
        isLoadingMoreRef.current = false;
        dataLoadedRef.current = false;
      }
    }, [productId]);

    // Create stable query params object - memoized to prevent unnecessary refetches
    const queryParams = useMemo(() => ({
      page,
      limit: 20,
      searchString: debouncedSearch || '',
      product_id: productId || undefined,
    }), [page, debouncedSearch, productId]);

    // Create query key string to detect actual query changes (not record changes)
    const queryKey = useMemo(() => 
      JSON.stringify({ page, searchString: debouncedSearch, product_id: productId }), 
      [page, debouncedSearch, productId]
    );

    // Track if query params actually changed (not just record props)
    const shouldRefetch = useMemo(() => {
      const paramsChanged = prevQueryParamsRef.current !== queryKey;
      if (paramsChanged) {
        prevQueryParamsRef.current = queryKey;
      }
      return paramsChanged;
    }, [queryKey]);

    // Fetch stock audit with product_id filter
    // Set refetchOnMountOrArgChange to false to prevent refetch on component re-render
    // RTK Query will still refetch when query params change naturally
    const { data, isLoading, isFetching } = apiSlice.useGetStockAuditQuery(
      queryParams,
      {
        skip: !productId, // Skip if no product selected
        refetchOnMountOrArgChange: false, // Don't refetch on component re-render
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );

    // Accumulate items - only update when data actually changes
    useEffect(() => {
      if (data && productId) {
        const newItems = (data as any)?.result || [];
        const totalCount = (data as any).pagination?.totalCount || (data as any).pagination?.total || 0;
        
        // Prevent unnecessary updates if data hasn't actually changed
        setAllItems(prev => {
          if (page === 1) {
            // For page 1, check if items are actually different
            if (prev.length === newItems.length && 
                prev.length > 0 && 
                prev[0]?._id === newItems[0]?._id) {
              return prev; // No change, return previous
            }
            setHasMore(newItems.length < totalCount && newItems.length > 0);
            dataLoadedRef.current = true;
            return newItems;
          } else {
            // Append items for subsequent pages
            const existingIds = new Set(prev.map((item: any) => item._id));
            const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item._id));
            if (uniqueNewItems.length === 0) {
              return prev; // No new items
            }
            const updated = [...prev, ...uniqueNewItems];
            setHasMore(updated.length < totalCount && uniqueNewItems.length > 0);
            return updated;
          }
        });
        isLoadingMoreRef.current = false;
      }
    }, [data, page, productId]);

    const handlePopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage > 0.7 && hasMore && !isLoading && !isLoadingMoreRef.current && productId) {
        isLoadingMoreRef.current = true;
        setPage(prev => prev + 1);
      }
    }, [hasMore, isLoading, productId]);

    const onDropdownVisibleChange = useCallback((open: boolean) => {
      // Don't trigger any actions - let the query hook handle data loading
      // The items should persist when dropdown closes
    }, []);

    return (
      <Select
        showSearch
        allowClear
        placeholder={productId ? "Select stock batch" : "Select product first"}
        style={{ width: '100%' }}
        value={record.stock_audit_id || undefined}
        onChange={(val) => {
          // Find the stock audit object from allItems to pass to handler
          // Make sure we preserve allItems - don't let onChange clear it
          if (val === undefined || val === null) {
            onStockAuditSelect(index, undefined, undefined);
            return;
          }
          const selectedStockAudit = allItems.find((sa: any) => sa._id === val);
          if (selectedStockAudit) {
            onStockAuditSelect(index, val, selectedStockAudit);
          } else {
            // If item not found in allItems, just set the ID
            onStockAuditSelect(index, val, undefined);
          }
        }}
        disabled={disabled || !productId}
        loading={isLoading && allItems.length === 0}
        onSearch={setSearchString}
        onPopupScroll={handlePopupScroll}
        onDropdownVisibleChange={onDropdownVisibleChange}
        filterOption={false}
        notFoundContent={
          !productId ? 'Please select a product first' :
          isLoading && !dataLoadedRef.current ? 'Loading stock batches...' : 
          allItems.length === 0 && !isLoading ? 'No stock batches found for this product' : 
          null
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {hasMore && allItems.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                {isLoading ? 'Loading...' : 'Scroll for more'}
              </div>
            )}
          </>
        )}
      >
        {allItems.map((stockAudit: any) => (
          <Select.Option key={stockAudit._id} value={stockAudit._id}>
            {stockAudit.ProductItem?.name || 'N/A'} 
            {stockAudit.ProductItem?.VariantItem?.variant_name ? ` - ${stockAudit.ProductItem.VariantItem.variant_name}` : ''}
            {stockAudit.batch_no ? ` (Batch: ${stockAudit.batch_no})` : ''}
          </Select.Option>
        ))}
      </Select>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison: only re-render if product_id, index, or disabled changes
    // Ignore changes to record.stock_audit_id or other record properties
    return (
      prevProps.record.product_id === nextProps.record.product_id &&
      prevProps.index === nextProps.index &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.onStockAuditSelect === nextProps.onStockAuditSelect
    );
  });

  // Add new line item
  const handleAddItem = useCallback(() => {
    const newItem: Partial<QuotationLineItem> = {
      product_id: '',
      product_name: '',
      variant_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_percentage: 18,
      discount: 0,
      discount_type: 'percentage',
      line_total: 0,
    };
    
    onChange?.([...value, newItem as QuotationLineItem]);
  }, [value, onChange]);

  // Delete line item
  const handleDeleteItem = useCallback((index: number) => {
    const newItems = value.filter((_, i) => i !== index);
    onChange?.(newItems);
  }, [value, onChange]);

  // Calculate derived values for a line item
  const getLineItemTotals = useCallback(
    (item: Partial<QuotationLineItem>) => calculateLineItemTotals(item, isGstIncluded),
    [isGstIncluded]
  );

  // Update line item field
  const handleFieldChange = useCallback((index: number, field: string, fieldValue: any) => {
    const newItems = [...value];
    const item = { ...newItems[index], [field]: fieldValue };
    
    // Recalculate totals if quantity, price, tax, or discount changes
    if (['quantity', 'unit_price', 'tax_percentage', 'discount', 'discount_type'].includes(field)) {
      const calculated = getLineItemTotals(item);
      item.line_total = calculated.line_total;
    }
    
    newItems[index] = item;
    onChange?.(newItems);
  }, [value, onChange, getLineItemTotals]);

  // Handle product selection
  const handleProductSelect = useCallback((index: number, productId: string) => {
    const product = products.find((p: any) => p._id === productId);
    if (!product) return;

    const newItems = [...value];
    
    // Get tax percentage from product category, with fallbacks
    const taxPercentage = 
      product.CategoryItem?.tax_percentage || 
      product.category?.tax_percentage ||
      product.tax_percentage ||
      18; // Default to 18% if no tax found
    
    const item = {
      ...newItems[index],
      product_id: productId,
      product_name: product.name,
      variant_name: product.VariantItem?.variant_name || '',
      description: product.description || '',
      tax_percentage: Number(taxPercentage) || 18, // Ensure it's a number
      unit_price: product.sell_price || 0, // Use sell_price for quotations
    };
    
    const calculated = getLineItemTotals(item);
    newItems[index] = { ...item, line_total: calculated.line_total };
    onChange?.(newItems);
  }, [value, onChange, products, getLineItemTotals]);

  // Handle stock audit selection
  const handleStockAuditSelect = useCallback((index: number, stockAuditId: string | undefined, stockAudit?: any) => {
    const newItems = [...value];
    const item = { ...newItems[index] };
    
    // If cleared (undefined), just remove stock audit ID
    if (!stockAuditId) {
      item.stock_audit_id = undefined;
      newItems[index] = item;
      onChange?.(newItems);
      return;
    }

    // If stock audit object is not provided, return early
    // The component should pass the stock audit object
    if (!stockAudit) {
      // Just update the stock audit ID if object is not available
      item.stock_audit_id = stockAuditId;
      newItems[index] = item;
      onChange?.(newItems);
      return;
    }

    // Update stock audit ID
    item.stock_audit_id = stockAuditId;
    
    // Populate price from stock audit sell_price
    if (stockAudit.sell_price !== undefined && stockAudit.sell_price !== null) {
      item.unit_price = Number(stockAudit.sell_price) || 0;
    }
    
    // Update product info if not already set
    if (stockAudit.ProductItem && !item.product_id) {
      item.product_id = stockAudit.ProductItem._id || '';
      item.product_name = stockAudit.ProductItem.name || '';
      item.variant_name = stockAudit.ProductItem.VariantItem?.variant_name || '';
      
      // Get tax percentage from product category
      const taxPercentage = 
        stockAudit.ProductItem.CategoryItem?.tax_percentage ||
        stockAudit.category?.tax_percentage ||
        18;
      item.tax_percentage = Number(taxPercentage) || 18;
    }
    
    // Recalculate totals
    const calculated = getLineItemTotals(item);
    item.line_total = calculated.line_total;
    
    newItems[index] = item;
    onChange?.(newItems);
  }, [value, onChange, getLineItemTotals]);

  // Recalculate line totals when GST mode changes
  const prevGstRef = useRef(isGstIncluded);
  
  useEffect(() => {
    if (prevGstRef.current === isGstIncluded) {
      return;
    }

    if (!value || value.length === 0) {
      prevGstRef.current = isGstIncluded;
      return;
    }

    const recalculatedItems = value.map(item => {
      const calculations = calculateLineItemTotals(item, isGstIncluded);
      return { ...item, line_total: calculations.line_total };
    }) as QuotationLineItem[];

    onChange?.(recalculatedItems);
    prevGstRef.current = isGstIncluded;
  }, [isGstIncluded, value, onChange]);

  // Calculate totals
  const totals = useMemo(() => {
    const aggregate = value.reduce(
      (acc, item) => {
        const itemTotals = calculateLineItemTotals(item, isGstIncluded);
        // Subtotal = sum of line totals (what customer pays per line) for better UX
        acc.subtotal += itemTotals.line_total;
        acc.discountAmount += itemTotals.item_discount_amount;
        acc.valueOfGoods += itemTotals.item_value_of_goods;
        acc.taxAmount += itemTotals.item_tax_amount;
        acc.total += itemTotals.line_total;
        return acc;
      },
      {
        subtotal: 0,
        discountAmount: 0,
        valueOfGoods: 0,
        taxAmount: 0,
        total: 0,
      }
    );
    
    return {
      subtotal: Number(aggregate.subtotal.toFixed(2)),
      discountAmount: Number(aggregate.discountAmount.toFixed(2)),
      valueOfGoods: Number(aggregate.valueOfGoods.toFixed(2)),
      taxAmount: Number(aggregate.taxAmount.toFixed(2)),
      total: Number(aggregate.total.toFixed(2)),
    };
  }, [value, isGstIncluded]);

  // Table columns
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 40,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: <span style={{ color: 'red' }}>* Product</span>,
      key: 'product',
      width: 200,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <Select
          showSearch
          allowClear
          placeholder="Select product"
          style={{ width: '100%' }}
          value={record.product_id || undefined}
          onChange={(val) => handleProductSelect(index, val)}
          disabled={disabled}
          loading={productsLoading && allProducts.length === 0}
          onSearch={setProductSearchString}
          onPopupScroll={handleProductPopupScroll}
          onDropdownVisibleChange={onProductDropdownVisibleChange}
          filterOption={false}
          notFoundContent={
            productsLoading && allProducts.length === 0 ? 'Loading products...' : 
            allProducts.length === 0 ? 'No products found' : 
            null
          }
          dropdownRender={(menu) => (
            <>
              {menu}
              {hasMoreProducts && allProducts.length > 0 && (
                <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                  {productsLoading ? 'Loading...' : 'Scroll for more'}
                </div>
              )}
            </>
          )}
        >
          {allProducts.map((product: any) => (
            <Select.Option key={product._id} value={product._id}>
              {product.name} {product.VariantItem?.variant_name ? `- ${product.VariantItem.variant_name}` : ''}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Stock Audit',
      key: 'stock_audit',
      width: 200,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <StockAuditDropdownForRow
          record={record}
          index={index}
          disabled={disabled}
          onStockAuditSelect={handleStockAuditSelect}
        />
      ),
    },
    {
      title: 'Description',
      key: 'description',
      width: 150,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <Input
          placeholder="Description"
          value={record.description}
          onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
          disabled={disabled}
        />
      ),
    },
    {
      title: <span style={{ color: 'red' }}>* Quantity</span>,
      key: 'quantity',
      width: 100,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <InputNumber
          min={1}
          precision={0}
          placeholder="Qty"
          style={{ width: '100%' }}
          value={record.quantity}
          onChange={(val) => handleFieldChange(index, 'quantity', val)}
          disabled={disabled}
        />
      ),
    },
    {
      title: <span style={{ color: 'red' }}>* Unit Price</span>,
      key: 'unit_price',
      width: 110,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          placeholder="₹0.00"
          prefix="₹"
          style={{ width: '100%' }}
          value={record.unit_price}
          onChange={(val) => handleFieldChange(index, 'unit_price', val)}
          disabled={disabled}
        />
      ),
    },
    {
      title: 'Tax %',
      key: 'tax_percentage',
      width: 80,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <InputNumber
          min={0}
          max={100}
          precision={2}
          placeholder="18%"
          suffix="%"
          style={{ width: '100%' }}
          value={record.tax_percentage}
          onChange={(val) => handleFieldChange(index, 'tax_percentage', val)}
          disabled={disabled}
        />
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 130,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <Space.Compact style={{ width: '100%' }}>
          <InputNumber
            min={0}
            precision={2}
            placeholder="0"
            style={{ width: '70%' }}
            value={record.discount}
            onChange={(val) => handleFieldChange(index, 'discount', val)}
            disabled={disabled}
          />
          <Select
            style={{ width: '30%' }}
            value={record.discount_type}
            onChange={(val) => handleFieldChange(index, 'discount_type', val)}
            disabled={disabled}
          >
            <Select.Option value="percentage">%</Select.Option>
            <Select.Option value="amount">₹</Select.Option>
          </Select>
        </Space.Compact>
      ),
    },
    {
      title: 'Line Total',
      key: 'line_total',
      width: 110,
      render: (_: any, record: QuotationLineItem) => (
        <Tooltip title={`Qty: ${record.quantity} × ₹${record.unit_price}`}>
          <strong style={{ color: '#52c41a' }}>
            ₹{(record.line_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 70,
      render: (_: any, record: QuotationLineItem, index: number) => (
        <Popconfirm
          title="Delete this line item?"
          onConfirm={() => handleDeleteItem(index)}
          disabled={disabled || value.length === 1}
        >
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            disabled={disabled || value.length === 1}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '14px' }}>Line Items</strong>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddItem}
          disabled={disabled}
        >
          Add Item
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={value}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        rowKey={(record, index) => `item-${index}`}
        bordered
        footer={() => (
          <div style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {totals.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                  <span>Discount:</span>
                  <strong style={{ color: '#ff4d4f' }}>
                    -₹{totals.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              )}
              {/* Only show Subtotal if it differs from Total (e.g., when there are adjustments) */}
              {Math.abs(totals.subtotal - totals.total) > 0.01 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                  <span>Subtotal:</span>
                  <strong>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                <span>Value of Goods:</span>
                <strong>₹{totals.valueOfGoods.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              {totals.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                  <span>Tax Amount:</span>
                  <strong>₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '16px', color: '#52c41a' }}>
                <span><CalculatorOutlined /> Total:</span>
                <strong>₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </Space>
          </div>
        )}
      />
      
      {value.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No items added. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
};

export default QuotationLineItemsTable;

