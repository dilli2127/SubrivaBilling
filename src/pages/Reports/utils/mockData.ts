// Mock data for reports

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658', '#8dd1e1'];

export const mockSalesData = [
  { month: 'Jan', sales: 45000, profit: 12400, cost: 32600, orders: 124 },
  { month: 'Feb', sales: 52000, profit: 15398, cost: 36602, orders: 143 },
  { month: 'Mar', sales: 48000, profit: 13800, cost: 34200, orders: 138 },
  { month: 'Apr', sales: 61000, profit: 17908, cost: 43092, orders: 169 },
  { month: 'May', sales: 55000, profit: 16800, cost: 38200, orders: 158 },
  { month: 'Jun', sales: 67000, profit: 20800, cost: 46200, orders: 189 },
];

export const mockCustomerSegments = [
  { name: 'New Customers', value: 145, color: '#0088FE', percentage: 28 },
  { name: 'Regular Customers', value: 235, color: '#00C49F', percentage: 46 },
  { name: 'VIP Customers', value: 85, color: '#FFBB28', percentage: 17 },
  { name: 'Inactive', value: 45, color: '#FF8042', percentage: 9 },
];

export const mockProductPerformance = [
  { name: 'Electronics', sales: 120000, profit: 35000, margin: 29.2 },
  { name: 'Clothing', sales: 95000, profit: 28500, margin: 30.0 },
  { name: 'Food Items', sales: 78000, profit: 15600, margin: 20.0 },
  { name: 'Furniture', sales: 56000, profit: 16800, margin: 30.0 },
  { name: 'Accessories', sales: 42000, profit: 12600, margin: 30.0 },
];

export const mockPaymentMethods = [
  { method: 'Cash', amount: 125000, transactions: 342, percentage: 35 },
  { method: 'Card', amount: 178000, transactions: 456, percentage: 50 },
  { method: 'UPI', amount: 42000, transactions: 189, percentage: 12 },
  { method: 'Credit', amount: 11000, transactions: 23, percentage: 3 },
];

export const mockTopCustomers = [
  { name: 'Rajesh Kumar', totalPurchase: 125000, orders: 45, outstanding: 5000 },
  { name: 'Priya Sharma', totalPurchase: 98000, orders: 38, outstanding: 0 },
  { name: 'Amit Patel', totalPurchase: 87000, orders: 32, outstanding: 8000 },
  { name: 'Sneha Reddy', totalPurchase: 76000, orders: 28, outstanding: 2000 },
  { name: 'Vikram Singh', totalPurchase: 65000, orders: 24, outstanding: 0 },
];

export const mockStaffPerformance = [
  { name: 'Rahul Verma', sales: 245000, orders: 89, conversion: 85, target: 250000 },
  { name: 'Anita Desai', sales: 198000, orders: 76, conversion: 78, target: 200000 },
  { name: 'Karan Mehta', sales: 176000, orders: 65, conversion: 72, target: 180000 },
  { name: 'Pooja Nair', sales: 154000, orders: 58, conversion: 68, target: 150000 },
];

