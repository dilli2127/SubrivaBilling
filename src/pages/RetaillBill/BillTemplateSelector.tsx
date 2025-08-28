import React from 'react';
import { billingTemplates, BillingTemplateKey } from './templates/registry';
import { Button, Modal } from 'antd';

interface BillTemplateSelectorProps {
  selected: BillingTemplateKey;
  onSelect: (key: BillingTemplateKey) => void;
}

const sampleBillData = {
  customerName: 'John Doe',
  customerAddress: '123 Main St, City',
  date: '2024-06-01',
  invoice_no: 'INV-001',
  items: [
    { name: 'Product A', qty: 2, price: 100, amount: 200 },
    { name: 'Product B', qty: 1, price: 150, amount: 150 },
  ],
  total: 350,
};

// Optimized style objects to prevent recreation on every render
const containerStyle = {
  display: 'flex',
  gap: 32,
  flexWrap: 'wrap' as const,
  justifyContent: 'center' as const,
  margin: '32px 0',
};

const previewButtonStyle = {
  position: 'absolute' as const,
  right: 16,
  bottom: 16,
  padding: '0 12px',
  borderRadius: 6,
};

const modalContentStyle = {
  background: '#fafafa',
  borderRadius: 12,
  padding: 16,
  minHeight: 300,
};

const BillTemplateSelector: React.FC<BillTemplateSelectorProps> = ({
  selected,
  onSelect,
}) => {
  const [previewKey, setPreviewKey] = React.useState<BillingTemplateKey | null>(
    null
  );
  const [modalOpen, setModalOpen] = React.useState(false);

  const handlePreview = (key: BillingTemplateKey) => {
    setPreviewKey(key);
    setModalOpen(true);
  };

  const handleUseTemplate = () => {
    if (previewKey) {
      onSelect(previewKey);
      closeModal();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setPreviewKey(null); // Clear previewKey when modal closes
  };

  return (
    <>
      <div style={containerStyle}>
        {Object.entries(billingTemplates).map(([key, tpl]) => {
          const isSelected = selected === key;

          return (
            <div
              key={key}
              style={{
                border: isSelected ? '2px solid #4e54c8' : '1px solid #eee',
                borderRadius: 18,
                boxShadow: isSelected
                  ? '0 4px 16px #4e54c855'
                  : '0 2px 12px rgba(0,0,0,0.08)',
                background: isSelected
                  ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
                padding: 24,
                cursor: 'pointer',
                width: 240,
                textAlign: 'center',
                transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                position: 'relative',
                marginBottom: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => onSelect(key as BillingTemplateKey)}
            >
              {/* Miniature live template preview */}
              <div
                style={{
                  width: 220,
                  height: 140,
                  overflow: 'hidden',
                  // margin: '0 auto 14px auto',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div
                  style={{
                    width: 750,
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'scale(0.28)',
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                  }}
                >
                  <tpl.component billData={sampleBillData} />
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  margin: '12px 0 10px 0',
                  letterSpacing: 1,
                }}
              >
                {tpl.label}
              </div>
              {isSelected && (
                <div
                  style={{
                    color: '#4e54c8',
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                >
                  Selected
                </div>
              )}
              <Button
                type="primary"
                ghost
                size="small"
                style={previewButtonStyle}
                onClick={e => {
                  e.stopPropagation(); // Prevent parent div click
                  handlePreview(key as BillingTemplateKey);
                }}
              >
                Preview
              </Button>
            </div>
          );
        })}
      </div>

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
          previewKey ? billingTemplates[previewKey].label + ' Preview' : ''
        }
        centered
        destroyOnClose
      >
        {previewKey && (
          <div
            style={modalContentStyle}
          >
            {React.createElement(billingTemplates[previewKey].component, {
              billData: sampleBillData,
            })}
          </div>
        )}
      </Modal>
    </>
  );
};

export default BillTemplateSelector;
