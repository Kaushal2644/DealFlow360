import cron from 'node-cron';
import { runFullDealHealthScan } from '../services/dealHealthScanner.js';

export const scheduleDealHealthScan = () => {
  // Runs every day at 6 AM server time
  cron.schedule('0 6 * * *', async () => {
    console.log('Running scheduled deal health scan...');
    await runFullDealHealthScan();
    console.log('Deal health scan complete.');
  });
};