import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptions } from '../../api/subscription.api';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function SubscriptionsListPage() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = (status) => {
    setLoading(true);
    getSubscriptions(status).then((res) => {
      setSubs(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load(filter || undefined);
  }, [filter]);

  if (loading) return <p>Loading subscriptions...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>

      <div className="flex gap-2 mb-4">
        {['', 'active', 'paused', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Plan / Product</th>
              <th className="text-left p-3">Cycle</th>
              <th className="text-left p-3">Next Bill Date</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr
                key={s._id}
                onClick={() => navigate(`/subscriptions/${s._id}`)}
                className="border-t cursor-pointer hover:bg-gray-50"
              >
                <td className="p-3">{s.customer?.name}</td>
                <td className="p-3">{s.productName}</td>
                <td className="p-3 capitalize">{s.cycle}</td>
                <td className="p-3">{new Date(s.nextBillDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[s.status]}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}