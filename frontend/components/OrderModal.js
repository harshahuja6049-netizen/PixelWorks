import { useEffect, useState } from 'react';
import { fetchOrderById } from '../lib/api';

export default function OrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="pw-card w-full max-w-md p-6 text-center text-sm text-white/80">
        Loading…
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="pw-card w-full max-w-md p-6 text-center text-sm text-white">
        <div className="mb-2 text-secondary">Error</div>
        <div className="text-white/80">{error}</div>
      </div>
    </div>
  );

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="pw-card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-border bg-surface/80 p-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-white">Order Details</h2>
            <p className="text-xs text-white/60">ID: {order.order_id}</p>
          </div>
          <button onClick={onClose} className="pw-btn-ghost px-3 py-2" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="p-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Customer</dt>
              <dd className="mt-1 text-sm text-white">{order.customer_name}</dd>
            </div>
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Address</dt>
              <dd className="mt-1 text-sm text-white">{order.customer_address}</dd>
            </div>
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Pieces</dt>
              <dd className="mt-1 text-sm text-white">{order.pieces}</dd>
            </div>
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Status</dt>
              <dd className="mt-1 text-sm text-white">{order.status}</dd>
            </div>
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Design</dt>
              <dd className="mt-1 text-sm text-white">{order.design_type}</dd>
            </div>
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Cloth</dt>
              <dd className="mt-1 text-sm text-white">{order.cloth_type}</dd>
            </div>
            <div className="rounded-xl border border-border bg-black/15 p-3">
              <dt className="text-xs font-semibold text-white/60">Arrival Date</dt>
              <dd className="mt-1 text-sm text-white">{order.arrival_date}</dd>
            </div>
            {order.delivery_date && (
              <div className="rounded-xl border border-border bg-black/15 p-3">
                <dt className="text-xs font-semibold text-white/60">Delivery Date</dt>
                <dd className="mt-1 text-sm text-white">{order.delivery_date}</dd>
              </div>
            )}
            {order.invoice && (
              <div className="rounded-xl border border-border bg-black/15 p-3 sm:col-span-2">
                <dt className="text-xs font-semibold text-white/60">Invoice</dt>
                <dd className="mt-1 text-sm text-white">{order.invoice}</dd>
              </div>
            )}
          </dl>

          {order.photos && order.photos.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-semibold text-white/60">Photos</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {order.photos.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full rounded-xl border border-border bg-black/10 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}