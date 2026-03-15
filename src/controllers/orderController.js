const saveOrder = (db) => (req, res) => {
  const { userId, total, cart } = req.body;
  if (!userId || !total || !cart) {
    return res.status(400).json({ error: 'userId, total, and cart are required' });
  }

  db.run(
    'INSERT INTO orders (user_id, total_amount, order_data) VALUES (?, ?, ?)',
    [userId, total, JSON.stringify(cart)],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Order placed', orderId: this.lastID });
    }
  );
};

const getMyOrders = (db) => (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'User ID required as query param userId' });

  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = rows.map((row) => {
      try {
        return { ...row, order_data: JSON.parse(row.order_data) };
      } catch {
        return row;
      }
    });
    res.json({ orders });
  });
};

const getAllOrders = (db) => (req, res) => {
  const sql = `
    SELECT orders.id, orders.total_amount, orders.order_data, orders.created_at,
           users.fullname, users.email
    FROM orders
    JOIN users ON orders.user_id = users.id
    ORDER BY orders.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const orders = rows.map((row) => {
      try {
        return { ...row, order_data: JSON.parse(row.order_data) };
      } catch {
        return row;
      }
    });
    res.json({ orders });
  });
};

module.exports = {
  saveOrder,
  getMyOrders,
  getAllOrders,
};
