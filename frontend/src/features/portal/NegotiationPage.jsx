import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getMyQuotationById,
  submitNegotiationRequest,
  confirmQuotationByCustomer,
} from '../../api/portal.api';

export default function NegotiationPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState('');
  const [selectedLineId, setSelectedLineId] = useState('');
  const [counterDiscount, setCounterDiscount] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getMyQuotationById(id).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await submitNegotiationRequest(id, {
        lineId: selectedLineId || null,
        comment,
        counterDiscountPercent: counterDiscount ? Number(counterDiscount) : null,
      });
      setMessage('Request submitted. Awaiting rep response.');
      setComment('');
      setCounterDiscount('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleConfirm = async () => {
    setError('');
    setMessage('');
    try {
      const payload =
        selectedLineId && counterDiscount
          ? { lineId: selectedLineId, finalDiscountPercent: Number(counterDiscount) }
          : {};
      const res = await confirmQuotationByCustomer(id, payload);
      setMessage(
        res.data.reRoutedToApproval
          ? 'Terms exceeded threshold — automatically sent back for internal approval.'
          : 'Quotation confirmed! Moving to fulfillment.'
      );
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Not found.</p>;

  const { quotation, messages } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded shadow mb-4">
          <h1 className="text-xl font-bold mb-1">Quotation Status: {quotation.status}</h1>
          <p className="text-sm text-gray-500">Total: ${quotation.orderTotal?.toFixed(2)}</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{message}</div>}

        <div className="bg-white rounded shadow overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Qty</th>
                <th className="text-left p-2">Discount</th>
                <th className="text-left p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lines.map((line) => (
                <tr key={line._id} className="border-t">
                  <td className="p-2">{line.productName}</td>
                  <td className="p-2">{line.qty}</td>
                  <td className="p-2">{line.discountPercent}%</td>
                  <td className="p-2">${line.lineTotal?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmitRequest} className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-semibold mb-3">Line Comment / Counter Discount</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Line (optional)</label>
              <select
                value={selectedLineId}
                onChange={(e) => setSelectedLineId(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">General comment</option>
                {quotation.lines.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.productName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Counter Discount %</label>
              <input
                type="number"
                value={counterDiscount}
                onChange={(e) => setCounterDiscount(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Your message..."
            className="w-full border rounded px-3 py-2 mb-3"
            rows={2}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Submit Request
          </button>
        </form>

        <button
          onClick={handleConfirm}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Confirm Quotation
        </button>
      </div>

      <div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Conversation</h3>
          {messages.map((m) => (
            <div key={m._id} className="text-sm border-b py-2 last:border-0">
              <p className="font-medium capitalize">{m.author}</p>
              {m.comment && <p className="text-gray-600">{m.comment}</p>}
              {m.counterDiscountPercent !== null && (
                <p className="text-orange-600 text-xs">Proposed: {m.counterDiscountPercent}%</p>
              )}
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-gray-400">No messages yet.</p>}
        </div>
      </div>
    </div>
  );
}