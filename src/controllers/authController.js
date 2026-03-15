const bcrypt = require('bcrypt');

const signup = (db) => async (req, res) => {
  const { fullname, email, password } = req.body;
  if (!fullname || !email || !password) {
    return res.status(400).json({ error: 'fullname, email, and password are required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
      [fullname, email, hash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Account created', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
};

const login = (db) => (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    bcrypt.compare(password, user.password, (compareErr, match) => {
      if (compareErr) return res.status(500).json({ error: compareErr.message });
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });
      res.json({ message: 'Login successful', user: { id: user.id, fullname: user.fullname, email: user.email } });
    });
  });
};

const getUsers = (db) => (_, res) => {
  db.all('SELECT id, fullname, email, created_at FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
};

module.exports = {
  signup,
  login,
  getUsers,
};
