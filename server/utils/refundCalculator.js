export const getRefundPercentage = (hoursBeforePickup) => {
  if (hoursBeforePickup >= 24) return 1.0;   // 100%
  if (hoursBeforePickup >= 12) return 0.75;  // 75%
  if (hoursBeforePickup >= 6) return 0.5;    // 50%
  return 0;                                 // No refund
};
