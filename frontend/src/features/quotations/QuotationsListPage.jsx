import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotations, createQuotation } from '../../api/quotation.api';
import { getCustomers, createCustomer } from '../../api/customer.api';

const statusColors = {
  draft: 'bg-gray-200 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  negotiation: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', tier: 'bronze' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const [qRes, cRes] = await Promise.all([getQuotations(), getCustomers()]);
    setQuotations(qRes.data);
    setCustomers(cRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const res = await createCustomer(newCustomer);
    setCustomers([...customers, res.data]);
    setSelectedCustomer(res.data._id);
    setShowNewCustomer(false);
    setNewCustomer({ name: '', email: '', tier: 'bronze' });
  };

  const handleNewQuotation = async () => {
    if (!selectedCustomer) {
      alert('Select or create a customer first');
      return;
    }
    const res = await createQuotation(selectedCustomer);
    navigate(`/quotations/${res.data._id}`);
  };

  if (loading) return <p>Loading quotations...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quotations</h1>

      <div className="bg-white p-4 rounded shadow mb-6 flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="border rounded px-3 py-2 w-64"
          >
            <option value="">-- Select customer --</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.tier})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowNewCustomer(!showNewCustomer)}
          className="text-blue-600 text-sm underline mb-2"
        >
          + New Customer
        </button>
        <button
          onClick={handleNewQuotation}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
        >
          + New Quotation
        </button>
      </div>

      {showNewCustomer && (
        <form onSubmit={handleCreateCustomer} className="bg-white p-4 rounded shadow mb-6 flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              required
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tier</label>
            <select
              value={newCustomer.tier}
              onChange={(e) => setNewCustomer({ ...newCustomer, tier: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotations.map((q) => (
          <div
            key={q._id}
            onClick={() => navigate(`/quotations/${q._id}`)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">{q.customer?.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[q.status]}`}>{q.status}</span>
            </div>
            <p className="text-sm text-gray-500">Rep: {q.rep?.name}</p>
            <p className="text-lg font-bold mt-2">${q.orderTotal?.toFixed(2) || '0.00'}</p>
            {q.riskBand !== 'none' && (
              <p className="text-xs text-orange-600 mt-1">Risk: {q.riskBand}</p>
            )}
          </div>
        ))}
        {quotations.length === 0 && <p className="text-gray-500">No quotations yet.</p>}
      </div>
    </div>
  );
}