import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalLoginRequest } from '../../api/portal.api';
import usePortalAuthStore from '../../app/portalAuthStore';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = usePortalAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await portalLoginRequest(email, password);
      login(res.data.token, res.data.customer);
      navigate('/portal/quotations');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-1 text-center">DealFlow360</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Customer Portal</p>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-900"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}