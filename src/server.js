const express = require('express');
const cors = require('cors');
const path = require('path');
const initDb = require('./db');
const apiRoutesFactory = require('./routes/apiRoutes');
const { PORT } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const db = initDb();
const apiRoutes = apiRoutesFactory(db);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
