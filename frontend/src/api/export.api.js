import axiosClient from './axiosClient';

const downloadBlob = async (url, filename) => {
  const res = await axiosClient.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const downloadCSVReport = () => downloadBlob('/reporting/export/csv', 'dealflow360-report.csv');
export const downloadPDFReport = () => downloadBlob('/reporting/export/pdf', 'dealflow360-report.pdf');