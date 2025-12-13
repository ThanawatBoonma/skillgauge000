require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const crypto = require('crypto');

app.use(express.json());
app.use(cors());

const pool = require('./config/db');

app.use('/api', require('./routes/auth'));

app.use('/api/manageusers', require('./routes/manageusers'));

app.use('/api/quiz', require('./routes/quiz'));

function uuidHex() {
  return crypto.randomBytes(16).toString('hex');
}

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

app.get('/', (req, res) => res.send('API is running'));