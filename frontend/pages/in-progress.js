import { useEffect, useState } from 'react';
import { createServerSupabase } from '../utils/supabaseServer';
import { fetchOrders, markDone, markDelivered } from '../lib/api';
import OrderCard from '../components/OrderCard';
import EditOrderModal from '../components/EditOrderModal';
import Header from '../components/Header';

export async function getServerSideProps(context) {
  const supabase = createServerSupabase(context.req, context.res);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: session.user } };
}

export default function InProgress({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders('in_progress');
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Failed to load orders.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDone = async (id) => {
    try {
      await markDone(id);
      await loadOrders();
    } catch (err) {
      alert('Failed to mark as done');
    }
  };

  const handleDelivered = async (id) => {
    try {
      await markDelivered(id);
      await loadOrders();
    } catch (err) {
      alert('Failed to mark as delivered');
    }
  };

  const handleEdit = (id) => {
    setEditingOrderId(id);
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(term) ||
      order.customer_address?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="border-b border-border bg-surface/70 backdrop-blur">
          <div className="pw-container py-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">In Progress Orders</h1>
              <p className="mt-2 text-sm text-white/70">Welcome, {user.email}</p>
            </div>

            <div className="mt-6 max-w-md">
              <input
                type="text"
                placeholder="Search by customer name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pw-input"
              />
            </div>
          </div>
        </div>

        <div className="pw-container py-8">

          {loading && <p className="text-sm text-white/70">Loading…</p>}
          {error && <p className="text-sm text-secondary">{error}</p>}
          {!loading && filteredOrders.length === 0 && (
            <div className="pw-card p-6 text-sm text-white/70">
              {searchTerm ? 'No matching orders.' : 'No orders in progress.'}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                pageType="in-progress"
                onDone={handleDone}
                onDelivered={handleDelivered}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </div>
      </div>
      {editingOrderId && (
        <EditOrderModal
          orderId={editingOrderId}
          onClose={() => setEditingOrderId(null)}
          onOrderUpdated={loadOrders}
        />
      )}
    </>
  );
}