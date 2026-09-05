import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getInvoiceById,
  recordPayment,
  getPaymentsForInvoice,
  updateInvoiceStage,
} from '../../api/invoice.api';

const stages = ['order_confirmed', 'shipped', 'invoiced', 'paid'];

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getInvoiceById(id), getPaymentsForInvoice(id)]).then(([invRes, payRes]) => {
      setInvoice(invRes.data);
      setPayments(payRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await recordPayment(id, Number(amount), method);
      setMessage(`Payment recorded. Total paid: $${res.data.totalPaid}. Invoice status: ${res.data.invoice.status}`);
      setAmount('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleStageChange = async (stage) => {
    await updateInvoiceStage(id, stage);
    load();
  };

  if (loading) return <p>Loading invoice...</p>;
  if (!invoice) return <p>Not found.</p>;

  const currentStageIdx = stages.indexOf(invoice.stage);

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Invoice Detail: {invoice.invoiceNumber}</h1>
      <p className="text-sm text-gray-500 mb-4">{invoice.customer?.name}</p>

      {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}
      {message && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{message}</div>}

      {/* Stage timeline */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, idx) => (
            <div key={stage} className="flex flex-col items-center flex-1">
              <button
                onClick={() => handleStageChange(stage)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  idx <= currentStageIdx ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
              <span className="text-xs mt-1 capitalize text-center">{stage.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Qty</th>
              <th className="text-left p-2">Unit Price</th>
              <th className="text-left p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{l.description}</td>
                <td className="p-2">{l.qty}</td>
                <td className="p-2">${l.unitPrice}</td>
                <td className="p-2">${l.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4 flex justify-between">
        <span>Total Amount</span>
        <span className="font-bold">${invoice.amount.toFixed(2)}</span>
      </div>

      {/* Payment history */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-semibold mb-2">Payment History</h3>
        {payments.length === 0 && <p className="text-sm text-gray-400">No payments recorded yet.</p>}
        {payments.map((p) => (
          <div key={p._id} className="flex justify-between text-sm border-b py-1 last:border-0">
            <span>{new Date(p.paidAt).toLocaleDateString()} - {p.method}</span>
            <span>${p.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {invoice.status !== 'paid' && (
        <form onSubmit={handleRecordPayment} className="bg-white p-4 rounded shadow flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="border rounded px-3 py-2 w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="border rounded px-3 py-2">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Record Payment
          </button>
        </form>
      )}
    </div>
  );
}