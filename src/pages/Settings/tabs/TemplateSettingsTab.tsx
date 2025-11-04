import React, { useState } from 'react';
import {
  Form,
  Button,
  Divider,
  Modal,
  Card,
  Row,
  Col,
} from 'antd';
import {
  FileTextOutlined,
  SaveOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';
import { billTemplates, invoiceTemplates, BillTemplateKey, InvoiceTemplateKey } from '../../RetaillBill/templates/registry';
import { useUser } from '../../../components/antd/UserContext';

const TemplateSettingsTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  const userItem = useUser();
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'bill' | 'invoice'>('bill');
  const [modalOpen, setModalOpen] = useState(false);

  const billTemplate = Form.useWatch('bill_template', form);
  const invoiceTemplate = Form.useWatch('invoice_template', form);

  // Generate preview data using actual organization info
  const getPreviewData = () => ({
    customerName: 'Sample Customer',
    customerAddress: 'Sample Address, City',
    customerPhone: '+91 9999999999',
    customerEmail: 'customer@example.com',
    date: new Date().toISOString(),
    invoice_no: 'PREVIEW-001',
    payment_mode: 'Cash',
    items: [
      { 
        name: 'Sample Product 1', 
        product_name: 'Sample Product 1',
        qty: 2, 
        price: 100, 
        amount: 200,
        tax_percentage: 18,
        hsn_code: '1234',
        mrp: 120,
        unit: 'Pcs'
      },
      { 
        name: 'Sample Product 2', 
        product_name: 'Sample Product 2',
        qty: 1, 
        price: 150, 
        amount: 150,
        tax_percentage: 18,
        hsn_code: '5678',
        mrp: 180,
        unit: 'Pcs'
      },
    ],
    total: 350,
    total_gst: 63,
    cgst: 31.5,
    sgst: 31.5,
    discount: 0,
    discount_type: 'percentage',
  });

  const handlePreview = (key: string, type: 'bill' | 'invoice') => {
    setPreviewKey(key);
    setPreviewType(type);
    setModalOpen(true);
  };

  const handleUseTemplate = () => {
    if (previewKey) {
      if (previewType === 'bill') {
        form.setFieldValue('bill_template', previewKey);
      } else {
        form.setFieldValue('invoice_template', previewKey);
      }
      closeModal();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPreviewKey(null);
  };

  const renderTemplateSelector = (
    type: 'bill' | 'invoice',
    selectedKey: string,
    fieldName: string
  ) => {
    const templates = type === 'bill' ? billTemplates : invoiceTemplates;
    
    return (
      <Row gutter={[16, 16]}>
        {Object.entries(templates).map(([key, tpl]) => {
          const isSelected = selectedKey === key;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={key}>
              <Card
                hoverable
                style={{
                  border: isSelected ? '2px solid #4e54c8' : '1px solid #eee',
                  borderRadius: 12,
                  boxShadow: isSelected
                    ? '0 4px 16px #4e54c855'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  background: isSelected
                    ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    : '#fff',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                }}
                onClick={() => form.setFieldValue(fieldName, key)}
                bodyStyle={{ padding: 16 }}
              >
                {/* Miniature preview */}
                <div
                  style={{
                    width: '100%',
                    height: 120,
                    overflow: 'hidden',
                    borderRadius: 8,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e0e0e0',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 750,
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'scale(0.22)',
                      transformOrigin: 'center center',
                    pointerEvents: 'none',
                  }}
                >
                  <tpl.component billData={getPreviewData()} />
                </div>
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 4,
                    color: isSelected ? '#4e54c8' : '#333',
                  }}
                >
                  {tpl.label}
                </div>
                
                <div
                  style={{
                    fontSize: 12,
                    color: '#666',
                    marginBottom: 8,
                  }}
                >
                  {tpl.description}
                </div>

                {isSelected && (
                  <div
                    style={{
                      color: '#4e54c8',
                      fontWeight: 500,
                      fontSize: 12,
                      marginBottom: 8,
                    }}
                  >
                    ✓ Selected
                  </div>
                )}

                <Button
                  type="primary"
                  ghost
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(key, type);
                  }}
                >
                  Preview
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      <Form form={form} layout="vertical" className={styles.settingsForm}>
        <div className={styles.sectionTitle}>
          <FileTextOutlined />
          Template Settings
        </div>

        <div className={styles.infoBox}>
          Select your preferred templates for bills and invoices. These templates will be used when printing or generating PDFs.
        </div>

        <Divider>Bill Template (For Quick Sales / Retail)</Divider>

        <div className={styles.successBox}>
          📄 <strong>Bill Template:</strong> Used for quick retail sales and POS billing
        </div>

        <Form.Item name="bill_template">
          {renderTemplateSelector('bill', billTemplate, 'bill_template')}
        </Form.Item>

        <Divider>Invoice Template (For Formal Invoices)</Divider>

        <div className={styles.successBox}>
          📋 <strong>Invoice Template:</strong> Used for formal invoices with detailed information
        </div>

        <Form.Item name="invoice_template">
          {renderTemplateSelector('invoice', invoiceTemplate, 'invoice_template')}
        </Form.Item>

        <div className={styles.warningBox}>
          💡 <strong>Tip:</strong> You can preview each template before selecting. Click the template card to select it, or click "Preview" for a full-size view.
        </div>

        <div className={styles.formActions}>
          <Button onClick={onReset}>Reset</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSave}
            loading={loading}
          >
            Save Template Settings
          </Button>
        </div>
      </Form>

      {/* Preview Modal */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        footer={[
          <Button key="use" type="primary" onClick={handleUseTemplate}>
            Use this template
          </Button>,
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
        width={800}
        title={
          previewKey
            ? `${previewType === 'bill' ? billTemplates[previewKey as BillTemplateKey]?.label : invoiceTemplates[previewKey as InvoiceTemplateKey]?.label} Preview`
            : ''
        }
        centered
        destroyOnClose
      >
        {previewKey && (
          <div
            style={{
              background: '#fafafa',
              borderRadius: 12,
              padding: 16,
              minHeight: 300,
            }}
          >
            {React.createElement(
              previewType === 'bill' 
                ? billTemplates[previewKey as BillTemplateKey].component 
                : invoiceTemplates[previewKey as InvoiceTemplateKey].component,
              { billData: getPreviewData() }
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default TemplateSettingsTab;

