import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyQuotations } from '../../api/portal.api';

export default function MyQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyQuotations().then((res) => {
      setQuotations(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading your quotations...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Quotations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotations.map((q) => (
          <div
            key={q._id}
            onClick={() => navigate(`/portal/quotations/${q._id}`)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
          >
            <div className="flex justify-between">
              <span className="font-semibold capitalize">{q.status.replace('_', ' ')}</span>
              <span className="font-bold">${q.orderTotal?.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{q.lines.length} line(s)</p>
          </div>
        ))}
        {quotations.length === 0 && <p className="text-gray-500">No quotations yet.</p>}
      </div>
    </div>
  );
}