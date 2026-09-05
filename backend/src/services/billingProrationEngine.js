const CYCLE_DAYS = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

/**
 * Calculates a prorated adjustment when a subscription's qty (or price) changes
 * partway through the current billing cycle.
 * Returns a positive number (extra charge) or negative number (credit owed).
 */
export const calculateProration = ({ cycle, cycleStartDate, oldAmount, newAmount, today = new Date() }) => {
  const cycleDays = CYCLE_DAYS[cycle] || 30;

  const daysElapsed = Math.max(
    0,
    Math.floor((today - new Date(cycleStartDate)) / (1000 * 60 * 60 * 24))
  );
  const daysRemaining = Math.max(0, cycleDays - daysElapsed);

  const oldDailyRate = oldAmount / cycleDays;
  const newDailyRate = newAmount / cycleDays;

  const adjustment = (newDailyRate - oldDailyRate) * daysRemaining;

  return {
    daysElapsed,
    daysRemaining,
    adjustment: Number(adjustment.toFixed(2)),
  };
};

/** On cancellation, calculates refund based on the plan's cancellation rule */
export const calculateCancellationRefund = ({ cycle, cycleStartDate, amount, cancellationRule, today = new Date() }) => {
  if (cancellationRule === 'immediate_no_refund') {
    return 0;
  }

  const cycleDays = CYCLE_DAYS[cycle] || 30;
  const daysElapsed = Math.max(
    0,
    Math.floor((today - new Date(cycleStartDate)) / (1000 * 60 * 60 * 24))
  );
  const daysRemaining = Math.max(0, cycleDays - daysElapsed);
  const dailyRate = amount / cycleDays;

  if (cancellationRule === 'end_of_cycle') {
    return 0; // they keep access till cycle end, no refund, cancellation just stops renewal
  }

  // immediate_partial_refund
  return Number((dailyRate * daysRemaining).toFixed(2));
};