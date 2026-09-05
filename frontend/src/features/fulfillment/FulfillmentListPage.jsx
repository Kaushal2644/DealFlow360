import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFulfillmentOrders } from '../../api/fulfillment.api';

const statusColors = {
  suggested: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  manual_override: 'bg-blue-100 text-blue-800',
  backordered: 'bg-red-100 text-red-800',
  consolidated: 'bg-purple-100 text-purple-800',
};

export default function FulfillmentListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getFulfillmentOrders().then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading fulfillment orders...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fulfillment and Stock</h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Est. Shipments</th>
              <th className="text-left p-3">Backorder?</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o._id}
                onClick={() => navigate(`/fulfillment/${o._id}`)}
                className="border-t cursor-pointer hover:bg-gray-50"
              >
                <td className="p-3">{o.customer?.name}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusColors[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3">{o.estimatedShipments}</td>
                <td className="p-3">
                  {o.hasBackorder ? (
                    <span className="text-red-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-green-600">No</span>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No fulfillment orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}