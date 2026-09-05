import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations } from '../../api/quotation.api';
import { getFlags } from '../../api/dealHealth.api';
import useAuthStore from '../../app/authStore';

export default function DashboardPage() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [openQuotations, setOpenQuotations] = useState([]);
  const [atRiskDeals, setAtRiskDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const load = async () => {
      const allQuotations = await getQuotations();
      setPendingApprovals(allQuotations.data.filter((q) => q.status === 'pending_approval'));
      setOpenQuotations(
        allQuotations.data.filter((q) => !['confirmed', 'rejected'].includes(q.status))
      );

      if (['sales_manager', 'finance', 'admin'].includes(user?.role)) {
        const flagsRes = await getFlags();
        setAtRiskDeals(flagsRes.data);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sales Dashboard / Home</h1>
      <p className="text-gray-500 mb-6">Central hub, links and access to every module below.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => navigate('/approvals')}
          className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
        >
          <p className="text-sm text-gray-500">Pending Approvals</p>
          <p className="text-2xl font-bold">{pendingApprovals.length}</p>
          <p className="text-xs text-gray-400 mt-1">quotations waiting</p>
        </div>
        <div
          onClick={() => navigate('/quotations')}
          className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
        >
          <p className="text-sm text-gray-500">Open Quotations</p>
          <p className="text-2xl font-bold">{openQuotations.length}</p>
          <p className="text-xs text-gray-400 mt-1">active deals</p>
        </div>
        <div
          onClick={() => navigate('/deal-health')}
          className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
        >
          <p className="text-sm text-gray-500">At-Risk Deals</p>
          <p className="text-2xl font-bold">{atRiskDeals.length}</p>
          <p className="text-xs text-gray-400 mt-1">flagged by Deal Health</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Recent Activity</h3>
        {openQuotations.slice(0, 5).map((q) => (
          <div
            key={q._id}
            onClick={() => navigate(`/quotations/${q._id}`)}
            className="text-sm border-b py-2 last:border-0 cursor-pointer hover:bg-gray-50"
          >
            {q.customer?.name} — <span className="capitalize">{q.status.replace('_', ' ')}</span> — $
            {q.orderTotal?.toFixed(2)}
          </div>
        ))}
        {openQuotations.length === 0 && <p className="text-sm text-gray-400">No recent activity.</p>}
      </div>
    </div>
  );
}