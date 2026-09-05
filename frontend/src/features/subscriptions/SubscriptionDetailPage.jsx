import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSubscriptionById,
  modifySubscriptionQty,
  cancelSubscription,
} from '../../api/subscription.api';

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [newQty, setNewQty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    getSubscriptionById(id).then((res) => {
      setData(res.data);
      setNewQty(res.data.subscription.qty);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleModify = async () => {
    setError('');
    setMessage('');
    try {
      const res = await modifySubscriptionQty(id, Number(newQty));
      setMessage(
        `Quantity updated. Proration adjustment: $${res.data.prorationAdjustment} (${
          res.data.prorationAdjustment > 0 ? 'extra charge' : 'credit issued'
        })`
      );
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to modify subscription');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this subscription?')) return;
    setError('');
    try {
      const res = await cancelSubscription(id);
      setMessage(`Subscription cancelled. Refund issued: $${res.data.refund}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  if (loading) return <p>Loading billing detail...</p>;
  if (!data) return <p>Not found.</p>;

  const { subscription, billingSchedule } = data;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">
        Billing Detail: {subscription.customer?.name} - {subscription.productName}
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Cycle: {subscription.cycle} | Status: {subscription.status}
      </p>

      {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{message}</div>}

      {/* Recurring lines */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-semibold mb-2">Recurring Lines</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Plan</th>
              <th className="p-2">Cycle</th>
              <th className="p-2">Next Bill Date</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{subscription.productName}</td>
              <td className="p-2 capitalize">{subscription.cycle}</td>
              <td className="p-2">{new Date(subscription.nextBillDate).toLocaleDateString()}</td>
              <td className="p-2">${(subscription.qty * subscription.unitPrice).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Billing schedule history */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-semibold mb-2">Billing Schedule</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Cycle Start</th>
              <th className="p-2">Cycle End</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Note</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {billingSchedule.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-2">{new Date(b.cycleStartDate).toLocaleDateString()}</td>
                <td className="p-2">{new Date(b.cycleEndDate).toLocaleDateString()}</td>
                <td className="p-2">${b.amount.toFixed(2)}</td>
                <td className="p-2 text-xs text-gray-500">{b.prorationNote}</td>
                <td className="p-2">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {subscription.status === 'active' && (
        <div className="bg-white p-4 rounded shadow flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">New Quantity</label>
            <input
              type="number"
              min="1"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="border rounded px-3 py-2 w-24"
            />
          </div>
          <button
            onClick={handleModify}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Modify Subscription
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
}