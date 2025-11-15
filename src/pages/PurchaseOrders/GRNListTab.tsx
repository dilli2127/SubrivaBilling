import React, { useState, useMemo, useCallback } from 'react';
import {
  Button,
  Space,
  Tag,
  Input,
  Row,
  Tooltip,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import GlobalTable from '../../components/antd/GlobalTable';
import { useGetPurchaseOrderReceiptsQuery } from '../../services/redux/api/endpoints';
import GRNViewModal from './GRNViewModal';

const GRNListTab: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedGRN, setSelectedGRN] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch GRNs
  const { data: grnsData, isLoading } = useGetPurchaseOrderReceiptsQuery({
    pageNumber: pagination.current,
    pageLimit: pagination.pageSize,
    searchString: searchText.length > 2 || searchText.length === 0 ? searchText : undefined,
  });

  const grnsList = useMemo(() => (grnsData as any)?.result || [], [grnsData]);
  const paginationData = useMemo(() => (grnsData as any)?.pagination || {}, [grnsData]);

  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  }, [pagination]);

  const handlePaginationChange = (pageNumber: number, pageLimit: number) => {
    setPagination({ current: pageNumber, pageSize: pageLimit });
  };

  const handleView = (record: any) => {
    setSelectedGRN(record);
    setViewModalOpen(true);
  };


  // Table columns
  const columns = [
    {
      title: 'GRN Number',
      key: 'grn_number',
      width: 150,
      render: (record: any) => (
        <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px' }}>
          {record.grn_number}
        </Tag>
      ),
    },
    {
      title: 'GRN Date',
      key: 'grn_date',
      width: 120,
      render: (record: any) => (
        <Space>
          <CalendarOutlined />
          {dayjs(record.grn_date).format('DD/MM/YYYY')}
        </Space>
      ),
    },
    {
      title: 'PO Number',
      key: 'po_number',
      width: 150,
      render: (record: any) => (
        <Tag color="blue">
          {record.po_number || record.PurchaseOrderItem?.po_number || '-'}
        </Tag>
      ),
    },
    {
      title: 'Vendor',
      key: 'vendor',
      width: 200,
      render: (record: any) => (
        <div>
          <strong>{record.vendor?.vendor_name || record.vendor_name || '-'}</strong>
          {record.VendorItem?.company_name && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              {record.VendorItem.company_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vendor Invoice',
      key: 'vendor_invoice',
      width: 180,
      render: (record: any) => (
        <div>
          {record.vendor_invoice_no ? (
            <>
              <Tag color="green">{record.vendor_invoice_no}</Tag>
              {record.vendor_invoice_date && (
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  {dayjs(record.vendor_invoice_date).format('DD/MM/YYYY')}
                </div>
              )}
            </>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Items',
      key: 'items_count',
      width: 100,
      render: (record: any) => (
        <Tag>
          {record.items?.length || 0} items
        </Tag>
      ),
    },
    {
      title: 'Received By',
      key: 'received_by',
      width: 150,
      render: (record: any) => record.received_by_name || '-',
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      width: 120,
      render: (record: any) => (
        <span style={{ fontWeight: 500 }}>
          ₹{(Number(record.subtotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Tax Amount',
      key: 'tax_amount',
      width: 120,
      render: (record: any) => (
        <span style={{ color: '#1890ff' }}>
          ₹{(Number(record.tax_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Total Amount',
      key: 'total_amount',
      width: 130,
      render: (record: any) => (
        <strong style={{ color: '#52c41a', fontSize: '14px' }}>
          ₹{(Number(record.total_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View GRN Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              View
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Goods Receipt Notes (GRN)
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '14px' }}>
            View and manage all goods receipt notes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Input
            placeholder="Search by GRN number, PO number, or vendor..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
      </Row>

      <GlobalTable
        columns={columns}
        data={grnsList}
        rowKey="_id"
        loading={isLoading}
        totalCount={paginationData.totalCount || 0}
        pageLimit={paginationData.pageLimit || 10}
        onPaginationChange={handlePaginationChange}
      />

      <GRNViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedGRN(null);
        }}
        grnId={selectedGRN?._id}
        grnData={selectedGRN}
      />
    </>
  );
};

export default GRNListTab;

