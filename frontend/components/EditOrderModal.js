import { useState, useEffect } from 'react';
import { fetchOrderById, updateOrder } from '../lib/api';

export default function EditOrderModal({ orderId, onClose, onOrderUpdated }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchOrderById(orderId);
        setFormData(data);
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateOrder(orderId, formData);
      onOrderUpdated();
      onClose();
    } catch (err) {
      setError('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;
  if (!formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="pw-card max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-border bg-surface/80 p-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Edit Order</h2>
          <button onClick={onClose} className="pw-btn-ghost px-3 py-2" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-white">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Customer Name</label>
            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className="pw-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Customer Address</label>
            <input type="text" name="customer_address" value={formData.customer_address} onChange={handleChange} required className="pw-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Pieces</label>
            <input type="number" name="pieces" value={formData.pieces} onChange={handleChange} required className="pw-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Design Type</label>
            <input type="text" name="design_type" value={formData.design_type} onChange={handleChange} required className="pw-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Cloth Type</label>
            <input type="text" name="cloth_type" value={formData.cloth_type} onChange={handleChange} required className="pw-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Arrival Date</label>
            <input type="date" name="arrival_date" value={formData.arrival_date} onChange={handleChange} required className="pw-input" />
          </div>
          {error && <div className="rounded-xl border border-border bg-black/20 px-4 py-3 text-sm text-white/80">{error}</div>}
          <button type="submit" disabled={saving} className="pw-btn-primary w-full py-2.5">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}