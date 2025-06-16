import React, { useRef } from 'react';
import { Modal, Button, Table, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface BillViewModalProps {
  visible: boolean;
  onClose: () => void;
  billData: {
    invoice_no: string;
    date: string;
    customer: any;
    payment_mode: string;
    items: any[];
    total_amount: number;
    is_paid: boolean;
    is_partially_paid: boolean;
    paid_amount: number;
  };
}

const BillViewModal: React.FC<BillViewModalProps> = ({
  visible,
  onClose,
  billData,
}) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);
 console.log("billData",billData)
  const formatAmount = (amount: any) => {
    const numAmount = Number(amount) || 0;
    return numAmount.toFixed(2);
  };

  const columns = [
    {
      title: 'Item',
      dataIndex: 'productItems',
      key: 'name',
      render: (_: any, record: any) => {
        const product = record.productItems;
        if (!product) return '';
        const variantName = product.VariantItem?.variant_name;
        return variantName ? `${product.name} - ${variantName}` : product.name;
      },
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
      render: (qty: any) => qty || 0,
    },
    {
      title: 'Loose Qty',
      dataIndex: 'loose_qty',
      key: 'loose_qty',
      width: 100,
      render: (loose_qty: any) => loose_qty || 0,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: any) => `₹ ${formatAmount(price)}`,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: any) => `₹ ${formatAmount(amount)}`,
    },
  ];

  const handlePrint = () => {
    if (!printFrameRef.current) return;

    const content = `
      <html>
        <head>
          <title>Bill - ${billData.invoice_no}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { text-align: right; font-weight: bold; }
            .payment-info { margin-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Retail Bill</h2>
            <p>Invoice No: ${billData.invoice_no}</p>
            <p>Date: ${new Date(billData.date).toLocaleDateString()}</p>
          </div>
          
          <div class="info">
            <p><strong>Customer:</strong> ${billData.customer?.full_name || ''}</p>
            <p><strong>Payment Mode:</strong> ${billData.payment_mode || ''}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Loose Qty</th>
                <th>Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${billData.items.map(item => {
                const product = item.productItems;
                const itemName = product ? 
                  `${product.name}${product.VariantItem?.variant_name ? ` - ${product.VariantItem.variant_name}` : ''}` 
                  : '';
                return `
                  <tr>
                    <td>${itemName}</td>
                    <td>${item.qty || 0}</td>
                    <td>${item.loose_qty || 0}</td>
                    <td>₹ ${formatAmount(item.price)}</td>
                    <td>₹ ${formatAmount(item.amount)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Total Amount: ₹ ${formatAmount(billData.total_amount)}</p>
            ${billData.is_partially_paid ? `
              <p>Paid Amount: ₹ ${formatAmount(billData.paid_amount)}</p>
              <p>Remaining Amount: ₹ ${formatAmount(Number(billData.total_amount) - Number(billData.paid_amount))}</p>
            ` : ''}
          </div>

          <div class="payment-info">
            <p><strong>Payment Status:</strong> ${billData.is_paid ? 'Fully Paid' : billData.is_partially_paid ? 'Partially Paid' : 'Unpaid'}</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Bill</button>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.parent.postMessage('printComplete', '*');
              };
            };
          </script>
        </body>
      </html>
    `;

    const iframe = printFrameRef.current;
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(content);
    iframe.contentWindow?.document.close();

    // Listen for print completion message
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'printComplete') {
        window.removeEventListener('message', handleMessage);
        onClose();
      }
    };
    window.addEventListener('message', handleMessage);
  };

  return (
    <>
      <Modal
        title={
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            Bill Details
          </Title>
        }
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Bill
          </Button>,
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 20 }}>
          <Text strong>Invoice No:</Text> {billData.invoice_no}
          <br />
          <Text strong>Date:</Text> {new Date(billData.date).toLocaleDateString()}
          <br />
          <Text strong>Customer:</Text> {billData.customer?.full_name}
          <br />
          <Text strong>Payment Mode:</Text> {billData.payment_mode}
        </div>

        <Table
          dataSource={billData.items}
          columns={columns}
          pagination={false}
          bordered
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <Text strong>Total Amount:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>₹ {formatAmount(billData.total_amount)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <Text strong>Payment Status: </Text>
          {billData.is_paid ? (
            <Text type="success">Fully Paid</Text>
          ) : billData.is_partially_paid ? (
            <>
              <Text type="warning">Partially Paid</Text>
              <br />
              <Text>Paid Amount: ₹ {formatAmount(billData.paid_amount)}</Text>
              <br />
              <Text>Remaining Amount: ₹ {formatAmount(Number(billData.total_amount) - Number(billData.paid_amount))}</Text>
            </>
          ) : (
            <Text type="danger">Unpaid</Text>
          )}
        </div>
      </Modal>

      <iframe
        ref={printFrameRef}
        style={{ display: 'none' }}
        title="print-frame"
      />
    </>
  );
};

export default BillViewModal; 