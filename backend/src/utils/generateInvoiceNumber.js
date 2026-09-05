export const generateInvoiceNumber = (quotationId) => {
  const shortId = quotationId.toString().slice(-6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `INV-${shortId}-${timestamp}`;
};