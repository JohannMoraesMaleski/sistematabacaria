const express = require('express');

const dashboardRoutes = (db) => {
    const router = express.Router();

    // Dados do dashboard
    router.get('/', (req, res) => {
        const queries = {
            totalProducts: 'SELECT COUNT(*) as count FROM products',
            totalSalesToday: `SELECT COUNT(*) as count FROM sales WHERE DATE(sale_date) = DATE('now')`,
            totalStock: 'SELECT SUM(stock_quantity) as total FROM products',
            totalRevenue: 'SELECT SUM(total_price) as total FROM sales',
            revenueToday: `SELECT SUM(total_price) as total FROM sales WHERE DATE(sale_date) = DATE('now')`,
            lowStockProducts: 'SELECT COUNT(*) as count FROM products WHERE stock_quantity < 10',
            topProducts: `
                SELECT p.name, SUM(s.quantity) as total_sold, SUM(s.total_price) as revenue
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                GROUP BY s.product_id, p.name
                ORDER BY total_sold DESC
                LIMIT 5
            `,
            recentSales: `
                SELECT s.*, p.name as product_name
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                ORDER BY s.sale_date DESC
                LIMIT 10
            `,
            salesByCategory: `
                SELECT c.name as category_name, SUM(s.total_price) as total_sales, COUNT(s.id) as sales_count
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                LEFT JOIN categories c ON p.category_id = c.id
                GROUP BY c.id, c.name
                ORDER BY total_sales DESC
            `,
            monthlyRevenue: `
                SELECT 
                    strftime('%Y-%m', sale_date) as month,
                    SUM(total_price) as revenue,
                    COUNT(id) as sales_count
                FROM sales
                GROUP BY strftime('%Y-%m', sale_date)
                ORDER BY month DESC
                LIMIT 12
            `
        };

        const results = {};
        let completed = 0;
        const total = Object.keys(queries).length;

        Object.keys(queries).forEach(key => {
            if (key === 'topProducts' || key === 'recentSales' || key === 'salesByCategory' || key === 'monthlyRevenue') {
                db.all(queries[key], (err, rows) => {
                    if (err) {
                        console.error(`Error in ${key}:`, err);
                        results[key] = [];
                    } else {
                        results[key] = rows;
                    }
                    completed++;
                    if (completed === total) {
                        res.json(results);
                    }
                });
            } else {
                db.get(queries[key], (err, row) => {
                    if (err) {
                        console.error(`Error in ${key}:`, err);
                        results[key] = { count: 0, total: 0 };
                    } else {
                        results[key] = row;
                    }
                    completed++;
                    if (completed === total) {
                        res.json(results);
                    }
                });
            }
        });
    });

    // Estatísticas de vendas
    router.get('/sales-stats', (req, res) => {
        const query = `
            SELECT 
                DATE(sale_date) as date,
                COUNT(*) as sales_count,
                SUM(total_price) as revenue
            FROM sales
            WHERE DATE(sale_date) >= DATE('now', '-30 days')
            GROUP BY DATE(sale_date)
            ORDER BY date DESC
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // Produtos com estoque baixo
    router.get('/low-stock', (req, res) => {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.stock_quantity < 10
            ORDER BY p.stock_quantity ASC
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    return router;
};

module.exports = dashboardRoutes;
