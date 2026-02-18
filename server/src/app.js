const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Smart School API is running' });
});

// Mock Auth Middleware
const auth = (req, res, next) => {
    // Simple auth for demo
    next();
};

// Routes placeholder
app.get('/api/dashboard/stats', auth, (req, res) => {
    res.json({
        totalStudents: 1248,
        activeClasses: 42,
        attendanceRate: '98.2%',
        revenue: '$45,200'
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
