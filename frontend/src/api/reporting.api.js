import axiosClient from './axiosClient';

export const getReportSummary = (filters) =>
  axiosClient.get('/reporting/summary', { params: filters }).then((res) => res.data);

export const getReportList = (filters) =>
  axiosClient.get('/reporting/list', { params: filters }).then((res) => res.data);

export const getExportCSVUrl = () =>
  `${axiosClient.defaults.baseURL}/reporting/export/csv`;

export const getExportPDFUrl = () =>
  `${axiosClient.defaults.baseURL}/reporting/export/pdf`;