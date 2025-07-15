import React, { memo } from "react";

interface ReturnAndRefundPolicyProps {
  // Define any props here if needed
}

const ReturnAndRefundPolicy: React.FC<ReturnAndRefundPolicyProps> = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Refund Policy</h1>
      <p>
        Once the refund request is approved. The refunded amount will be
        processed and credited within 10 to 15 working days to the original
        mode of payment.
      </p>
    </div>
  );
};

export default memo(ReturnAndRefundPolicy);
