import React, { memo } from "react";

interface RefundsProps {
  // Define any props here if needed
}

const Refunds: React.FC<RefundsProps> = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Refunds</h1>
      <p>
        Once the refund request is approved. The refunded amount will be
        processed and credited within 10 to 15 working days to the original
        mode of payment
      </p>
    </div>
  );
};

export default memo(Refunds);
