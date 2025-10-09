import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Empty } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useSpecialApiFetchers } from '../../../services/api/specialApiFetchers';
import { useDynamicSelector } from '../../../services/redux/selector';

const { Text } = Typography;

const FinancialReport: React.FC = () => {
  const { Reports } = useSpecialApiFetchers();
  
  // Get data from Redux store
  const profitLossData = useDynamicSelector(Reports.getIdentifier('GetProfitLossReport'));
  const expenseData = useDynamicSelector(Reports.getIdentifier('GetExpenseReport'));
  const gstData = useDynamicSelector(Reports.getIdentifier('GetGSTReport'));
  
  // Extract data
  const profitLoss = profitLossData?.result || {};
  const expenses = expenseData?.result?.expenses || [];
  const expenseSummary = expenseData?.result?.summary || {};
  const gstSummary = gstData?.result?.summary || {};
  
  // Calculate metrics
  const totalRevenue = parseFloat(profitLoss.revenue?.total_sales_revenue) || 0;
  const totalDiscount = parseFloat(profitLoss.revenue?.total_discount_given) || 0;
  const netRevenue = parseFloat(profitLoss.revenue?.net_revenue) || totalRevenue - totalDiscount;
  const cogs = parseFloat(profitLoss.costs?.cost_of_goods_sold) || 0;
  const operatingExpenses = parseFloat(profitLoss.costs?.operating_expenses) || 0;
  const totalCosts = parseFloat(profitLoss.costs?.total_costs) || 0;
  const grossProfit = parseFloat(profitLoss.profit?.gross_profit) || 0;
  const netProfit = parseFloat(profitLoss.profit?.net_profit) || 0;
  const profitMargin = parseFloat(profitLoss.profit?.profit_margin_percentage) || 0;
  const gstCollected = parseFloat(gstSummary.total_gst_collected) || 0;
  
  // Prepare P&L statement data
  const plStatementData = [
    { category: 'Total Revenue', amount: totalRevenue, type: 'income' },
    { category: 'Discount Given', amount: -totalDiscount, type: 'expense' },
    { category: 'Net Revenue', amount: netRevenue, type: 'income' },
    { category: 'Cost of Goods Sold', amount: -cogs, type: 'expense' },
    { category: 'Gross Profit', amount: grossProfit, type: 'income' },
    { category: 'Operating Expenses', amount: -operatingExpenses, type: 'expense' },
    { category: 'Net Profit', amount: netProfit, type: 'profit' },
  ];
  
  // Prepare expense breakdown chart
  const expenseBreakdown = (expenseSummary.category_breakdown || []).map((item: any) => ({
    category: item.category || 'Other',
    amount: parseFloat(item.total_amount) || 0,
    count: parseInt(item.expense_count) || 0,
  }));

  return (
    <div>
      {/* P&L Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#f6ffed' }}>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#fff7e6' }}>
            <Statistic
              title="Total Costs"
              value={totalCosts}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#e6f7ff' }}>
            <Statistic
              title="Net Profit"
              value={netProfit}
              prefix="₹"
              precision={2}
              valueStyle={{ color: netProfit >= 0 ? '#1890ff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card style={{ borderRadius: 12, textAlign: 'center', background: '#f9f0ff' }}>
            <Statistic
              title="Profit Margin"
              value={profitMargin}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Breakdown */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Profit & Loss Statement" style={{ borderRadius: 12 }}>
            <Table
              dataSource={plStatementData}
              columns={[
                { 
                  title: 'Category', 
                  dataIndex: 'category', 
                  key: 'category',
                  render: (text: string, record: any) => (
                    <Text strong={record.type === 'profit'}>{text}</Text>
                  )
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  align: 'right',
                  render: (amt: number, record: any) => (
                    <Text
                      strong={record.type === 'profit'}
                      style={{
                        color: record.type === 'income' || record.type === 'profit' 
                          ? amt >= 0 ? '#52c41a' : '#ff4d4f'
                          : '#ff4d4f',
                      }}
                    >
                      ₹{Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  ),
                },
              ]}
              pagination={false}
              size="small"
              locale={{ emptyText: 'No financial data available' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Expense Breakdown by Category" style={{ borderRadius: 12 }}>
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={expenseBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#ff7a45" name="Amount (₹)" />
                  <Bar dataKey="count" fill="#1890ff" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No expense data available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Revenue & Cost Breakdown" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={12}>
                <Statistic 
                  title="Gross Profit" 
                  value={grossProfit} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }} 
                />
              </Col>
              <Col xs={12}>
                <Statistic 
                  title="COGS" 
                  value={cogs} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#ff4d4f', fontSize: '20px' }} 
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={12}>
                <Statistic 
                  title="GST Collected" 
                  value={gstCollected} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }} 
                />
              </Col>
              <Col xs={12}>
                <Statistic 
                  title="Discount Given" 
                  value={totalDiscount} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#fa8c16', fontSize: '18px' }} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Expense Summary" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={12}>
                <Statistic 
                  title="Total Expenses" 
                  value={parseFloat(expenseSummary.total_expense_amount) || 0} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#ff4d4f', fontSize: '20px' }} 
                />
              </Col>
              <Col xs={12}>
                <Statistic 
                  title="Expense Count" 
                  value={parseInt(expenseSummary.total_expense_count) || 0}
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }} 
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={12}>
                <Statistic 
                  title="Avg Expense" 
                  value={parseFloat(expenseSummary.average_expense) || 0} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }} 
                />
              </Col>
              <Col xs={12}>
                <Statistic 
                  title="Operating Exp" 
                  value={operatingExpenses} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#fa8c16', fontSize: '18px' }} 
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FinancialReport;
