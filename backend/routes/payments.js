const express = require('express');

const paymentRoutes = (db) => {
    const router = express.Router();

    // GET /api/payments/methods - Listar métodos de pagamento
    router.get('/methods', (req, res) => {
        const query = `
            SELECT * FROM payment_methods 
            WHERE active = 1 
            ORDER BY name
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar métodos de pagamento:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // POST /api/payments/process - Processar pagamento de mesa
    router.post('/process', (req, res) => {
        const { order_id, payment_method_id, amount_paid, discount = 0 } = req.body;
        
        if (!order_id || !payment_method_id || !amount_paid) {
            return res.status(400).json({ error: 'Pedido, método de pagamento e valor são obrigatórios' });
        }

        // Buscar pedido e método de pagamento
        const orderQuery = `
            SELECT tord.*, pm.fee_percentage, pm.name as payment_method_name
            FROM table_orders tord
            LEFT JOIN payment_methods pm ON pm.id = ?
            WHERE tord.id = ? AND tord.status = 'open'
        `;
        
        db.get(orderQuery, [payment_method_id, order_id], (err, order) => {
            if (err) {
                console.error('Erro ao buscar pedido:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado ou já fechado' });
            }

            const total_amount = order.total_amount || 0;
            const final_amount = total_amount - discount;
            const fee_amount = (final_amount * (order.fee_percentage || 0)) / 100;
            const net_amount = final_amount - fee_amount;
            
            if (amount_paid < final_amount) {
                return res.status(400).json({ 
                    error: 'Valor pago insuficiente',
                    required: final_amount,
                    paid: amount_paid,
                    missing: final_amount - amount_paid
                });
            }

            const change_amount = amount_paid - final_amount;

            // Atualizar pedido com informações de pagamento
            const updateQuery = `
                UPDATE table_orders 
                SET 
                    payment_method_id = ?,
                    status = 'closed',
                    closed_at = CURRENT_TIMESTAMP,
                    total_amount = ?,
                    discount_amount = ?,
                    fee_amount = ?,
                    net_amount = ?,
                    amount_paid = ?,
                    change_amount = ?
                WHERE id = ?
            `;
            
            // Adicionar campos se não existirem
            db.run(`ALTER TABLE table_orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0`, () => {});
            db.run(`ALTER TABLE table_orders ADD COLUMN fee_amount DECIMAL(10,2) DEFAULT 0`, () => {});
            db.run(`ALTER TABLE table_orders ADD COLUMN net_amount DECIMAL(10,2) DEFAULT 0`, () => {});
            db.run(`ALTER TABLE table_orders ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0`, () => {});
            db.run(`ALTER TABLE table_orders ADD COLUMN change_amount DECIMAL(10,2) DEFAULT 0`, () => {});
            
            setTimeout(() => {
                db.run(updateQuery, [
                    payment_method_id, 
                    final_amount, 
                    discount, 
                    fee_amount, 
                    net_amount, 
                    amount_paid, 
                    change_amount, 
                    order_id
                ], function(updateErr) {
                    if (updateErr) {
                        console.error('Erro ao processar pagamento:', updateErr);
                        return res.status(500).json({ error: 'Erro interno do servidor' });
                    }

                    // Liberar mesa
                    db.run('UPDATE tables SET status = "available" WHERE id = ?', [order.table_id], (tableErr) => {
                        if (tableErr) {
                            console.error('Erro ao liberar mesa:', tableErr);
                        }
                    });

                    res.json({
                        message: 'Pagamento processado com sucesso',
                        order_id,
                        payment_method: order.payment_method_name,
                        total_amount: final_amount,
                        amount_paid,
                        change_amount,
                        fee_amount,
                        net_amount
                    });
                });
            }, 100);
        });
    });

    // GET /api/payments/order/:orderId - Detalhes de pagamento de um pedido
    router.get('/order/:orderId', (req, res) => {
        const { orderId } = req.params;
        
        const query = `
            SELECT 
                tord.*,
                pm.name as payment_method_name,
                pm.type as payment_type,
                pm.fee_percentage,
                t.number as table_number,
                w.name as waiter_name
            FROM table_orders tord
            LEFT JOIN payment_methods pm ON tord.payment_method_id = pm.id
            LEFT JOIN tables t ON tord.table_id = t.id
            LEFT JOIN waiters w ON tord.waiter_id = w.id
            WHERE tord.id = ?
        `;
        
        db.get(query, [orderId], (err, order) => {
            if (err) {
                console.error('Erro ao buscar detalhes do pagamento:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!order) {
                return res.status(404).json({ error: 'Pedido não encontrado' });
            }

            // Buscar itens do pedido
            const itemsQuery = `
                SELECT 
                    toi.*,
                    p.name as product_name
                FROM table_order_items toi
                JOIN products p ON toi.product_id = p.id
                WHERE toi.order_id = ?
            `;
            
            db.all(itemsQuery, [orderId], (itemsErr, items) => {
                if (itemsErr) {
                    console.error('Erro ao buscar itens do pedido:', itemsErr);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                res.json({
                    ...order,
                    items
                });
            });
        });
    });

    return router;
};

module.exports = paymentRoutes;
