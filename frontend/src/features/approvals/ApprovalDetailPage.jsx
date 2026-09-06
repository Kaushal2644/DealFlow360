import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApprovalDetail, actOnApproval } from '../../api/approval.api';
import useAuthStore from '../../app/authStore';
import { adminApproveQuotation } from '../../api/approval.api';

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [quotation, setQuotation] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getApprovalDetail(id).then((res) => {
      setQuotation(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAction = async (action) => {
    setError('');
    try {
      await actOnApproval(id, action, reason);
      alert(`Quotation ${action}`);
      navigate('/approvals');
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const handleAdminOverride = async () => {
  if (!confirm('Approve this quotation directly, bypassing the normal approval chain?')) return;
  setError('');
  try {
    await adminApproveQuotation(id, reason || 'Admin override approval');
    alert('Quotation approved by admin override');
    navigate('/approvals');
  } catch (err) {
    setError(err.response?.data?.message || 'Override failed');
  }
};

  if (loading) return <p>Loading approval detail...</p>;
  if (!quotation) return <p>Not found.</p>;

  const currentStep = quotation.approvalSteps[quotation.currentApprovalStepIndex];
  const canAct = currentStep && (currentStep.role === user?.role || user?.role === 'admin');

  {user?.role === 'admin' && (
  <div className="bg-purple-50 border border-purple-200 p-4 rounded mt-4">
    <p className="text-sm font-semibold text-purple-800 mb-2">Admin Override</p>
    <p className="text-xs text-gray-600 mb-3">
      Approve this quotation directly, regardless of the current approval step or role
      requirement. This bypasses the normal chain and is logged in the audit trail.
    </p>
    <button
      onClick={handleAdminOverride}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Admin Approve
    </button>
  </div>
)}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded shadow mb-4">
          <h1 className="text-xl font-bold mb-1">
            Approval: {quotation.customer?.name} ({quotation.customer?.tier})
          </h1>
          <p className="text-sm text-gray-500">Rep: {quotation.rep?.name}</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded mb-4">
          <p className="font-semibold">Why This Quote Was Flagged</p>
          <p className="text-sm text-gray-700 mt-1">
            Blended Risk Score: <strong>{quotation.blendedRiskScore}</strong> → Band:{' '}
            <strong>{quotation.riskBand}</strong>
          </p>
        </div>

        <div className="bg-white rounded shadow overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Discount</th>
                <th className="text-left p-2">Limit</th>
                <th className="text-left p-2">Over By</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lines.map((line) => (
                <tr key={line._id} className="border-t">
                  <td className="p-2">{line.productName}</td>
                  <td className="p-2">{line.discountPercent}%</td>
                  <td className="p-2">{line.effectiveLimit}%</td>
                  <td className="p-2">
                    {line.overBy > 0 ? (
                      <span className="text-red-600 font-semibold">{line.overBy} pts</span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Approval step tracker */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-semibold mb-3">Approval Steps</h3>
          <div className="flex gap-4">
            {quotation.approvalSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    step.status === 'approved'
                      ? 'bg-green-500'
                      : idx === quotation.currentApprovalStepIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm capitalize">
                  {step.role} ({step.status})
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        {canAct ? (
          <div className="bg-white p-4 rounded shadow">
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleAction('approved')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction('returned_for_revision')}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Return for Revision
              </button>
              <button
                onClick={() => handleAction('rejected')}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            This step requires role: <strong>{currentStep?.role}</strong>. You're logged in as{' '}
            {user?.role}.
          </p>
        )}
      </div>

      {/* Audit trail sidebar */}
      <div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Audit Trail</h3>
          {quotation.approvalSteps.map((step, idx) => (
            <div key={idx} className="text-sm border-b py-2 last:border-0">
              <p className="capitalize font-medium">{step.role}</p>
              <p className="text-gray-500">{step.status}</p>
              {step.actedAt && (
                <p className="text-xs text-gray-400">{new Date(step.actedAt).toLocaleString()}</p>
              )}
              {step.reason && <p className="text-xs italic mt-1">"{step.reason}"</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}