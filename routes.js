const bcrypt = require('bcrypt');

module.exports = (db) => {
    // Signup
    const signup = (req, res) => {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ error: 'Error hashing password' });
            db.run('INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)', [fullname, email, hash], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Account created', userId: this.lastID });
            });
        });
    };

    // Login
    const login = (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(401).json({ error: 'Invalid email or password' });

            bcrypt.compare(password, user.password, (err, match) => {
                if (match) res.json({ message: 'Login successful', user: { id: user.id, fullname: user.fullname, email: user.email } });
                else res.status(401).json({ error: 'Invalid email or password' });
            });
        });
    };

    // Get users
    const getUsers = (req, res) => {
        db.all('SELECT id, fullname, email, created_at FROM users', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ users: rows });
        });
    };

    // Save order
    const saveOrder = (req, res) => {
        const { userId, total, cart } = req.body;
        if (!userId || !total || !cart) return res.status(400).json({ error: 'Missing required fields' });

        db.run('INSERT INTO orders (user_id, total_amount, order_data) VALUES (?, ?, ?)', [userId, total, JSON.stringify(cart)], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Order placed', orderId: this.lastID });
        });
    };

    // Get user's own orders (requires userId in query)
    const getMyOrders = (req, res) => {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required. Add ?userId=1 to URL' });
        }

        const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
        db.all(sql, [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Parse order_data JSON for each order
            rows = rows.map(row => {
                try {
                    return { ...row, order_data: JSON.parse(row.order_data) };
                } catch (e) {
                    return row;
                }
            });

            res.json({ orders: rows });
        });
    };

    // Get all orders (admin view)
    const getAllOrders = (req, res) => {
        const sql = `
            SELECT orders.id, orders.total_amount, orders.order_data, orders.created_at,
                   users.fullname, users.email
            FROM orders
            JOIN users ON orders.user_id = users.id
            ORDER BY orders.created_at DESC
        `;
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            rows = rows.map(row => {
                try {
                    return { ...row, order_data: JSON.parse(row.order_data) };
                } catch (e) {
                    return row;
                }
            });
            res.json({ orders: rows });
        });
    };

    return { signup, login, getUsers, saveOrder, getMyOrders, getAllOrders };
};