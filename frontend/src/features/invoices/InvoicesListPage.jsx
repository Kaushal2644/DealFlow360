import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../../api/invoice.api';

const statusColors = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getInvoices(filter || undefined).then((res) => {
      setInvoices(res.data);
      setLoading(false);
    });
  }, [filter]);

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>

      <div className="flex gap-2 mb-4">
        {['', 'unpaid', 'paid', 'overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Invoice #</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv._id}
                onClick={() => navigate(`/invoices/${inv._id}`)}
                className="border-t cursor-pointer hover:bg-gray-50"
              >
                <td className="p-3">{inv.invoiceNumber}</td>
                <td className="p-3">{inv.customer?.name}</td>
                <td className="p-3">${inv.amount?.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}