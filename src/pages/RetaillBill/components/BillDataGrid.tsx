import React from 'react';
import { Typography, Button, message } from 'antd';
import {
  SaveOutlined,
  PrinterOutlined,
  FileTextOutlined,
  ClearOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import AntdEditableTable from '../../../components/common/AntdEditableTable';
import { useAdvancedBilling } from '../hooks/useAdvancedBilling';
import BillTopBar from './BillTopBar';
import BillHeader from './BillHeader';
import BillSummary from './BillSummary';
import StockSelectionModal from './StockSelectionModal';
import CustomerSelectionModal from './CustomerSelectionModal';
import VendorSelectionModal from './VendorSelectionModal';
import UserSelectionModal from './UserSelectionModal';
import BillSaveConfirmationModal from './BillSaveConfirmationModal';
import BillListDrawer from './BillListDrawer';
import ProductDetailsModal from './ProductDetailsModal';
import ProductSelectionModal from './ProductSelectionModal';
import styles from './BillDataGrid.module.css';

const { Text } = Typography;

interface BillDataGridProps {
  billdata?: any;
  onSuccess?: (formattedBill?: any) => void;
}

/**
 * 🚀 REFACTORED BillDataGrid Component
 * 
 * Before: 3,493 lines of code
 * After: ~497 lines (86% reduction!)
 * 
 * All logic moved to hooks:
 * - useAdvancedBilling: Master orchestration
 * - Data, form, modals, calculations, actions
 */
const BillDataGrid: React.FC<BillDataGridProps> = ({ billdata, onSuccess }) => {
  // 🔥 ONE HOOK TO RULE THEM ALL
  const billing = useAdvancedBilling({ billdata, onSuccess });

  // Destructure for easier access
  const {
    billData,
    form,
    modals,
    actions,
    billCalculations,
    handleQuantityChange,
    handleProductSelect,
    handleStockSelect,
    handlePrint,
    handleDownload,
    productOptions,
    customerOptions,
    vendorOptions,
    userOptions,
  } = billing;

  return (
    <div className={styles.mainContainer}>
      {/* Background Half Circles */}
      <div className={styles.backgroundCircle1} />
      <div className={styles.backgroundCircle2} />
      <div className={styles.backgroundCircle3} />
      <div className={styles.backgroundCircle4} />
      <div className={styles.backgroundCircle5} />

      {/* Top Bar with Controls */}
      <BillTopBar
        billdata={billdata}
        documentType={form.documentType}
        billSettings={form.billSettings}
        itemCount={form.billFormData.items.length}
        totalAmount={billCalculations.total_amount}
        onDocumentTypeChange={form.setDocumentType}
        onSettingsChange={form.updateSettings}
      />

      {/* Invoice Header */}
      <div className={styles.invoiceDetailsGrid}>
        <BillHeader
          billFormData={form.billFormData}
          customerOrVendorOptions={
            form.documentType === 'bill' ? customerOptions : vendorOptions
          }
          userOptions={userOptions}
          documentType={form.documentType}
          onHeaderChange={rows => {
            if (rows[0]) {
              const customer =
                form.documentType === 'bill'
                  ? billData.customerListResult.find(
                      (c: any) => c._id === rows[0].customer_id
                    )
                  : billData.vendorListResult.find(
                      (v: any) => v._id === rows[0].customer_id
                    );
              const user = billData.userListResult.find(
                (u: any) => u._id === rows[0].billed_by_id
              );
              form.updateHeader({
                invoice_no: rows[0].invoice_no || '',
                date: rows[0].date,
                customer_id: rows[0].customer_id || '',
                customer_name: customer?.full_name || customer?.vendor_name || '',
                billed_by_id: rows[0].billed_by_id || '',
                billed_by_name: user?.name || '',
                payment_mode: rows[0].payment_mode || 'cash',
              });
            }
          }}
          onCustomerModalOpen={modals.openCustomerModal}
          onUserModalOpen={modals.openUserModal}
          loading={billData.customerLoading || billData.vendorLoading}
        />
      </div>

      {/* Items Section with Summary */}
      <div className={styles.itemsSection}>
        {/* Decorative circles */}
        <div className={styles.itemsCircle1} />
        <div className={styles.itemsCircle2} />

        {/* Bill Items Grid */}
        <div className={styles.billItemsGrid}>
          <div className={styles.billItemsHeader}>
            <Text className={styles.billItemsTitle}>🛒 BILL ITEMS</Text>
          </div>

          <AntdEditableTable
            columns={[
              {
                key: 'product_id',
                title: '🛒 PRODUCT',
                dataIndex: 'product_id',
                type: 'product',
                required: true,
                width: 280,
                render: (value: any, record: any, index?: number) => {
                  // Use product data stored in bill item (not from options)
                  const displayName = value
                    ? (record.product_name
                        ? `${record.product_name}${record.variant_name ? ` ${record.variant_name}` : ''}`.trim()
                        : 'Unknown Product')
                    : 'Select product';
                  return (
                    <div
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: value ? '1px solid #52c41a' : '1px solid #d9d9d9',
                        backgroundColor: value ? '#f6ffed' : '#fafafa',
                      }}
                      onClick={() => {
                        if (typeof index === 'number') {
                          modals.openProductSelectionModal(index);
                        }
                      }}
                    >
                      <span style={{ color: value ? '#52c41a' : '#1890ff' }}>
                        {displayName}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: 'stock_id',
                title: '📦 STOCK',
                dataIndex: 'batch_no',
                type: 'stock',
                required: true,
                width: 200,
                render: (value: any, record: any, index?: number) => {
                  const stockData = (record as any).stockData;
                  const availableQty = stockData?.available_quantity || 0;
                  const hasStock = record.stock_id || stockData;
                  
                  // Determine display text
                  let displayText = 'Select Stock';
                  if (hasStock) {
                    // If we have batch_no, show it with quantity
                    if (value) {
                      displayText = `${value} (Qty: ${availableQty})`;
                    } else {
                      // If stock is selected but no batch_no, show stock ID
                      displayText = `${record.stock_id?.slice(-8) || 'Stock'} (Qty: ${availableQty})`;
                    }
                  }
                  
                  return (
                    <div
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: hasStock ? '1px solid #52c41a' : '1px solid #d9d9d9',
                      }}
                      onClick={() => {
                        if (record.product_id && typeof index === 'number') {
                          modals.openStockModal(index);
                        } else if (!record.product_id) {
                          message.warning('Please select a product first');
                        }
                      }}
                    >
                      <span>{displayText}</span>
                    </div>
                  );
                },
              },
              {
                key: 'qty',
                title: '📊 QTY',
                dataIndex: 'qty',
                type: 'number',
                width: 90,
                editable: true,
              },
              {
                key: 'loose_qty',
                title: '📋 LOOSE',
                dataIndex: 'loose_qty',
                type: 'number',
                width: 90,
                editable: true,
              },
              {
                key: 'price',
                title: '💰 RATE',
                dataIndex: 'price',
                type: 'number',
                width: 120,
                editable: false,
              },
              {
                key: 'amount',
                title: '💵 AMOUNT',
                dataIndex: 'amount',
                type: 'number',
                width: 130,
                editable: false,
              },
            ]}
            dataSource={form.billFormData.items.map((item, index) => ({
              ...item,
              key: index.toString(),
            }))}
            onSave={items => {
              // Handle quantity changes
              const updatedItems = items.map((item, idx) => {
                const currentItem = form.billFormData.items[idx];
                if (
                  item.qty !== currentItem?.qty ||
                  item.loose_qty !== currentItem?.loose_qty
                ) {
                  // Quantity changed, recalculate
                  return item;
                }
                return item;
              });
              billing.handleItemsChange(updatedItems);
            }}
            onAdd={form.addItem}
            onDelete={form.deleteItems}
            onProductSelect={handleProductSelect}
            loading={
              billData.productLoading ||
              billData.stockLoading ||
              billData.branchStockLoading
            }
            className="modern-bill-grid"
            size="small"
            rowKey="key"
            externalEditingCell={modals.externalEditingCell}
          />
        </div>

        {/* Bill Summary - Right Side */}
        <BillSummary
          billCalculations={billCalculations}
          billSettings={form.billSettings}
          onDiscountChange={value => form.updateSettings({ discount: value })}
          onDiscountTypeChange={checked =>
            form.updateSettings({
              discountType: checked ? 'percentage' : 'amount',
            })
          }
          onPaidAmountChange={value => form.updateSettings({ paidAmount: value })}
        />
      </div>

      {/* Action Hub */}
      <div className={styles.actionHub}>
        {/* Background decoration */}
        <div className={styles.actionHubCircle1} />
        <div className={styles.actionHubCircle2} />
        <div className={styles.actionHubCircle3} />
        <div className={styles.actionHubCircle4} />

        <div className={styles.actionButtonsContainer}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={actions.handleSaveDraft}
            loading={billData.saleCreateLoading}
            className={styles.saveButton}
          >
            💾 SAVE DRAFT (F2)
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={actions.handleCompleteBill}
            loading={billData.saleCreateLoading || billData.saleUpdateLoading}
            className={styles.saveButton}
          >
            🚀 {billdata ? 'UPDATE' : 'COMPLETE BILL'} (F3)
          </Button>

          <Button
            size="large"
            icon={<FileTextOutlined />}
            onClick={modals.openBillListDrawer}
            className={styles.billListButton}
          >
            📋 BILL LIST (F6)
          </Button>

          <Button
            size="large"
            icon={<ClearOutlined />}
            onClick={() => {
              form.resetForm();
              message.success('Bill form cleared successfully!');
            }}
            className={styles.clearButton}
          >
            🧹 CLEAR (F4 / Ctrl+R)
          </Button>

          <Button
            size="large"
            icon={<PrinterOutlined />}
            className={styles.printButton}
            onClick={handlePrint}
          >
            🖨️ PRINT {form.documentType === 'bill' ? 'BILL' : 'INVOICE'} (F8)
          </Button>

          <Button
            size="large"
            icon={<DownloadOutlined />}
            className={styles.downloadButton}
            onClick={handleDownload}
          >
            📥 DOWNLOAD PDF
          </Button>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <Text
              style={{
                color: '#475569',
                fontSize: '12px',
                display: 'block',
                fontWeight: 600,
                lineHeight: '18px',
              }}
            >
              ⚡ <strong>Keyboard Shortcuts:</strong> Ctrl+S (Save) • Ctrl+N (Add) • F4/Ctrl+R
              (Clear) • Tab/Shift+Tab (Navigate) • Enter (Edit) • Esc (Cancel) • End (Customer) •
              Ctrl+U (User) • F5 (Product) • F6 (Bill List) • F7 (Stock)
            </Text>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modals.stockModalRowIndex !== null && (
        <StockSelectionModal
          visible={true}
          onSelect={handleStockSelect}
          onCancel={modals.closeStockModal}
          productId={form.billFormData.items[modals.stockModalRowIndex]?.product_id || ''}
        />
      )}

      {form.documentType === 'bill' && (
        <CustomerSelectionModal
          visible={modals.customerModalVisible}
          onSelect={customer => {
            if (form.billFormData.customer_id === customer._id) return;
            form.updateHeader({
              customer_id: customer._id,
              customer_name: customer.full_name,
            });
            modals.closeCustomerModal();
            setTimeout(() => modals.openUserModal(), 100);
            message.success(`Customer "${customer.full_name}" selected successfully!`);
          }}
          onCancel={modals.closeCustomerModal}
        />
      )}

      {form.documentType === 'invoice' && (
        <VendorSelectionModal
          visible={modals.customerModalVisible}
          onSelect={vendor => {
            if (form.billFormData.customer_id === vendor._id) return;
            form.updateHeader({
              customer_id: vendor._id,
              customer_name: vendor.vendor_name,
            });
            modals.closeCustomerModal();
            setTimeout(() => modals.openUserModal(), 100);
            message.success(`Vendor "${vendor.vendor_name}" selected successfully!`);
          }}
          onCancel={modals.closeCustomerModal}
        />
      )}

      <UserSelectionModal
        visible={modals.userModalVisible}
        onSelect={user => {
          if (form.billFormData.billed_by_id === user._id) return;
          form.updateHeader({
            billed_by_id: user._id,
            billed_by_name: user.name,
          });
          modals.closeUserModal();
          message.success(`User "${user.name}" selected as billed by successfully!`);
        }}
        onCancel={modals.closeUserModal}
      />

      <BillSaveConfirmationModal
        visible={modals.saveConfirmationVisible}
        onNewBill={() => {
          form.resetForm();
          modals.closeSaveConfirmation();
          actions.setSavedBillData(null);
          message.success('New bill form cleared successfully!');
        }}
        onContinueBill={() => {
          modals.closeSaveConfirmation();
          actions.setSavedBillData(null);
        }}
        onCancel={modals.closeSaveConfirmation}
        savedBillData={actions.savedBillData}
        onOpenProductModal={() => {
          // Open product selection modal for the first row (index 0)
          modals.openProductSelectionModal(0);
        }}
      />

      <ProductDetailsModal
        visible={modals.productDetailsModalVisible}
        onCancel={modals.closeProductDetailsModal}
        productId={modals.selectedProductId}
      />

      <ProductSelectionModal
        visible={modals.productSelectionModalVisible}
        onSelect={product => {
          if (modals.productSelectionRowIndex === null) return;
          
          const newItems = [...form.billFormData.items];
          // Store ALL product data (including tax %, HSN code) for calculations
          newItems[modals.productSelectionRowIndex].product_id = product._id || '';
          newItems[modals.productSelectionRowIndex].product_name = product.name || '';
          newItems[modals.productSelectionRowIndex].variant_name =
            product.VariantItem?.variant_name || '';
          newItems[modals.productSelectionRowIndex].price = product.selling_price || 0;
          newItems[modals.productSelectionRowIndex].tax_percentage = product.CategoryItem?.tax_percentage || 0;
          newItems[modals.productSelectionRowIndex].category_name = product.CategoryItem?.category_name || '';
          newItems[modals.productSelectionRowIndex].hsn_code = product.hsn_code || product.VariantItem?.hsn_code || '';
          newItems[modals.productSelectionRowIndex].hsn_sac = product.hsn_sac || '';
          
          billing.handleItemsChange(newItems);
          modals.closeProductSelectionModal();
          modals.openStockModal(modals.productSelectionRowIndex);
          message.success(`Product "${product.name}" selected successfully!`);
        }}
        onCancel={modals.closeProductSelectionModal}
      />

      <BillListDrawer
        visible={modals.billListDrawerVisible}
        onClose={modals.closeBillListDrawer}
        onViewBill={bill => {
          // Load bill for editing
          form.loadBillData(bill, () => {
            // Recalculate items after loading to populate stock data
            if (form.billFormData.items.length > 0) {
              billing.handleItemsChange(form.billFormData.items);
            }
          });
          billData.refetchAllData();
          modals.closeBillListDrawer();
          message.success(`Bill "${bill.invoice_no}" loaded successfully!`);
        }}
        onNewBill={() => {
          form.resetForm();
          modals.closeBillListDrawer();
          message.success('New bill form cleared successfully!');
        }}
      />
    </div>
  );
};

export default BillDataGrid;

