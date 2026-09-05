import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getFulfillmentById,
  acceptSplit,
  consolidateBackorder,
} from '../../api/fulfillment.api';

export default function FulfillmentDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getFulfillmentById(id).then((res) => {
      setOrder(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAccept = async () => {
    setError('');
    try {
      await acceptSplit(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept split');
    }
  };

  const handleConsolidate = async () => {
    setError('');
    try {
      await consolidateBackorder(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to consolidate');
    }
  };

  if (loading) return <p>Loading fulfillment detail...</p>;
  if (!order) return <p>Not found.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Fulfillment Detail: {order.customer?.name}</h1>
      <p className="text-sm text-gray-500 mb-4">Live stock split per warehouse</p>

      {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

      <div className="bg-white rounded shadow overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Warehouse</th>
              <th className="text-left p-2">Product</th>
              <th className="text-left p-2">Qty Fulfilled</th>
              <th className="text-left p-2">Qty Backordered</th>
            </tr>
          </thead>
          <tbody>
            {order.splits.map((s, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{s.warehouseName}</td>
                <td className="p-2">{s.productName}</td>
                <td className="p-2">{s.qtyFulfilled}</td>
                <td className="p-2">
                  {s.qtyBackordered > 0 ? (
                    <span className="text-red-600 font-semibold">{s.qtyBackordered}</span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4 flex justify-between text-sm">
        <span>Estimated Shipments: <strong>{order.estimatedShipments}</strong></span>
        <span>Status: <strong>{order.status}</strong></span>
      </div>

      {order.hasBackorder && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded mb-4">
          <p className="text-sm mb-2">
            "Consolidate Remaining Backorder" prompt — check if new stock covers the backorder.
          </p>
          <button
            onClick={handleConsolidate}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Consolidate Backorder
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={order.status === 'accepted'}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Accept Suggested Split
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
          Manual Override
        </button>
      </div>
    </div>
  );
}