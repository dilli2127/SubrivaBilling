import React, { useEffect, useState } from 'react';
import { Typography, Tabs, Tooltip } from 'antd';
import {
  BarChartOutlined,
  WalletOutlined,
  StockOutlined,
  RiseOutlined,
  CreditCardOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  OverviewTab,
  FinanceTab,
  InventoryTab,
  SalesAnalysisTab,
  OperationsTab,
  PerformanceTab,
} from './tabs';
import { useDashboardData } from './hooks/useDashboardData';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Get all dashboard data from custom hook
  const {
    DashBoardItems,
    SalesChartDataItems,
    FinancialDataItems,
    InventoryMetricsItems,
    SalesAnalyticsItems,
    OperationsDataItems,
    recentInvoices,
    stockAlerts,
    topProducts,
    topCustomers,
  } = useDashboardData();

  // Keyboard navigation for tabs
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        setActiveTab(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          📊 Business Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Monitor your business performance and key metrics
        </Text>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: '1',
            label: (
              <Tooltip title="Ctrl+1">
                <span>
                  <BarChartOutlined /> Overview
                </span>
              </Tooltip>
            ),
            children: (
              <OverviewTab
                DashBoardItems={DashBoardItems}
                SalesChartDataItems={SalesChartDataItems}
                stockAlerts={stockAlerts}
              />
            ),
          },
          {
            key: '2',
            label: (
              <Tooltip title="Ctrl+2">
                <span>
                  <WalletOutlined /> Finance
                </span>
              </Tooltip>
            ),
            children: (
              <FinanceTab
                FinancialDataItems={FinancialDataItems}
                recentInvoices={recentInvoices}
              />
            ),
          },
          {
            key: '3',
            label: (
              <Tooltip title="Ctrl+3">
                <span>
                  <StockOutlined /> Inventory
                </span>
              </Tooltip>
            ),
            children: (
              <InventoryTab InventoryMetricsItems={InventoryMetricsItems} />
            ),
          },
          {
            key: '4',
            label: (
              <Tooltip title="Ctrl+4">
                <span>
                  <RiseOutlined /> Sales Analysis
                </span>
              </Tooltip>
            ),
            children: (
              <SalesAnalysisTab
                topProducts={topProducts}
                topCustomers={topCustomers}
                SalesAnalyticsItems={SalesAnalyticsItems}
              />
            ),
          },
          {
            key: '5',
            label: (
              <Tooltip title="Ctrl+5">
                <span>
                  <CreditCardOutlined /> Operations
                </span>
              </Tooltip>
            ),
            children: (
              <OperationsTab OperationsDataItems={OperationsDataItems} />
            ),
          },
          {
            key: '6',
            label: (
              <Tooltip title="Ctrl+6">
                <span>
                  <TeamOutlined /> Performance
                </span>
              </Tooltip>
            ),
            children: (
              <PerformanceTab SalesAnalyticsItems={SalesAnalyticsItems} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Dashboard;
