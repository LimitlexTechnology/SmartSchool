const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const prisma = require('./db');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Smart School API is running' });
});

app.get('/api/health/db', async (req, res) => {
    try {
        const u = new URL(process.env.DATABASE_URL);
        const pool = new Pool({
            user: decodeURIComponent(u.username),
            password: decodeURIComponent(u.password),
            host: u.hostname,
            port: u.port ? Number(u.port) : 5432,
            database: u.pathname.replace(/^\//, '') || 'postgres',
            ssl: { rejectUnauthorized: false },
        });
        await pool.query('SELECT 1');
        await pool.end();
        res.json({ status: 'OK', database: 'connected' });
    } catch (e) {
        console.error('DB health check failed:', e);
        res.status(503).json({ status: 'DEGRADED', database: 'unavailable' });
    }
});

// Mock Auth Middleware
const auth = (req, res, next) => {
    // Simple auth for demo
    next();
};

// Routes placeholder
app.get('/api/dashboard/stats', auth, async (req, res) => {
    try {
        const [students, classes, staff, revenueAgg] = await Promise.all([
            prisma.student.count(),
            prisma.class.count(),
            prisma.teacher.count(),
            prisma.transaction.aggregate({ _sum: { amount: true } })
        ]);
        const revenue = revenueAgg._sum.amount ?? 0;
        res.json({
            totalStudents: students,
            totalClasses: classes,
            totalStaff: staff,
            totalGuardians: 0,
            revenue,
            status: 'ok'
        });
    } catch (e) {
        console.error('Stats error:', e);
        res.status(200).json({
            totalStudents: 0,
            totalClasses: 0,
            totalStaff: 0,
            totalGuardians: 0,
            revenue: 0,
            status: 'degraded'
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
