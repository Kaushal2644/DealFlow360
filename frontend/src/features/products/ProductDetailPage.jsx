import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, createProduct, updateProduct, deleteProduct } from '../../api/product.api';

const emptyProduct = {
  name: '',
  category: 'hardware',
  price: '',
  cost: '',
  taxPercent: '',
  unit: 'each',
  description: '',
  isSubscription: false,
  quantityOnHand: 0,
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [product, setProduct] = useState(emptyProduct);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      getProductById(id).then((res) => {
        setProduct(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({ ...product, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...product,
        price: Number(product.price),
        cost: Number(product.cost),
        taxPercent: Number(product.taxPercent),
        quantityOnHand: Number(product.quantityOnHand),
      };
      if (isNew) {
        const res = await createProduct(payload);
        navigate(`/products/${res.data._id}`);
      } else {
        await updateProduct(id, payload);
        alert('Product updated');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deactivate this product?')) return;
    await deleteProduct(id);
    navigate('/products');
  };

  if (loading) return <p>Loading product...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-4">{isNew ? 'New Product' : `Edit: ${product.name}`}</h1>

      {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

      <form onSubmit={handleSave} className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" value={product.category} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input name="unit" value={product.unit} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost</label>
            <input
              type="number"
              name="cost"
              value={product.cost}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tax %</label>
            <input
              type="number"
              name="taxPercent"
              value={product.taxPercent}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isSubscription"
            checked={product.isSubscription}
            onChange={handleChange}
          />
          <label className="text-sm">This is a subscription product</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity on Hand (fallback, global)</label>
          <input
            type="number"
            name="quantityOnHand"
            value={product.quantityOnHand}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {isNew ? 'Create Product' : 'Save Changes'}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Deactivate
            </button>
          )}
        </div>
      </form>
    </div>
  );
}