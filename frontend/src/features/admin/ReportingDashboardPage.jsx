import { useEffect, useState } from 'react';
import { getReportSummary, getReportList } from '../../api/reporting.api';
import { downloadCSVReport, downloadPDFReport } from '../../api/export.api';

export default function ReportingDashboardPage() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '' });
  const [summary, setSummary] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const [sRes, lRes] = await Promise.all([
      getReportSummary(activeFilters),
      getReportList(activeFilters),
    ]);
    setSummary(sRes.data);
    setList(lRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin / Reporting Dashboard</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4 flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Approval Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="border rounded px-3 py-2">
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Apply Filters
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={downloadCSVReport} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Export XLS
          </button>
          <button onClick={downloadPDFReport} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading report...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Quotes Created</p>
              <p className="text-2xl font-bold">{summary.quotationsCreated}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Avg Approval Time</p>
              <p className="text-2xl font-bold">{summary.avgApprovalHours}h</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Top Discounted Product</p>
              <p className="text-2xl font-bold">{summary.topDiscountedProduct || '-'}</p>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Rep / Team</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Risk Band</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {list.map((q) => (
                  <tr key={q._id} className="border-t">
                    <td className="p-3">{q.customer?.name} ({q.customer?.tier})</td>
                    <td className="p-3">{q.rep?.name} {q.rep?.team ? `/ ${q.rep.team}` : ''}</td>
                    <td className="p-3 capitalize">{q.status.replace('_', ' ')}</td>
                    <td className="p-3">${q.orderTotal?.toFixed(2)}</td>
                    <td className="p-3">{q.riskBand}</td>
                    <td className="p-3">{new Date(q.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">No results.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}