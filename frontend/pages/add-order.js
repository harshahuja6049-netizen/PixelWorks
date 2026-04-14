import { useState } from 'react';
import { useRouter } from 'next/router';
import { createServerSupabase } from '../utils/supabaseServer';
import { createOrder } from '../lib/api';
import Header from '../components/Header';
import Camera from '../components/Camera';

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

export default function AddOrder({ user }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_address: '',
    pieces: '',
    design_type: '',
    cloth_type: '',
    arrival_date: '',
  });
  const [photoUrls, setPhotoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const designOptions = ['Round', 'Round-BT', 'Long', 'Long-BT', 'Fancy', 'Daaman','Box','2-Button','Band Gala'];
  const clothOptions = ['Cotton', 'Alphine', 'Crush', 'Gujri', 'Paper-Cotton','A-Plain','C-Plain','Patch'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoCaptured = (url) => {
    if (photoUrls.length < 7) {
      setPhotoUrls([...photoUrls, url]);
    } else {
      alert('Maximum 7 photos allowed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createOrder({
        ...formData,
        pieces: parseInt(formData.pieces),
        photos: photoUrls,
      });
      router.push('/');
    } catch (err) {
      setError('Failed to create order. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl mb-4">Add New Order</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Customer Name</label>
            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold">Maker</label>
            <input type="text" name="customer_address" value={formData.customer_address} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold">Number of Pieces</label>
            <input type="number" name="pieces" value={formData.pieces} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-semibold">Design Type</label>
            <select name="design_type" value={formData.design_type} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {designOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold">Cloth Type</label>
            <select name="cloth_type" value={formData.cloth_type} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {clothOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold">Arrival Date</label>
            <input type="date" name="arrival_date" value={formData.arrival_date} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>

          <Camera onPhotoCaptured={handlePhotoCaptured} />
          {photoUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photoUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Photo ${idx+1}`} className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </div>
    </>
  );
}