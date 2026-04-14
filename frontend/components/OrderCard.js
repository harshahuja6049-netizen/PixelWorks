import { useState } from 'react';
import OrderModal from './OrderModal';

export default function OrderCard({ order, pageType, onStart, onDone, onDelivered, onAddInvoice, onDelete, onEdit }) {
  const [showModal, setShowModal] = useState(false);
  const orderName = `${order.customer_name}, ${order.customer_address}`;
  const [invoiceValue, setInvoiceValue] = useState(order.invoice || '');

  const handleSaveInvoice = () => {
    if (invoiceValue.trim()) {
      onAddInvoice(order.id, invoiceValue);
    }
  };

  return (
    <>
      <div className="pw-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{orderName}</h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
              <span>Order ID: <span className="font-medium text-white">{order.order_id}</span></span>
              <span>Pieces: <span className="font-medium text-white">{order.pieces}</span></span>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="pw-btn-ghost shrink-0">
            Details
          </button>
        </div>

        {pageType === 'completed' && order.delivery_date && (
          <p className="mt-3 text-xs text-white/70">
            Delivered: <span className="font-medium text-white">{order.delivery_date}</span>
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {pageType === 'pending' && (
            <>
              <button onClick={() => onStart(order.id)} className="pw-btn bg-primary text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/25">Start</button>
              <button onClick={() => onEdit(order.id)} className="pw-btn bg-secondary text-surface-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/35">Edit</button>
              <button onClick={() => { if (confirm('Delete this order?')) onDelete(order.id); }} className="pw-btn bg-white/10 text-white ring-1 ring-border hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-secondary/25">Delete</button>
            </>
          )}
          {pageType === 'in-progress' && (
            <>
              <button onClick={() => onDone(order.id)} className="pw-btn bg-primary text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/25">Done</button>
              <button onClick={() => onDelivered(order.id)} className="pw-btn bg-white/10 text-white ring-1 ring-border hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-secondary/25">Delivered</button>
              <button onClick={() => onEdit(order.id)} className="pw-btn bg-secondary text-surface-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/35">Edit</button>
            </>
          )}
          {pageType === 'completed' && (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
              <input type="text" placeholder="Invoice #" value={invoiceValue} onChange={(e) => setInvoiceValue(e.target.value)} className="pw-input sm:max-w-[220px]" />
              <button onClick={handleSaveInvoice} className="pw-btn bg-secondary text-surface-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-secondary/35">Save Invoice</button>
            </div>
          )}
        </div>
      </div>
      {showModal && <OrderModal orderId={order.id} onClose={() => setShowModal(false)} />}
    </>
  );
}