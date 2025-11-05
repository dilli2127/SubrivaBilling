import { useCallback } from 'react';
import { message } from 'antd';
import { BillItem } from '../../../types/entities';

interface UseBillItemsProps {
  productOptions: Array<{ label: string; value: string }>;
  branchId: string | undefined;
  branchStockListResult: any[];
  stockAuditListResult: any[];
  productListResult: any[];
  billSettings: {
    isGstIncluded: boolean;
  };
}

export const useBillItems = ({
  productOptions,
  branchId,
  branchStockListResult,
  stockAuditListResult,
  productListResult,
  billSettings,
}: UseBillItemsProps) => {
  // Calculate item amounts with proper price and tax
  const calculateItemAmounts = useCallback(
    (items: BillItem[]) => {
      return items.map(item => {
        if (!item.product_id || !item.stock_id) return item;

        // First try to use saved stockData (for new bills where stock list isn't loaded)
        const savedStockData = (item as any).stockData;
        
        // If no saved stockData, try to find from stockListData (for editing existing bills)
        const stockListData = branchId ? branchStockListResult : stockAuditListResult;
        const stockFromList = stockListData.find((s: any) => s._id === item.stock_id);
        
        // Use saved stock data if available, otherwise use stock from list
        const stock = savedStockData || stockFromList;

        if (stock) {
          const sellPrice = stock.sell_price || 0;
          
          // Get pack size from stock data
          const packSize = stock?.ProductItem?.VariantItem?.pack_size || stock?.pack_size;
          const packSizeNum = packSize ? parseInt(packSize) : 1;

          // Calculate loose item rate: sell_price / pack_size (since sell_price is per pack)
          const looseRate = sellPrice / packSizeNum;

          const baseAmount = (item.qty || 0) * sellPrice + (item.loose_qty || 0) * looseRate;

          // Get product for tax calculation
          const product = productListResult.find((p: any) => p._id === item.product_id);
          const taxPercentage = product?.CategoryItem?.tax_percentage || 0;

          let amount = baseAmount;
          if (!billSettings.isGstIncluded) {
            amount = baseAmount + (baseAmount * taxPercentage) / 100;
          }

          return {
            ...item,
            price: item.price || sellPrice,
            mrp: stock.mrp || sellPrice,
            amount: amount,
            tax_percentage: taxPercentage,
            product_name: product?.name || item.product_name || '',
            variant_name: product?.VariantItem?.variant_name || item.variant_name || '',
            batch_no: stock.batch_no || item.batch_no || '',
            stockData: stock, // Attach stock data for UI display
          };
        }

        return item;
      });
    },
    [branchId, branchStockListResult, stockAuditListResult, productListResult, billSettings]
  );

  // Validate stock quantities
  const validateStockQuantities = useCallback(
    (items: BillItem[]) => {
      return items.map(item => {
        const billItem: BillItem = {
          product_id: item.product_id || '',
          product_name:
            productOptions.find(
              (opt: { label: string; value: string }) => opt.value === item.product_id
            )?.label || '',
          variant_name: item.variant_name || '',
          stock_id: item.stock_id || '',
          batch_no: item.batch_no || '',
          qty: item.qty || 0,
          loose_qty: item.loose_qty || 0,
          price: item.price || 0,
          mrp: item.mrp || 0,
          amount: item.amount || 0,
          tax_percentage: item.tax_percentage || 0,
          stockData: (item as any).stockData,
        };

        // Stock validation for pack and loose quantities
        if (item.stock_id && (item.qty || item.loose_qty)) {
          const stockListData = branchId ? branchStockListResult : stockAuditListResult;
          const stock = stockListData.find((s: any) => s._id === item.stock_id);

          if (stock) {
            // Get pack size from stock data
            const packSize = stock?.ProductItem?.VariantItem?.pack_size;
            const packSizeNum = packSize ? parseInt(packSize) : 1;

            // Available pack quantity and actual loose quantity
            const availablePackQty = stock.available_quantity || 0;
            const availableLooseQty = stock.available_loose_quantity || 0;

            // Validate pack quantity (QTY field)
            if (item.qty && item.qty > availablePackQty) {
              message.error(
                `Pack quantity (${item.qty}) exceeds available packs (${availablePackQty})`
              );
              billItem.qty = availablePackQty;
            }

            // Calculate max loose quantity based on remaining packs after QTY selection
            const remainingPacks = availablePackQty - (item.qty || 0);
            const maxLooseFromRemainingPacks = remainingPacks * packSizeNum;
            const maxLooseQty = maxLooseFromRemainingPacks + availableLooseQty;

            // Validate loose quantity (LOOSE QTY field)
            if (item.loose_qty && item.loose_qty > maxLooseQty) {
              message.error(
                `Loose quantity (${item.loose_qty}) exceeds available loose items (${maxLooseQty} = ${remainingPacks} remaining packs × ${packSizeNum} + ${availableLooseQty} loose)`
              );
              billItem.loose_qty = maxLooseQty;
            }
          }
        }

        return billItem;
      });
    },
    [productOptions, branchId, branchStockListResult, stockAuditListResult]
  );

  const handleItemsChange = useCallback(
    (items: any[]): BillItem[] => {
      // First validate stock quantities
      const validatedItems = validateStockQuantities(items);

      // Then calculate amounts
      const itemsWithAmounts = calculateItemAmounts(validatedItems);

      return itemsWithAmounts;
    },
    [validateStockQuantities, calculateItemAmounts]
  );

  return {
    handleItemsChange,
    calculateItemAmounts,
    validateStockQuantities,
  };
};

