import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingApprovals } from '../../api/approval.api';

export default function ApprovalsListPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPendingApprovals().then((res) => {
      setApprovals(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading approvals...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Approvals</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Rep</th>
              <th className="text-left p-3">Risk Band</th>
              <th className="text-left p-3">Risk Score</th>
              <th className="text-left p-3">Order Total</th>
              <th className="text-left p-3">Current Step</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((q) => {
              const currentStep = q.approvalSteps[q.currentApprovalStepIndex];
              return (
                <tr
                  key={q._id}
                  onClick={() => navigate(`/approvals/${q._id}`)}
                  className="border-t cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3">{q.customer?.name} ({q.customer?.tier})</td>
                  <td className="p-3">{q.rep?.name}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                      {q.riskBand}
                    </span>
                  </td>
                  <td className="p-3">{q.blendedRiskScore}</td>
                  <td className="p-3">${q.orderTotal?.toFixed(2)}</td>
                  <td className="p-3 capitalize">{currentStep?.role || '-'}</td>
                </tr>
              );
            })}
            {approvals.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No pending approvals.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}