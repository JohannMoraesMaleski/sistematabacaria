const express = require('express');

const reportRoutes = (db) => {
    const router = express.Router();

    // GET /api/reports/occupancy - Relatório de ocupação de mesas
    router.get('/occupancy', (req, res) => {
        const { date, period } = req.query;
        
        let dateFilter = '';
        let params = [];
        
        if (date) {
            dateFilter = `AND DATE(tord.opened_at) = ?`;
            params.push(date);
        } else {
            // Por padrão, últimos 7 dias
            dateFilter = `AND tord.opened_at >= DATE('now', '-7 days')`;
        }

        const query = `
            SELECT 
                t.number as table_number,
                t.capacity,
                COUNT(tord.id) as total_uses,
                AVG(
                    CASE 
                        WHEN tord.closed_at IS NOT NULL 
                        THEN (julianday(tord.closed_at) - julianday(tord.opened_at)) * 24 * 60
                        ELSE NULL 
                    END
                ) as avg_duration_minutes,
                SUM(COALESCE(tord.total_amount, 0)) as total_revenue,
                MAX(tord.opened_at) as last_used,
                t.status as current_status
            FROM tables t
            LEFT JOIN table_orders tord ON t.id = tord.table_id ${dateFilter}
            GROUP BY t.id, t.number, t.capacity, t.status
            ORDER BY total_uses DESC, t.number
        `;
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Erro ao gerar relatório de ocupação:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // GET /api/reports/waiters - Relatório de performance dos garçons
    router.get('/waiters', (req, res) => {
        const { date, waiter_id } = req.query;
        
        let dateFilter = '';
        let waiterFilter = '';
        let params = [];
        
        if (date) {
            dateFilter = `AND DATE(tord.opened_at) = ?`;
            params.push(date);
        } else {
            dateFilter = `AND tord.opened_at >= DATE('now', '-7 days')`;
        }
        
        if (waiter_id) {
            waiterFilter = `AND w.id = ?`;
            params.push(waiter_id);
        }

        const query = `
            SELECT 
                w.id,
                w.name as waiter_name,
                w.shift,
                w.commission_rate,
                COUNT(tord.id) as total_orders,
                SUM(COALESCE(tord.total_amount, 0)) as total_sales,
                AVG(COALESCE(tord.total_amount, 0)) as avg_order_value,
                SUM(COALESCE(tord.total_amount, 0) * w.commission_rate / 100) as total_commission,
                COUNT(CASE WHEN tord.status = 'closed' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN tord.status = 'open' THEN 1 END) as active_orders
            FROM waiters w
            LEFT JOIN table_orders tord ON w.id = tord.waiter_id ${dateFilter}
            WHERE w.active = 1 ${waiterFilter}
            GROUP BY w.id, w.name, w.shift, w.commission_rate
            ORDER BY total_sales DESC
        `;
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Erro ao gerar relatório de garçons:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // GET /api/reports/revenue - Relatório de faturamento
    router.get('/revenue', (req, res) => {
        const { start_date, end_date, group_by } = req.query;
        
        let dateFilter = '';
        let groupBy = '';
        let params = [];
        
        if (start_date && end_date) {
            dateFilter = `WHERE DATE(tord.closed_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else {
            dateFilter = `WHERE tord.closed_at >= DATE('now', '-30 days')`;
        }
        
        switch (group_by) {
            case 'day':
                groupBy = `GROUP BY DATE(tord.closed_at)`;
                break;
            case 'week':
                groupBy = `GROUP BY strftime('%Y-%W', tord.closed_at)`;
                break;
            case 'month':
                groupBy = `GROUP BY strftime('%Y-%m', tord.closed_at)`;
                break;
            default:
                groupBy = `GROUP BY DATE(tord.closed_at)`;
        }

        const query = `
            SELECT 
                DATE(tord.closed_at) as period,
                COUNT(tord.id) as total_orders,
                SUM(tord.total_amount) as total_revenue,
                AVG(tord.total_amount) as avg_order_value,
                COUNT(DISTINCT tord.table_id) as tables_used,
                pm.name as payment_method,
                SUM(CASE WHEN pm.type = 'dinheiro' THEN tord.total_amount ELSE 0 END) as cash_revenue,
                SUM(CASE WHEN pm.type = 'cartao_credito' THEN tord.total_amount ELSE 0 END) as credit_revenue,
                SUM(CASE WHEN pm.type = 'cartao_debito' THEN tord.total_amount ELSE 0 END) as debit_revenue,
                SUM(CASE WHEN pm.type = 'pix' THEN tord.total_amount ELSE 0 END) as pix_revenue
            FROM table_orders tord
            LEFT JOIN payment_methods pm ON tord.payment_method_id = pm.id
            ${dateFilter} AND tord.status = 'closed'
            ${groupBy}
            ORDER BY period DESC
        `;
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Erro ao gerar relatório de faturamento:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // GET /api/reports/popular-items - Itens mais vendidos
    router.get('/popular-items', (req, res) => {
        const { date, limit } = req.query;
        
        let dateFilter = '';
        let params = [];
        
        if (date) {
            dateFilter = `AND DATE(tord.closed_at) = ?`;
            params.push(date);
        } else {
            dateFilter = `AND tord.closed_at >= DATE('now', '-7 days')`;
        }
        
        const itemLimit = limit ? parseInt(limit) : 10;
        params.push(itemLimit);

        const query = `
            SELECT 
                p.id,
                p.name as product_name,
                p.price as current_price,
                SUM(toi.quantity) as total_quantity,
                COUNT(DISTINCT toi.order_id) as orders_count,
                SUM(toi.subtotal) as total_revenue,
                AVG(toi.unit_price) as avg_unit_price
            FROM table_order_items toi
            JOIN products p ON toi.product_id = p.id
            JOIN table_orders tord ON toi.order_id = tord.id
            WHERE tord.status = 'closed' ${dateFilter}
            GROUP BY p.id, p.name, p.price
            ORDER BY total_quantity DESC
            LIMIT ?
        `;
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Erro ao gerar relatório de itens populares:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // GET /api/reports/sales - Relatório de vendas avulsas
    router.get('/sales', (req, res) => {
        const { start_date, end_date, group_by } = req.query;
        
        let dateFilter = '';
        let groupBy = '';
        let params = [];
        
        if (start_date && end_date) {
            dateFilter = `WHERE DATE(s.sale_date) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else {
            dateFilter = `WHERE s.sale_date >= DATE('now', '-30 days')`;
        }
        
        switch (group_by) {
            case 'day':
                groupBy = `GROUP BY DATE(s.sale_date)`;
                break;
            case 'week':
                groupBy = `GROUP BY strftime('%Y-%W', s.sale_date)`;
                break;
            case 'month':
                groupBy = `GROUP BY strftime('%Y-%m', s.sale_date)`;
                break;
            default:
                groupBy = `GROUP BY DATE(s.sale_date)`;
        }

        const query = `
            SELECT 
                DATE(s.sale_date) as period,
                COUNT(s.id) as total_sales,
                SUM(s.total_price) as total_revenue,
                AVG(s.total_price) as avg_sale_value,
                SUM(s.quantity) as total_items_sold,
                COUNT(DISTINCT s.product_id) as unique_products
            FROM sales s
            ${dateFilter}
            ${groupBy}
            ORDER BY period DESC
        `;
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Erro ao gerar relatório de vendas avulsas:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // GET /api/reports/comparison - Relatório comparativo entre vendas de mesas e avulsas
    router.get('/comparison', (req, res) => {
        const { start_date, end_date } = req.query;
        
        let dateFilter = '';
        let params = [];
        
        if (start_date && end_date) {
            dateFilter = `WHERE DATE(period_date) BETWEEN ? AND ?`;
            params = [start_date, end_date, start_date, end_date];
        } else {
            dateFilter = `WHERE period_date >= DATE('now', '-30 days')`;
            params = [];
        }
        
        const query = `
            WITH table_sales AS (
                SELECT 
                    DATE(tord.closed_at) as period_date,
                    'mesas' as sale_type,
                    COUNT(tord.id) as total_transactions,
                    SUM(tord.total_amount) as total_revenue,
                    AVG(tord.total_amount) as avg_transaction_value
                FROM table_orders tord
                WHERE tord.status = 'closed' 
                ${start_date && end_date ? 'AND DATE(tord.closed_at) BETWEEN ? AND ?' : 'AND tord.closed_at >= DATE(\'now\', \'-30 days\')'}
                GROUP BY DATE(tord.closed_at)
            ),
            direct_sales AS (
                SELECT 
                    DATE(s.sale_date) as period_date,
                    'avulsas' as sale_type,
                    COUNT(s.id) as total_transactions,
                    SUM(s.total_price) as total_revenue,
                    AVG(s.total_price) as avg_transaction_value
                FROM sales s
                ${start_date && end_date ? 'WHERE DATE(s.sale_date) BETWEEN ? AND ?' : 'WHERE s.sale_date >= DATE(\'now\', \'-30 days\')'}
                GROUP BY DATE(s.sale_date)
            )
            SELECT * FROM table_sales
            UNION ALL
            SELECT * FROM direct_sales
            ORDER BY period_date DESC, sale_type
        `;
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Erro ao gerar relatório comparativo:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            // Agrupar dados por período para facilitar a visualização
            const grouped = {};
            rows.forEach(row => {
                if (!grouped[row.period_date]) {
                    grouped[row.period_date] = {
                        period: row.period_date,
                        mesas: { total_transactions: 0, total_revenue: 0, avg_transaction_value: 0 },
                        avulsas: { total_transactions: 0, total_revenue: 0, avg_transaction_value: 0 }
                    };
                }
                grouped[row.period_date][row.sale_type] = {
                    total_transactions: row.total_transactions,
                    total_revenue: row.total_revenue,
                    avg_transaction_value: row.avg_transaction_value
                };
            });
            
            res.json(Object.values(grouped));
        });
    });

    return router;
};

module.exports = reportRoutes;
