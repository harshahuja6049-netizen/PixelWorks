import { useEffect, useState } from 'react';
import { createServerSupabase } from '../utils/supabaseServer';
import { fetchOrders, startOrder, deleteOrder } from '../lib/api';
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

export default function Pending({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const totalPieces = orders.reduce((sum, order) => sum + (order.pieces || 0), 0);


  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders('pending');
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Failed to load orders. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStart = async (id) => {
    try {
      await startOrder(id);
      await loadOrders();
    } catch (err) {
      alert('Failed to start order');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      await loadOrders();
    } catch (err) {
      alert('Failed to delete order');
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
      <div className="p-4">
        <h1 className="text-2xl mb-4">Pending Orders</h1>
        <p className="mb-4">Welcome, {user.email}</p>
        <p className="mb-4 text-lg font-semibold">Total pieces in pending orders: {totalPieces}</p>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by customer name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && filteredOrders.length === 0 && (
          <p>{searchTerm ? 'No matching orders.' : 'No pending orders.'}</p>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              pageType="pending"
              onStart={handleStart}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
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