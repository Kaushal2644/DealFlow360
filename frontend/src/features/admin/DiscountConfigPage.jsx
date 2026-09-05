import { useEffect, useState } from 'react';
import {
  getDiscountTiers,
  upsertDiscountTier,
  getCategoryCeilings,
  upsertCategoryCeiling,
  getApprovalChainRules,
  createApprovalChainRule,
  deleteApprovalChainRule,
} from '../../api/discountConfig.api';

export default function DiscountConfigPage() {
  const [tiers, setTiers] = useState([]);
  const [ceilings, setCeilings] = useState([]);
  const [rules, setRules] = useState([]);

  const [tierForm, setTierForm] = useState({ tier: 'bronze', maxDiscountPercent: '' });
  const [ceilingForm, setCeilingForm] = useState({ category: 'hardware', maxDiscountPercent: '' });
  const [ruleForm, setRuleForm] = useState({ label: '', minOverPercent: '', maxOverPercent: '', requiredBand: 'sales_manager' });

  const loadAll = async () => {
    const [tRes, cRes, rRes] = await Promise.all([
      getDiscountTiers(),
      getCategoryCeilings(),
      getApprovalChainRules(),
    ]);
    setTiers(tRes.data);
    setCeilings(cRes.data);
    setRules(rRes.data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleTierSubmit = async (e) => {
    e.preventDefault();
    await upsertDiscountTier({ ...tierForm, maxDiscountPercent: Number(tierForm.maxDiscountPercent) });
    setTierForm({ tier: 'bronze', maxDiscountPercent: '' });
    loadAll();
  };

  const handleCeilingSubmit = async (e) => {
    e.preventDefault();
    await upsertCategoryCeiling({ ...ceilingForm, maxDiscountPercent: Number(ceilingForm.maxDiscountPercent) });
    setCeilingForm({ category: 'hardware', maxDiscountPercent: '' });
    loadAll();
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    await createApprovalChainRule({
      ...ruleForm,
      minOverPercent: Number(ruleForm.minOverPercent),
      maxOverPercent: ruleForm.maxOverPercent ? Number(ruleForm.maxOverPercent) : null,
    });
    setRuleForm({ label: '', minOverPercent: '', maxOverPercent: '', requiredBand: 'sales_manager' });
    loadAll();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Discount Tiers and Approval Chain Setup</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Discount Tiers */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Tier Discount Ceilings</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Tier</th>
                <th className="p-2">Max Discount</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="p-2 capitalize">{t.tier}</td>
                  <td className="p-2">{t.maxDiscountPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <form onSubmit={handleTierSubmit} className="flex gap-2 items-end">
            <select
              value={tierForm.tier}
              onChange={(e) => setTierForm({ ...tierForm, tier: e.target.value })}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
            <input
              type="number"
              placeholder="Max %"
              value={tierForm.maxDiscountPercent}
              onChange={(e) => setTierForm({ ...tierForm, maxDiscountPercent: e.target.value })}
              required
              className="border rounded px-2 py-1 text-sm w-24"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Save
            </button>
          </form>
        </div>

        {/* Category Ceilings */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Category Discount Ceilings</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Category</th>
                <th className="p-2">Max Discount</th>
              </tr>
            </thead>
            <tbody>
              {ceilings.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-2 capitalize">{c.category}</td>
                  <td className="p-2">{c.maxDiscountPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <form onSubmit={handleCeilingSubmit} className="flex gap-2 items-end">
            <select
              value={ceilingForm.category}
              onChange={(e) => setCeilingForm({ ...ceilingForm, category: e.target.value })}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
              <option value="subscription">Subscription</option>
            </select>
            <input
              type="number"
              placeholder="Max %"
              value={ceilingForm.maxDiscountPercent}
              onChange={(e) => setCeilingForm({ ...ceilingForm, maxDiscountPercent: e.target.value })}
              required
              className="border rounded px-2 py-1 text-sm w-24"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Save
            </button>
          </form>
        </div>
      </div>

      {/* Approval Chain Rules */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Discount Range → Required Approval</h3>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Label</th>
              <th className="p-2">Range (overage points)</th>
              <th className="p-2">Required Band</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-2">{r.label}</td>
                <td className="p-2">
                  {r.minOverPercent} to {r.maxOverPercent ?? '∞'}
                </td>
                <td className="p-2 capitalize">{r.requiredBand.replace('_', ' + ')}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteApprovalChainRule(r._id).then(loadAll)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleRuleSubmit} className="flex gap-2 items-end flex-wrap">
          <input
            placeholder="Label"
            value={ruleForm.label}
            onChange={(e) => setRuleForm({ ...ruleForm, label: e.target.value })}
            required
            className="border rounded px-2 py-1 text-sm w-40"
          />
          <input
            type="number"
            placeholder="Min over %"
            value={ruleForm.minOverPercent}
            onChange={(e) => setRuleForm({ ...ruleForm, minOverPercent: e.target.value })}
            required
            className="border rounded px-2 py-1 text-sm w-28"
          />
          <input
            type="number"
            placeholder="Max over % (blank = ∞)"
            value={ruleForm.maxOverPercent}
            onChange={(e) => setRuleForm({ ...ruleForm, maxOverPercent: e.target.value })}
            className="border rounded px-2 py-1 text-sm w-36"
          />
          <select
            value={ruleForm.requiredBand}
            onChange={(e) => setRuleForm({ ...ruleForm, requiredBand: e.target.value })}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="sales_manager">Sales Manager</option>
            <option value="sales_manager_finance">Sales Manager + Finance</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
            Add Rule
          </button>
        </form>
      </div>
    </div>
  );
}