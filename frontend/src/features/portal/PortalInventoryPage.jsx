import { useEffect, useState } from 'react';
import { getPortalInventory } from '../../api/portal.api';

export default function PortalInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortalInventory().then((res) => {
      setInventory(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading available products...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Availability</h1>
      <p className="text-gray-500 mb-6">Current stock for products you may want to order.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inventory.map((p) => (
          <div key={p.productId} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">{p.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 capitalize">{p.category}</span>
            </div>
            <p className="text-lg font-bold mb-2">${p.price}</p>
            {p.availableQty === null ? (
              <span className="text-sm text-blue-600 font-medium">Available (subscription)</span>
            ) : p.availableQty === 0 ? (
              <span className="text-sm text-red-600 font-medium">Out of Stock</span>
            ) : p.availableQty < 10 ? (
              <span className="text-sm text-orange-600 font-medium">Only {p.availableQty} left</span>
            ) : (
              <span className="text-sm text-green-600 font-medium">In Stock: {p.availableQty}</span>
            )}
          </div>
        ))}
        {inventory.length === 0 && <p className="text-gray-500">No products available right now.</p>}
      </div>
    </div>
  );
}