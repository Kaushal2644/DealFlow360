import { RISK_BANDS, QUOTATION_STATUS } from '../config/constants.js';

/**
 * Builds the approvalSteps array based on the risk band,
 * and returns the status the quotation should move to.
 */
export const buildApprovalChain = (riskBand) => {
  let approvalSteps = [];
  let status = QUOTATION_STATUS.APPROVED; // default: no approval needed

  if (riskBand === RISK_BANDS.SALES_MANAGER) {
    approvalSteps = [{ role: 'sales_manager', status: 'pending' }];
    status = QUOTATION_STATUS.PENDING_APPROVAL;
  } else if (riskBand === RISK_BANDS.SALES_MANAGER_FINANCE) {
    approvalSteps = [
      { role: 'sales_manager', status: 'pending' },
      { role: 'finance', status: 'pending' },
    ];
    status = QUOTATION_STATUS.PENDING_APPROVAL;
  }

  return { approvalSteps, status };
};