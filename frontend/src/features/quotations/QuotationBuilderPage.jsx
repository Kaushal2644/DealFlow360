import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getQuotationById,
  addLine,
  submitForApproval,
  getUpsellSuggestions,
} from '../../api/quotation.api';
import { getProducts } from '../../api/product.api';

export default function QuotationBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    const [qRes, pRes] = await Promise.all([getQuotationById(id), getProducts()]);
    setQuotation(qRes.data);
    setProducts(pRes.data);

    if (qRes.data.lines.length > 0) {
      const sRes = await getUpsellSuggestions(id);
      setSuggestions(sRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleAddLine = async (productId, discount = 0) => {
    setError('');
    try {
      await addLine(id, { productId, qty, discountPercent: discount });
      setSelectedProduct('');
      setQty(1);
      setDiscountPercent(0);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add line');
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const res = await submitForApproval(id);
      alert(`Quotation status: ${res.data.status} (risk band: ${res.data.riskBand})`);
      navigate('/quotations');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    }
  };

  if (loading) return <p>Loading quotation...</p>;
  if (!quotation) return <p>Quotation not found.</p>;

  const isDraft = quotation.status === 'draft';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main cart area */}
      <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">
              Quotation: {quotation.customer?.name} ({quotation.customer?.tier})
            </h1>
            <span className="text-sm px-2 py-1 rounded bg-gray-200">{quotation.status}</span>
          </div>
          <p className="text-sm text-gray-500">Rep: {quotation.rep?.name}</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        {/* Lines table */}
        <div className="bg-white rounded shadow overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Qty</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Discount</th>
                <th className="text-left p-2">Limit</th>
                <th className="text-left p-2">Line Total</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lines.map((line) => (
                <tr key={line._id} className="border-t">
                  <td className="p-2">{line.productName}</td>
                  <td className="p-2">{line.qty}</td>
                  <td className="p-2">${line.unitPrice}</td>
                  <td className="p-2">{line.discountPercent}%</td>
                  <td className="p-2">{line.effectiveLimit}%</td>
                  <td className="p-2">${line.lineTotal?.toFixed(2)}</td>
                  <td className="p-2">
                    {line.overBy > 0 ? (
                      <span className="text-red-600 font-semibold">Over by {line.overBy}</span>
                    ) : (
                      <span className="text-green-600">OK</span>
                    )}
                  </td>
                </tr>
              ))}
              {quotation.lines.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">
                    No lines added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add line form */}
        {isDraft && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <h3 className="font-semibold mb-3">Add Product</h3>
            <div className="flex gap-3 items-end flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="border rounded px-3 py-2 w-64"
                >
                  <option value="">-- Select product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (${p.price}) - {p.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-24"
                />
              </div>
              <button
                onClick={() => handleAddLine(selectedProduct, discountPercent)}
                disabled={!selectedProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add Line
              </button>
            </div>
          </div>
        )}

        {/* Risk + margin summary */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between mb-1">
            <span>Order Total</span>
            <span className="font-bold">${quotation.orderTotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Blended Risk Score</span>
            <span className={quotation.blendedRiskScore > 0 ? 'text-orange-600 font-semibold' : ''}>
              {quotation.blendedRiskScore}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Risk Band</span>
            <span className="font-semibold">{quotation.riskBand}</span>
          </div>
        </div>

        {isDraft && (
          <button
            onClick={handleSubmit}
            disabled={quotation.lines.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Submit for Approval
          </button>
        )}
      </div>

      {/* Upsell panel */}
      <div>
        <div className="bg-white p-4 rounded shadow">
          {/* <h3 className="font-semibold mb-3">Upsell & Cross-Sell Suggestions</h3> */}
          {/* {suggestions.length === 0 && (
            <p className="text-sm text-gray-400">Add a product to see suggestions.</p>
          )} */}
          {suggestions.map((s) => (
            <div key={s.product.id} className="border rounded p-3 mb-3">
              <div className="flex justify-between items-start">
                <span className="font-medium">{s.product.name}</span>
                {s.promoted && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Promo</span>
                )}
              </div>
              <p className="text-sm text-gray-500">${s.product.price}</p>
              <p className="text-xs text-green-600 mt-1">
                Margin impact: {s.marginDeltaIfAdded > 0 ? '+' : ''}
                {s.marginDeltaIfAdded}%
              </p>
              {isDraft && (
                <button
                  onClick={() => handleAddLine(s.product.id, 0)}
                  className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Add to Quote
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}