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
    sub_total:number
    customerDetails: any;
    payment_mode: string;
    Items: any[];
    total_gst: number;
    total_amount: number;
    is_paid: boolean;
    is_partially_paid: boolean;
    paid_amount: number;
    discount: number;
    discount_type: string;
    is_gst_included: boolean;
    sale_type: 'retail' | 'wholesale';
    value_of_goods:number
  };
}

const BillViewModal: React.FC<BillViewModalProps> = ({
  visible,
  onClose,
  billData,
}) => {
  const printFrameRef = useRef<HTMLIFrameElement>(null);

  const formatAmount = (amount: any) => {
    const numAmount = Number(amount) || 0;
    return numAmount.toFixed(2);
  };
console.log("billData",billData)
  const shopDetails = {
    name: 'Focuz Medicals',
    address: '123 MG Road, Bangalore, Karnataka - 560001',
    gst: '29ABCDE1234F1Z5',
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
    const content = `
      <html>
        <head>
          <title>Sale - ${billData.invoice_no}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .shop-info { text-align: center; margin-bottom: 20px; }
            .shop-info h2 { margin-bottom: 0; color: #1890ff; }
            .info-flex { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { text-align: right; font-weight: bold; margin-top: 10px; }
            .thank-you { text-align: center; margin-top: 40px; font-size: 16px; color: #1890ff; font-weight: bold; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="shop-info">
            <h2>${shopDetails.name}</h2>
            <p>${shopDetails.address}</p>
            <p><strong>GST No:</strong> ${shopDetails.gst}</p>
          </div>

          <div class="info-flex">
            <div>
              <p><strong>Invoice No:</strong> ${billData.invoice_no}</p>
              <p><strong>Date:</strong> ${new Date(billData.date).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Customer:</strong> ${billData.customerDetails?.full_name || ''}</p>
              <p><strong>Payment Mode:</strong> ${billData.payment_mode || ''}</p>
            </div>
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
              ${billData.Items.map(item => {
                const product = item.productItems;
                const itemName = product
                  ? `${product.name}${product.VariantItem?.variant_name ? ` - ${product.VariantItem.variant_name}` : ''}`
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
            <p>Value of Goods: ₹ ${formatAmount(billData.value_of_goods)}</p>
            ${billData.discount > 0 ? `
              <p>Discount: ${billData.discount_type === 'percentage' ? billData.discount + '%' : '₹ ' + formatAmount(billData.discount)}</p>
            ` : ''}
            <p>Total GST: ₹ ${formatAmount(billData.total_gst)}</p>
            <p><strong>${billData.sale_type === 'retail' ? 'Bill Value' : 'Invoice Value'}: ₹ ${formatAmount(billData.total_amount)}</strong></p>
            ${billData.is_partially_paid ? `
              <p>Paid Amount: ₹ ${formatAmount(billData.paid_amount)}</p>
              <p>Remaining Amount: ₹ ${formatAmount(Number(billData.total_amount) - Number(billData.paid_amount))}</p>
            ` : ''}
            <p><strong>Payment Status:</strong> ${billData.is_paid ? 'Fully Paid' : billData.is_partially_paid ? 'Partially Paid' : 'Unpaid'}</p>
          </div>

          <div class="thank-you">
            Thank you for shopping with us!
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
    iframe!.contentWindow!.document.open();
    iframe!.contentWindow!.document.write(content);
    iframe!.contentWindow!.document.close();

    window.addEventListener('message', (event) => {
      if (event.data === 'printComplete') {
        onClose();
      }
    });
  };

  return (
    <>
      <Modal
        title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}>Sale Details</Title>}
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Sale
          </Button>,
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ marginBottom: 0, color: '#1890ff' }}>{shopDetails.name}</Title>
          <Text>{shopDetails.address}</Text><br />
          <Text><strong>GST No:</strong> <Text code>{shopDetails.gst}</Text></Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <Text strong>Invoice No:</Text> {billData.invoice_no}<br />
            <Text strong>Date:</Text> {new Date(billData.date).toLocaleDateString()}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text strong>Customer:</Text> {billData.customerDetails?.full_name}<br />
            <Text strong>Payment Mode:</Text> {billData.payment_mode}
          </div>
        </div>
console.log("billData",billData)
        <Table
          dataSource={billData.Items}
          columns={columns}
          pagination={false}
          bordered
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}><Text strong>Total Amount:</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><Text strong>₹ {formatAmount(billData.sub_total)}</Text></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />

        <div style={{ marginTop: 20, textAlign: 'right' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <Text strong>Value of Goods:</Text>
            <Text>₹ {formatAmount(billData.value_of_goods)}</Text>
          </div>
          {billData.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
              <Text strong>Discount:</Text>
              <Text>
                {billData.discount_type === 'percentage' 
                  ? `${billData.discount}%` 
                  : `₹ ${formatAmount(billData.discount)}`}
              </Text>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <Text strong>Total GST:</Text>
            <Text>₹ {formatAmount(billData.total_gst)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <Text strong>{billData.sale_type === 'retail' ? 'Bill Value' : 'Invoice Value'}:</Text>
            <Text>₹ {formatAmount(billData.total_amount)}</Text>
          </div>
          <Text strong>Payment Status: </Text>
          {billData.is_paid ? (
            <Text type="success">Fully Paid</Text>
          ) : billData.is_partially_paid ? (
            <>
              <Text type="warning">Partially Paid</Text><br />
              <Text>Paid Amount: ₹ {formatAmount(billData.paid_amount)}</Text><br />
              <Text>Remaining Amount: ₹ {formatAmount(Number(billData.total_amount) - Number(billData.paid_amount))}</Text>
            </>
          ) : (
            <Text type="danger">Unpaid</Text>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Text style={{ color: '#1890ff', fontWeight: 500 }}>Thank you for shopping with us!</Text>
        </div>
      </Modal>

      <iframe ref={printFrameRef} style={{ display: 'none' }} title="print-frame" />
    </>
  );
};

export default BillViewModal;
