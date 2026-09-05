import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/product.api';

export default function ProductCatalogPage() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const filters = { isActive: 'true' };
    if (category) filters.category = category;
    getProducts(filters).then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, [category]);

  if (loading) return <p>Loading products...</p>;

  const totalProducts = products.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <button
          onClick={() => navigate('/products/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'hardware', 'services', 'subscription'].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1 rounded capitalize ${
              category === c ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {c || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Tax %</th>
              <th className="text-left p-3">Margin</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : 0;
              return (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/products/${p._id}`)}
                  className="border-t cursor-pointer hover:bg-gray-50"
                >
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 capitalize">{p.category}</td>
                  <td className="p-3">${p.price}</td>
                  <td className="p-3">{p.taxPercent}%</td>
                  <td className="p-3">{margin}%</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Active</span>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}