import React, { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Space, Input, Tooltip, Badge, Statistic, Row, Col, Modal, Drawer, Timeline } from 'antd';
import {
  SearchOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useGetAllCustomerPointsQuery, useGetCustomerPointsHistoryQuery } from '../../services/redux/api/endpoints';
import dayjs from 'dayjs';

const CustomerPointsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [tierFilter, setTierFilter] = useState<string | undefined>();
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const { data, isLoading } = useGetAllCustomerPointsQuery({
    search: searchText,
    tier: tierFilter,
  });
  
  const { data: historyData, isLoading: historyLoading } = useGetCustomerPointsHistoryQuery(
    {
      customerId: selectedCustomer?.customer_id || '',
      page: 1,
      limit: 50,
    },
    { skip: !selectedCustomer }
  );
  
  const customerPoints = useMemo(() => (data as any)?.result || [], [data]);
  const history = useMemo(() => (historyData as any)?.result || [], [historyData]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const totalCustomers = customerPoints.length;
    const totalPoints = customerPoints.reduce((sum: number, cp: any) => sum + Number(cp.available_points || 0), 0);
    const totalValue = customerPoints.reduce((sum: number, cp: any) => sum + Number(cp.points_value || 0), 0);
    const activeCustomers = customerPoints.filter((cp: any) => cp.available_points > 0).length;
    
    return {
      totalCustomers,
      activeCustomers,
      totalPoints,
      totalValue,
    };
  }, [customerPoints]);
  
  const handleViewHistory = (record: any) => {
    setSelectedCustomer(record);
    setHistoryDrawerOpen(true);
  };
  
  // Tier configuration
  const tierConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    bronze: { color: 'default', icon: <TrophyOutlined />, label: 'Bronze' },
    silver: { color: 'blue', icon: <TrophyOutlined />, label: 'Silver' },
    gold: { color: 'gold', icon: <TrophyOutlined />, label: 'Gold' },
    platinum: { color: 'purple', icon: <TrophyOutlined />, label: 'Platinum' },
  };
  
  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      fixed: 'left' as const,
      render: (record: any) => {
        const customerName = record.customer_name || record.CustomerItem?.full_name || '-';
        const customerPhone = record.customer_phone || record.CustomerItem?.mobile;
        
        return (
          <div>
            <UserOutlined style={{ marginRight: 4, color: '#1890ff' }} />
            <strong>{customerName}</strong>
            {customerPhone && (
              <div style={{ fontSize: '11px', color: '#888' }}>
                {customerPhone}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      width: 120,
      filters: Object.keys(tierConfig).map(key => ({
        text: tierConfig[key].label,
        value: key,
      })),
      onFilter: (value: any, record: any) => record.tier === value,
      render: (tier: string) => {
        const config = tierConfig[tier] || tierConfig.bronze;
        return (
          <Badge 
            status={config.color as any}
            text={
              <Tag color={config.color} icon={config.icon}>
                {config.label}
              </Tag>
            }
          />
        );
      },
    },
    {
      title: 'Available Points',
      dataIndex: 'available_points',
      key: 'available_points',
      width: 140,
      sorter: (a: any, b: any) => (Number(a.available_points) || 0) - (Number(b.available_points) || 0),
      render: (points: number) => (
        <strong style={{ color: '#52c41a', fontSize: '14px' }}>
          <GiftOutlined style={{ marginRight: 4 }} />
          {points} pts
        </strong>
      ),
    },
    {
      title: 'Points Value',
      dataIndex: 'points_value',
      key: 'points_value',
      width: 130,
      render: (value: any) => (
        <strong style={{ color: '#52c41a' }}>
          <DollarOutlined style={{ marginRight: 4 }} />
          ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: 'Total Earned',
      dataIndex: 'total_earned',
      key: 'total_earned',
      width: 120,
      sorter: (a: any, b: any) => (Number(a.total_earned) || 0) - (Number(b.total_earned) || 0),
      render: (points: number) => (
        <Tooltip title="All-time points earned">
          <Tag color="blue">{points} pts</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Total Used',
      dataIndex: 'total_used',
      key: 'total_used',
      width: 110,
      render: (points: number) => (
        <Tooltip title="All-time points redeemed">
          <Tag color="orange">{points} pts</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Earn Rate',
      dataIndex: 'earn_rate',
      key: 'earn_rate',
      width: 100,
      render: (rate: any) => (
        <Tag color="green">{Number(rate || 5).toFixed(1)}%</Tag>
      ),
    },
    {
      title: 'Purchases',
      dataIndex: 'total_purchases',
      key: 'total_purchases',
      width: 100,
      align: 'center' as const,
      render: (count: number) => count || 0,
    },
    {
      title: 'Returns',
      dataIndex: 'total_returns',
      key: 'total_returns',
      width: 90,
      align: 'center' as const,
      render: (count: number) => count || 0,
    },
    {
      title: 'Lifetime Value',
      dataIndex: 'lifetime_value',
      key: 'lifetime_value',
      width: 130,
      sorter: (a: any, b: any) => (Number(a.lifetime_value) || 0) - (Number(b.lifetime_value) || 0),
      render: (value: any) => (
        <span style={{ color: '#666' }}>
          ₹{Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 100,
      render: (record: any) => (
        <Button
          type="link"
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => handleViewHistory(record)}
        >
          History
        </Button>
      ),
    },
  ];
  
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Statistics */}
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Customers"
                  value={stats.totalCustomers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Customers"
                  value={stats.activeCustomers}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  suffix={`/ ${stats.totalCustomers}`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Points"
                  value={stats.totalPoints}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#ff9800' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Points Value"
                  value={stats.totalValue}
                  prefix="₹"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
          
          {/* Search */}
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by customer name, email, or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: '100%' }}
          />
          
          {/* Table */}
          <Table
            columns={columns}
            dataSource={customerPoints}
            loading={isLoading}
            rowKey="_id"
            scroll={{ x: 1400 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} customers`,
            }}
          />
        </Space>
      </Card>
      
      {/* Points History Drawer */}
      <Drawer
        title={
          <Space>
            <HistoryOutlined />
            <span>Points History - {selectedCustomer?.customer_name}</span>
          </Space>
        }
        open={historyDrawerOpen}
        onClose={() => {
          setHistoryDrawerOpen(false);
          setSelectedCustomer(null);
        }}
        width={700}
      >
        {selectedCustomer && (
          <>
            <Card style={{ marginBottom: 16, background: '#f0f5ff' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Available"
                    value={selectedCustomer.available_points}
                    suffix="pts"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Value"
                    value={Number(selectedCustomer.points_value || 0)}
                    prefix="₹"
                    precision={2}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Tier"
                    value={selectedCustomer.tier?.toUpperCase()}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
              </Row>
            </Card>
            
            <Timeline
              items={history.map((trans: any) => {
                const isEarn = trans.points > 0;
                const typeLabels: Record<string, string> = {
                  earn_purchase: '🛒 Purchase Reward',
                  earn_return: '🔄 Return Refund',
                  redeem: '🎁 Points Redeemed',
                  expire: '⏰ Points Expired',
                  bonus: '🎉 Bonus Points',
                  adjust: '⚙️ Manual Adjustment',
                };
                
                return {
                  color: isEarn ? 'green' : 'red',
                  dot: isEarn ? <GiftOutlined /> : <DollarOutlined />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {typeLabels[trans.transaction_type] || trans.transaction_type}
                        <Tag color={isEarn ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                          {isEarn ? '+' : ''}{trans.points} pts
                        </Tag>
                        <span style={{ color: '#666', marginLeft: 8 }}>
                          (₹{Number(Math.abs(trans.points_value)).toFixed(2)})
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {trans.description}
                      </div>
                      {trans.reference_number && (
                        <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                          Ref: {trans.reference_number}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(trans.createdAt).format('DD/MM/YYYY HH:mm')}
                        <span style={{ marginLeft: 12 }}>
                          Balance: {trans.balance_after} pts
                        </span>
                      </div>
                      {trans.expiry_date && !trans.is_expired && (
                        <div style={{ fontSize: '11px', color: '#faad14', marginTop: 2 }}>
                          Expires: {dayjs(trans.expiry_date).format('DD/MM/YYYY')}
                        </div>
                      )}
                    </div>
                  ),
                };
              })}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerPointsPage;

