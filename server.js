const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'database', 'ironbox.db'));

// Initialize database
const initDB = require('./database/init');
initDB(db);

// Routes
const productRoutes = require('./backend/routes/products');
const categoryRoutes = require('./backend/routes/categories');
const supplierRoutes = require('./backend/routes/suppliers');
const salesRoutes = require('./backend/routes/sales');
const dashboardRoutes = require('./backend/routes/dashboard');
const tableRoutes = require('./backend/routes/tables');
const waiterRoutes = require('./backend/routes/waiters');
const orderItemRoutes = require('./backend/routes/order-items');
const reportRoutes = require('./backend/routes/reports');
const paymentRoutes = require('./backend/routes/payments');
const subscriberRoutes = require('./backend/routes/subscribers');

app.use('/api/products', productRoutes(db));
app.use('/api/categories', categoryRoutes(db));
app.use('/api/suppliers', supplierRoutes(db));
app.use('/api/sales', salesRoutes(db));
app.use('/api/dashboard', dashboardRoutes(db));
app.use('/api/tables', tableRoutes(db));
app.use('/api/waiters', waiterRoutes(db));
app.use('/api/order-items', orderItemRoutes(db));
app.use('/api/reports', reportRoutes(db));
app.use('/api/payments', paymentRoutes(db));
app.use('/api/subscribers', subscriberRoutes(db));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor IRONBOX rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;
