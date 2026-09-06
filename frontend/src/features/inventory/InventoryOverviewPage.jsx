import { useEffect, useState } from 'react';
import { getInventoryOverview } from '../../api/inventory.api';

export default function InventoryOverviewPage() {
  const [inventory, setInventory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventoryOverview().then((res) => {
      setInventory(res.data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  if (loading) return <p>Loading inventory...</p>;

  const totalOnHand = inventory.reduce((sum, p) => sum + p.totalOnHand, 0);
  const totalAvailable = inventory.reduce((sum, p) => sum + p.totalAvailable, 0);
  const lowStockCount = inventory.filter((p) => p.totalAvailable > 0 && p.totalAvailable < 10).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventory Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Units On Hand</p>
          <p className="text-2xl font-bold">{totalOnHand}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Available</p>
          <p className="text-2xl font-bold">{totalAvailable}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Low Stock Products (&lt;10)</p>
          <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">On Hand</th>
              <th className="text-left p-3">Reserved</th>
              <th className="text-left p-3">Available</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((p) => (
              <>
                <tr
                  key={p.productId}
                  onClick={() => toggleExpand(p.productId)}
                  className="border-t cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">{p.productName}</td>
                  <td className="p-3 capitalize">{p.category}</td>
                  <td className="p-3">{p.totalOnHand}</td>
                  <td className="p-3">{p.totalReserved}</td>
                  <td className="p-3">
                    <span
                      className={`font-semibold ${
                        p.totalAvailable === 0
                          ? 'text-red-600'
                          : p.totalAvailable < 10
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {p.totalAvailable}
                    </span>
                  </td>
                  <td className="p-3 text-blue-600 text-xs">
                    {expandedId === p.productId ? 'Hide breakdown' : 'Show breakdown'}
                  </td>
                </tr>
                {expandedId === p.productId && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="p-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="p-1">Warehouse</th>
                            <th className="p-1">On Hand</th>
                            <th className="p-1">Reserved</th>
                            <th className="p-1">Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.warehouses.map((w, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-1">{w.warehouseName}</td>
                              <td className="p-1">{w.qtyOnHand}</td>
                              <td className="p-1">{w.qtyReserved}</td>
                              <td className="p-1">{w.qtyAvailable}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No stock records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}