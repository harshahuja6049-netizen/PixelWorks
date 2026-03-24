require('dotenv').config();

const express = require('express');

const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


app.post('/api/orders', async (req, res) => {
    try {
        const {
            order_id,
            customer_name,
            customer_address,
            pieces,
            design_type,
            cloth_type,
            arrival_date,
            photos = []  
        } = req.body;

        if (!order_id || !customer_name || !customer_address || !pieces || !design_type || !cloth_type || !arrival_date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                order_id,
                customer_name,
                customer_address,
                pieces,
                design_type,
                cloth_type,
                arrival_date,
                photos,
                status: 'pending',    
                done: false,
                delivered: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.get('/api/orders', async (req, res) => {
    try {
        const { status } = req.query;
        let query = supabase.from('orders').select('*');

        if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id - Get a single order
app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Order not found' });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// PUT /api/orders/:id - Update entire order (edit)
app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Prevent updating certain fields? We'll allow all except id/created_at
        delete updates.id;
        delete updates.created_at;

        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// DELETE /api/orders/:id - Delete order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// PATCH /api/orders/:id/start - Move from pending to in_progress
app.patch('/api/orders/:id/start', async (req, res) => {
    try {
        const { id } = req.params;
        // First, fetch current status
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Order is not in pending state' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'in_progress' })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start order' });
    }
});

// PATCH /api/orders/:id/done - Mark manufacturing as done
app.patch('/api/orders/:id/done', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('orders')
            .update({ done: true })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        // After marking done, check if also delivered -> update status
        if (data.delivered) {
            await supabase
                .from('orders')
                .update({ status: 'completed', delivery_date: new Date().toISOString().split('T')[0] })
                .eq('id', id);
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark as done' });
    }
});

// PATCH /api/orders/:id/delivered - Mark as delivered
app.patch('/api/orders/:id/delivered', async (req, res) => {
    try {
        const { id } = req.params;
        // First, fetch current order to check done status
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('done')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (!order.done) {
            return res.status(400).json({ error: 'Cannot deliver before manufacturing is done' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ delivered: true })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        // Now that delivered is true, and we already checked done is true, update status
        await supabase
            .from('orders')
            .update({ status: 'completed', delivery_date: new Date().toISOString().split('T')[0] })
            .eq('id', id);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to mark as delivered' });
    }
});

// PATCH /api/orders/:id/invoice - Add invoice number
app.patch('/api/orders/:id/invoice', async (req, res) => {
    try {
        const { id } = req.params;
        const { invoice } = req.body;
        if (!invoice) return res.status(400).json({ error: 'Invoice number required' });

        const { data, error } = await supabase
            .from('orders')
            .update({ invoice })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add invoice' });
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});