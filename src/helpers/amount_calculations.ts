/**
 * Centralized bill calculation utility
 * @param items - array of bill items
 * @param productList - product list (for tax/category lookup)
 * @param isGstIncluded - whether GST is included in price
 * @param discount - discount value
 * @param discountType - 'percentage' or 'amount'
 * @returns { totalAmount, totalGST, cgst, sgst, valueOfGoods, subtotal, itemsWithTax }
 */
export function calculateBillTotals({
  items,
  productList,
  isGstIncluded,
  discount,
  discountType,
}: {
  items: any[];
  productList: any[];
  isGstIncluded: boolean;
  discount: number;
  discountType: "percentage" | "amount";
}) {
  // Calculate item base amounts
  const itemsWithTax = items.map((item) => {
    const product = productList?.find((p: any) => p._id === item.product_id);
    // Use item's tax_percentage if available, otherwise get from product category, or default to 18%
    let taxPercentage = item.tax_percentage || product?.CategoryItem?.tax_percentage || 18;
    
    // If still no tax percentage, use a default based on common GST rates
    if (!taxPercentage || taxPercentage === 0) {
      // Default to 18% GST for most goods
      taxPercentage = 18;
    }
    

    // Calculate base amount (before GST)
    const baseAmount =
      Number(item.qty || 0) * Number(item.price || 0) +
      Number(item.loose_qty || 0) *
        (Number(item.price || 0) / (product?.VariantItem?.pack_size || 1) || 0);
    
    // Calculate amount (with GST if applicable)
    let amount = baseAmount;
    if (!isGstIncluded && taxPercentage > 0) {
      amount = baseAmount + (baseAmount * taxPercentage / 100);
    }
    return {
      ...item,
      tax_percentage: taxPercentage,
      baseAmount,
      amount,
    };
  });

  // sub_total: sum of all item.amount values (table total before discount/GST)
  const sub_total = itemsWithTax.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  // base_sub_total: sum of all item base amounts (before GST and discount)
  const base_sub_total = itemsWithTax.reduce(
    (sum, item) => sum + Number(item.baseAmount),
    0
  );

  // Discount
  let discountValue = 0;
  if (discount > 0) {
    if (discountType === "percentage") {
      discountValue = base_sub_total * (discount / 100);
    } else {
      discountValue = discount;
    }
  }

  // Discounted value of goods
  const discounted_value_of_goods = base_sub_total - discountValue;

  let total_gst = 0;
  let value_of_goods = 0;
  let total_amount = 0;
  // Calculate GST and totals for each item
  itemsWithTax.forEach(item => {
    let discountedBase = item.baseAmount;
    if (discount > 0) {
      if (discountType === "percentage") {
        discountedBase = item.baseAmount - (item.baseAmount * (discount / 100));
      } else {
        discountedBase = item.baseAmount - ((discount/base_sub_total)*item.baseAmount);
      }
    }
    
    let gstAmount = 0;
    if (!isGstIncluded) {
      // GST Excluded: GST is added on top
      if (item.tax_percentage > 0) {
        gstAmount = discountedBase * (item.tax_percentage / 100);
        value_of_goods += discountedBase;
        total_gst += gstAmount;
        total_amount += discountedBase + gstAmount;
      } else {
        // No tax
        value_of_goods += discountedBase;
        total_amount += discountedBase;
      }
    } else {
      // GST Included: GST is part of the price, extract it
      if (item.tax_percentage > 0) {
        gstAmount = discountedBase * (item.tax_percentage / (100 + item.tax_percentage));
        value_of_goods += discountedBase - gstAmount;
        total_gst += gstAmount;
        total_amount += discountedBase;
      } else {
        // No tax
        value_of_goods += discountedBase;
        total_amount += discountedBase;
      }
    }
  });

  // Calculate CGST and SGST (each is total_gst / 2)
  const cgst = total_gst / 2;
  const sgst = total_gst / 2;

  return {
    sub_total,
    value_of_goods,
    total_gst,
    cgst,
    sgst,
    total_amount,
    discountValue,
  };
}
