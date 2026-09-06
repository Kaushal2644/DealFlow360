import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingApprovals, adminApproveQuotation } from '../../api/approval.api';
import { getQuotations } from '../../api/quotation.api';
import useAuthStore from '../../app/authStore';

const statusColors = {
  draft: 'bg-gray-200 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  negotiation: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ApprovalsListPage() {
  const [approvals, setApprovals] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';

  const load = () => {
    setLoading(true);
    const request = showAll && isAdmin ? getQuotations() : getPendingApprovals();
    request.then((res) => {
      setApprovals(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [showAll]);

  const handleQuickOverride = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Approve this quotation directly via admin override?')) return;
    await adminApproveQuotation(id, 'Admin override approval');
    load();
  };

  if (loading) return <p>Loading approvals...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Approvals</h1>
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show all quotations (admin)
          </label>
        )}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Rep</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Risk Band</th>
              <th className="text-left p-3">Order Total</th>
              <th className="text-left p-3">Current Step</th>
              {isAdmin && <th className="text-left p-3">Admin Action</th>}
            </tr>
          </thead>
          <tbody>
            {approvals.map((q) => {
              const currentStep = q.approvalSteps?.[q.currentApprovalStepIndex];
              const isOverridable = !['confirmed', 'rejected'].includes(q.status);

              return (
                <tr
                  key={q._id}
                  onClick={() => navigate(`/approvals/${q._id}`)}
                  className="border-t cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3">{q.customer?.name} ({q.customer?.tier})</td>
                  <td className="p-3">{q.rep?.name}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[q.status]}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3">{q.riskBand}</td>
                  <td className="p-3">${q.orderTotal?.toFixed(2)}</td>
                  <td className="p-3 capitalize">{currentStep?.role || '-'}</td>
                  {isAdmin && (
                    <td className="p-3">
                      {isOverridable && (
                        <button
                          onClick={(e) => handleQuickOverride(e, q._id)}
                          className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                        >
                          Admin Approve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
            {approvals.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="p-4 text-center text-gray-400">
                  No quotations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}