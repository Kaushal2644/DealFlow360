import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlags, triggerScan, escalateFlag, nudgeRep, resolveFlag } from '../../api/dealHealth.api';

const typeLabels = {
  stalled: 'Stalled Deals',
  discount_anomaly: 'Discount Anomalies',
  delivery_slippage: 'Delivery Slippage',
};

const severityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function DealHealthDashboardPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getFlags().then((res) => {
      setFlags(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    await triggerScan();
    load();
    setScanning(false);
  };

  const handleEscalate = async (id) => {
    await escalateFlag(id, 'Escalated from Deal Health Dashboard');
    load();
  };

  const handleNudge = async (id) => {
    await nudgeRep(id);
    load();
  };

  const grouped = ['stalled', 'discount_anomaly', 'delivery_slippage'].map((type) => ({
    type,
    items: flags.filter((f) => f.type === type),
  }));

  if (loading) return <p>Loading deal health...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Deal Health and Anomaly Dashboard</h1>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Run Scan Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped.map((group) => (
          <div key={group.type} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">{typeLabels[group.type]}</h3>
            {group.items.length === 0 && <p className="text-sm text-gray-400">Nothing flagged.</p>}
            {group.items.map((flag) => (
              <div key={flag._id} className="border rounded p-3 mb-3">
                <div className="flex justify-between items-start mb-1">
                  <span
                    onClick={() => navigate(`/quotations/${flag.quotation._id}`)}
                    className="font-medium text-sm cursor-pointer hover:underline"
                  >
                    {flag.quotation?.customer?.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${severityColors[flag.severity]}`}>
                    {flag.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{flag.detail}</p>
                <p className="text-xs text-gray-400 mb-2">Rep: {flag.quotation?.rep?.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEscalate(flag._id)}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={() => handleNudge(flag._id)}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200"
                  >
                    Nudge Rep
                  </button>
                  <button
                    onClick={() => resolveFlag(flag._id).then(load)}
                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}