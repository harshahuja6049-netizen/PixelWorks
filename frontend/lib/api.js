const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchOrders(status) {
  const url = status ? `${API_URL}/api/orders?status=${status}` : `${API_URL}/api/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrderById(id) {
  const res = await fetch(`${API_URL}/api/orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export async function createOrder(orderData) {
  console.log('📤 Sending order data:', orderData);
  console.log('📡 API URL:', API_URL);
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  console.log('📥 Response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Response error:', errorText);
    throw new Error('Failed to create order');
  }
  const data = await res.json();
  console.log('✅ Order created:', data);
  return data;
}
export async function startOrder(id) {
  const res = await fetch(`${API_URL}/api/orders/${id}/start`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to start order');
  return res.json();
}

export async function markDone(id) {
  const res = await fetch(`${API_URL}/api/orders/${id}/done`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to mark done');
  return res.json();
}

export async function markDelivered(id) {
  const res = await fetch(`${API_URL}/api/orders/${id}/delivered`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to mark delivered');
  return res.json();
}

export async function addInvoice(id, invoice) {
  const res = await fetch(`${API_URL}/api/orders/${id}/invoice`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoice }),
  });
  if (!res.ok) throw new Error('Failed to add invoice');
  return res.json();
}

export async function updateOrder(id, updates) {
  const res = await fetch(`${API_URL}/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`${API_URL}/api/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete order');
  return res.json();
}