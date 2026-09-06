import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQuotations } from '../../api/portal.api';

export default function MyQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await getMyQuotations();
        setQuotations(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load quotations'
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();
  }, []);

  const handleQuotationClick = (quotation) => {
    navigate('/portal/negotiation', {
      state: {
        quotationId: quotation._id,
        quotation,
      },
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading your quotations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        My Quotations
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotations.map((q) => (
          <div
            key={q._id}
            onClick={() => handleQuotationClick(q)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold capitalize">
                {q.status?.replace('_', ' ')}
              </span>

              <span className="font-bold">
                ${q.orderTotal?.toFixed(2)}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              {q.lines?.length || 0} line(s)
            </p>

            <p className="text-xs text-blue-600 mt-3">
              Click to view quotation & negotiate →
            </p>
          </div>
        ))}

        {quotations.length === 0 && (
          <p className="text-gray-500">
            No quotations yet.
          </p>
        )}
      </div>
    </div>
  );
}