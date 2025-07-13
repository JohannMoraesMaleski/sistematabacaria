const express = require('express');

const salesRoutes = (db) => {
    const router = express.Router();

    // Listar todas as vendas
    router.get('/', (req, res) => {
        const query = `
            SELECT s.*, p.name as product_name 
            FROM sales s
            LEFT JOIN products p ON s.product_id = p.id
            ORDER BY s.sale_date DESC
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // Buscar venda por ID
    router.get('/:id', (req, res) => {
        const query = `
            SELECT s.*, p.name as product_name 
            FROM sales s
            LEFT JOIN products p ON s.product_id = p.id
            WHERE s.id = ?
        `;
        
        db.get(query, [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Venda não encontrada' });
            }
            res.json(row);
        });
    });

    // Criar nova venda
    router.post('/', (req, res) => {
        const { product_id, quantity } = req.body;
        
        if (!product_id || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
        }

        // Verificar se o produto existe e tem estoque suficiente
        db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            if (product.stock_quantity < quantity) {
                return res.status(400).json({ error: 'Estoque insuficiente' });
            }

            const unit_price = product.price;
            const total_price = unit_price * quantity;

            // Inserir venda
            const insertSaleQuery = `
                INSERT INTO sales (product_id, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?)
            `;
            
            db.run(insertSaleQuery, [product_id, quantity, unit_price, total_price], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Atualizar estoque
                const updateStockQuery = `
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ?
                    WHERE id = ?
                `;
                
                db.run(updateStockQuery, [quantity, product_id], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(201).json({ 
                        id: this.lastID,
                        message: 'Venda registrada com sucesso',
                        total_price: total_price
                    });
                });
            });
        });
    });

    // Relatório de vendas por período
    router.get('/report/:period', (req, res) => {
        const { period } = req.params;
        let dateFilter = '';
        
        switch (period) {
            case 'today':
                dateFilter = "AND DATE(s.sale_date) = DATE('now')";
                break;
            case 'week':
                dateFilter = "AND DATE(s.sale_date) >= DATE('now', '-7 days')";
                break;
            case 'month':
                dateFilter = "AND DATE(s.sale_date) >= DATE('now', '-30 days')";
                break;
            default:
                dateFilter = '';
        }

        const query = `
            SELECT 
                p.name as product_name,
                SUM(s.quantity) as total_quantity,
                SUM(s.total_price) as total_sales,
                COUNT(s.id) as sales_count
            FROM sales s
            LEFT JOIN products p ON s.product_id = p.id
            WHERE 1=1 ${dateFilter}
            GROUP BY s.product_id, p.name
            ORDER BY total_sales DESC
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // Deletar venda (reverter estoque)
    router.delete('/:id', (req, res) => {
        // Buscar informações da venda
        db.get('SELECT * FROM sales WHERE id = ?', [req.params.id], (err, sale) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!sale) {
                return res.status(404).json({ error: 'Venda não encontrada' });
            }

            // Reverter estoque
            const updateStockQuery = `
                UPDATE products 
                SET stock_quantity = stock_quantity + ?
                WHERE id = ?
            `;
            
            db.run(updateStockQuery, [sale.quantity, sale.product_id], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                // Deletar venda
                const deleteSaleQuery = 'DELETE FROM sales WHERE id = ?';
                
                db.run(deleteSaleQuery, [req.params.id], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Venda cancelada e estoque restaurado' });
                });
            });
        });
    });

    return router;
};

module.exports = salesRoutes;
