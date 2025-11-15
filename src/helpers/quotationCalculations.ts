import { QuotationLineItem } from '../types/quotation';

type Numeric = number | string | null | undefined;

export interface LineItemTotals {
  line_total: number;
  item_subtotal: number;
  item_discount_amount: number;
  item_tax_amount: number;
  item_value_of_goods: number;
}

export interface AggregateTotals {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  value_of_goods: number;
  total_amount: number;
}

const toNumber = (value: Numeric, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const roundToTwo = (value: number): number =>
  Number((Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2));

/**
 * Calculates all monetary fields for a single line item respecting GST inclusion state
 */
export const calculateLineItemTotals = (
  item: Partial<QuotationLineItem>,
  gstIncluded: boolean = true
): LineItemTotals => {
  const quantity = toNumber(item.quantity);
  const unitPrice = toNumber(item.unit_price);
  const taxPercentage = toNumber(item.tax_percentage);
  const discountValue = toNumber(item.discount);
  const discountType = item.discount_type === 'amount' ? 'amount' : 'percentage';

  const baseAmount = quantity * unitPrice;

  let discountAmount =
    discountType === 'percentage'
      ? (baseAmount * discountValue) / 100
      : discountValue;

  discountAmount = Math.min(Math.max(discountAmount, 0), baseAmount);

  const subtotal = Math.max(baseAmount - discountAmount, 0);

  let taxAmount = 0;
  let lineTotal = subtotal;
  let valueOfGoods = subtotal;

  if (taxPercentage > 0) {
    if (gstIncluded) {
      taxAmount = subtotal * (taxPercentage / (100 + taxPercentage));
      valueOfGoods = subtotal - taxAmount;
      lineTotal = subtotal;
    } else {
      taxAmount = subtotal * (taxPercentage / 100);
      lineTotal = subtotal + taxAmount;
      valueOfGoods = subtotal;
    }
  } else {
    valueOfGoods = subtotal;
  }

  return {
    line_total: roundToTwo(lineTotal),
    item_subtotal: roundToTwo(subtotal),
    item_discount_amount: roundToTwo(discountAmount),
    item_tax_amount: roundToTwo(taxAmount),
    item_value_of_goods: roundToTwo(valueOfGoods),
  };
};

/**
 * Normalizes line items (numbers + derived amounts)
 */
export const normalizeLineItems = (
  items: Partial<QuotationLineItem>[] = [],
  gstIncluded: boolean = true
) =>
  items.map(item => {
    const normalizedItem: Partial<QuotationLineItem> = {
      ...item,
      quantity: toNumber(item.quantity),
      unit_price: toNumber(item.unit_price),
      tax_percentage: toNumber(item.tax_percentage),
      discount: toNumber(item.discount),
      discount_type: item.discount_type === 'amount' ? 'amount' : 'percentage',
    };

    const totals = calculateLineItemTotals(normalizedItem, gstIncluded);

    return {
      ...normalizedItem,
      // Explicitly preserve stock_audit_id
      stock_audit_id: item.stock_audit_id || normalizedItem.stock_audit_id || undefined,
      // Add calculated totals
      ...totals,
    };
  });

/**
 * Aggregates totals for the entire quotation
 */
export const calculateAggregateTotals = (
  items: Partial<QuotationLineItem>[] = [],
  gstIncluded: boolean = true
): AggregateTotals => {
  const totals = items.reduce(
    (acc, item) => {
      const itemTotals = calculateLineItemTotals(item, gstIncluded);
      // Subtotal = sum of line totals (what customer pays per line) for better UX
      acc.subtotal += itemTotals.line_total;
      acc.tax_amount += itemTotals.item_tax_amount;
      acc.discount_amount += itemTotals.item_discount_amount;
      acc.value_of_goods += itemTotals.item_value_of_goods;
      acc.total_amount += itemTotals.line_total;
      return acc;
    },
    {
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      value_of_goods: 0,
      total_amount: 0,
    } as AggregateTotals
  );

  return {
    subtotal: roundToTwo(totals.subtotal),
    tax_amount: roundToTwo(totals.tax_amount),
    discount_amount: roundToTwo(totals.discount_amount),
    value_of_goods: roundToTwo(totals.value_of_goods),
    total_amount: roundToTwo(totals.total_amount),
  };
};


