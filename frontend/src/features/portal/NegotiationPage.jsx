import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  getMyQuotationById,
  submitNegotiationRequest,
  confirmQuotationByCustomer,
} from '../../api/portal.api';

export default function NegotiationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get quotation data passed from MyQuotationsPage
  const quotationId = location.state?.quotationId;
  const initialQuotation = location.state?.quotation;

  const [data, setData] = useState(
    initialQuotation
      ? {
          quotation: initialQuotation,
          messages: [],
        }
      : null
  );

  const [comment, setComment] = useState('');
  const [selectedLineId, setSelectedLineId] = useState('');
  const [counterDiscount, setCounterDiscount] = useState('');
  const [loading, setLoading] = useState(!initialQuotation);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!quotationId) {
      setError('No quotation selected.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await getMyQuotationById(quotationId);

      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load quotation'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) {
      load();
    } else {
      setLoading(false);
      setError('No quotation selected.');
    }
  }, [quotationId]);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!quotationId) {
      setError('No quotation selected.');
      return;
    }

    setError('');
    setMessage('');

    try {
      await submitNegotiationRequest(quotationId, {
        lineId: selectedLineId || null,
        comment,
        counterDiscountPercent: counterDiscount
          ? Number(counterDiscount)
          : null,
      });

      setMessage(
        'Request submitted. Awaiting rep response.'
      );

      setComment('');
      setCounterDiscount('');

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit request'
      );
    }
  };

  const handleConfirm = async () => {
    if (!quotationId) {
      setError('No quotation selected.');
      return;
    }

    setError('');
    setMessage('');

    try {
      const payload =
        selectedLineId && counterDiscount
          ? {
              lineId: selectedLineId,
              finalDiscountPercent:
                Number(counterDiscount),
            }
          : {};

      const res = await confirmQuotationByCustomer(
        quotationId,
        payload
      );

      setMessage(
        res.data.reRoutedToApproval
          ? 'Terms exceeded threshold — automatically sent back for internal approval.'
          : 'Quotation confirmed! Moving to fulfillment.'
      );

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to confirm'
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading quotation...</p>
      </div>
    );
  }

  if (!data || !data.quotation) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error || 'Quotation not found.'}
        </div>

        <button
          onClick={() => navigate('/portal/quotations')}
          className="bg-slate-800 text-white px-4 py-2 rounded"
        >
          Back to Quotations
        </button>
      </div>
    );
  }

  const { quotation, messages = [] } = data;

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main quotation section */}
      <div className="lg:col-span-2">

        {/* Header */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">
                Quotation Negotiation
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Status:{' '}
                <span className="font-medium capitalize">
                  {quotation.status?.replace('_', ' ')}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="text-xl font-bold">
                ${quotation.orderTotal?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded mb-4">
            {message}
          </div>
        )}

        {/* Quotation lines */}
        <div className="bg-white rounded shadow overflow-hidden mb-4">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              Quotation Items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">
                    Product
                  </th>

                  <th className="text-left p-3">
                    Qty
                  </th>

                  <th className="text-left p-3">
                    Discount
                  </th>

                  <th className="text-left p-3">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {quotation.lines?.map((line) => (
                  <tr
                    key={line._id}
                    className="border-t"
                  >
                    <td className="p-3">
                      {line.productName}
                    </td>

                    <td className="p-3">
                      {line.qty}
                    </td>

                    <td className="p-3">
                      {line.discountPercent}%
                    </td>

                    <td className="p-3">
                      ${line.lineTotal?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Negotiation form */}
        <form
          onSubmit={handleSubmitRequest}
          className="bg-white p-4 rounded shadow mb-4"
        >
          <h3 className="font-semibold mb-3">
            Request Changes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

            {/* Line selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Line (optional)
              </label>

              <select
                value={selectedLineId}
                onChange={(e) =>
                  setSelectedLineId(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">
                  General comment
                </option>

                {quotation.lines?.map((line) => (
                  <option
                    key={line._id}
                    value={line._id}
                  >
                    {line.productName}
                  </option>
                ))}
              </select>
            </div>

            {/* Counter discount */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Counter Discount %
              </label>

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={counterDiscount}
                onChange={(e) =>
                  setCounterDiscount(e.target.value)
                }
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. 15"
              />
            </div>
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            placeholder="Your message..."
            className="w-full border rounded px-3 py-2 mb-3"
            rows={3}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Request
          </button>
        </form>

        {/* Confirm */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Confirm Quotation
          </button>

          <button
            onClick={() =>
              navigate('/portal/quotations')
            }
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Back
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">
            Conversation
          </h3>

          {messages.map((m) => (
            <div
              key={m._id}
              className="text-sm border-b py-2 last:border-0"
            >
              <p className="font-medium capitalize">
                {m.author}
              </p>

              {m.comment && (
                <p className="text-gray-600 mt-1">
                  {m.comment}
                </p>
              )}

              {m.counterDiscountPercent !== null &&
                m.counterDiscountPercent !==
                  undefined && (
                  <p className="text-orange-600 text-xs mt-1">
                    Proposed:{' '}
                    {m.counterDiscountPercent}%
                  </p>
                )}
            </div>
          ))}

          {messages.length === 0 && (
            <p className="text-sm text-gray-400">
              No messages yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}