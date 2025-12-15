require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); // Import cors

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors()); // Use cors middleware

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/demo', require('./routes/demo'));
app.use('/api/esp32data', require('./routes/esp32data'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;