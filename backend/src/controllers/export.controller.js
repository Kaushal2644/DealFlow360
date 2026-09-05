import Quotation from '../models/Quotation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import PDFDocument from 'pdfkit';

export const exportReportCSV = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find()
    .populate('customer', 'name tier')
    .populate('rep', 'name');

  const header = 'Customer,Tier,Rep,Status,OrderTotal,RiskBand,CreatedAt\n';
  const rows = quotations
    .map((q) =>
      [
        q.customer?.name || '',
        q.customer?.tier || '',
        q.rep?.name || '',
        q.status,
        q.orderTotal,
        q.riskBand,
        q.createdAt.toISOString(),
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=dealflow360-report.csv');
  res.send(header + rows);
});

export const exportReportPDF = asyncHandler(async (req, res) => {
  const quotations = await Quotation.find()
    .populate('customer', 'name tier')
    .populate('rep', 'name');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=dealflow360-report.pdf');

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(18).text('DealFlow360 - Sales Report', { align: 'center' });
  doc.moveDown();

  quotations.forEach((q) => {
    doc
      .fontSize(10)
      .text(
        `${q.customer?.name || 'Unknown'} (${q.customer?.tier}) | Rep: ${q.rep?.name} | Status: ${q.status} | Total: $${q.orderTotal} | Risk: ${q.riskBand}`
      );
  });

  doc.end();
});