import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import {
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { mockStaffPerformance } from '../utils/mockData';

const StaffReport: React.FC = () => {
  return (
    <div>
      {/* Staff Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TeamOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
            <Statistic title="Total Staff" value={24} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <TrophyOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
            <Statistic title="Top Performer Sales" value={245000} prefix="₹" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <RiseOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
            <Statistic title="Avg Conversion Rate" value={75.8} suffix="%" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ textAlign: 'center', borderRadius: 12 }}>
            <BarChartOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }} />
            <Statistic title="Target Achievement" value={91} suffix="%" valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Staff Sales Performance" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockStaffPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" name="Sales (₹)" />
                <Bar dataKey="target" fill="#d3d3d3" name="Target (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Conversion Rate Comparison" style={{ borderRadius: 12 }}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={mockStaffPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Conversion %" dataKey="conversion" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Staff Performance Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Detailed Staff Performance" style={{ borderRadius: 12 }}>
            <Table
              dataSource={mockStaffPerformance}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name' },
                {
                  title: 'Sales',
                  dataIndex: 'sales',
                  key: 'sales',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                  sorter: (a: any, b: any) => a.sales - b.sales,
                },
                {
                  title: 'Target',
                  dataIndex: 'target',
                  key: 'target',
                  render: (val: number) => `₹${val.toLocaleString()}`,
                },
                {
                  title: 'Achievement',
                  key: 'achievement',
                  render: (_: any, record: any) => {
                    const achievement = (record.sales / record.target) * 100;
                    return (
                      <Tag color={achievement >= 100 ? 'success' : achievement >= 80 ? 'processing' : 'warning'}>
                        {achievement.toFixed(1)}%
                      </Tag>
                    );
                  },
                  sorter: (a: any, b: any) => (a.sales / a.target) - (b.sales / b.target),
                },
                {
                  title: 'Orders',
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a: any, b: any) => a.orders - b.orders,
                },
                {
                  title: 'Conversion Rate',
                  dataIndex: 'conversion',
                  key: 'conversion',
                  render: (val: number) => (
                    <span>
                      {val}%
                      <Progress percent={val} size="small" style={{ marginTop: 4 }} />
                    </span>
                  ),
                  sorter: (a: any, b: any) => a.conversion - b.conversion,
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_: any, record: any) => {
                    const achievement = (record.sales / record.target) * 100;
                    return (
                      <Tag color={achievement >= 100 ? 'green' : achievement >= 90 ? 'blue' : achievement >= 75 ? 'orange' : 'red'}>
                        {achievement >= 100 ? 'Excellent' : achievement >= 90 ? 'Good' : achievement >= 75 ? 'Average' : 'Below Avg'}
                      </Tag>
                    );
                  },
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffReport;

