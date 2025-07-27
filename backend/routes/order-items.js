const express = require('express');

const orderItemRoutes = (db) => {
    const router = express.Router();

    // GET /api/order-items/:orderId - Listar itens de um pedido
    router.get('/:orderId', (req, res) => {
        const { orderId } = req.params;
        
        const query = `
            SELECT 
                toi.*,
                p.name as product_name,
                p.price as current_product_price
            FROM table_order_items toi
            JOIN products p ON toi.product_id = p.id
            WHERE toi.order_id = ?
            ORDER BY toi.added_at
        `;
        
        db.all(query, [orderId], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar itens do pedido:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // POST /api/order-items - Adicionar item ao pedido
    router.post('/', (req, res) => {
        const { order_id, product_id, quantity, command_number = 1 } = req.body;
        
        if (!order_id || !product_id || !quantity) {
            return res.status(400).json({ error: 'Pedido, produto e quantidade são obrigatórios' });
        }

        // Buscar preço do produto
        db.get('SELECT price FROM products WHERE id = ?', [product_id], (err, product) => {
            if (err) {
                console.error('Erro ao buscar produto:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!product) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            const unit_price = product.price;
            const total_price = unit_price * quantity;

            // Inserir item
            const insertQuery = `
                INSERT INTO table_order_items (order_id, product_id, quantity, unit_price, total_price, command_number) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(insertQuery, [order_id, product_id, quantity, unit_price, total_price, command_number], function(err) {
                if (err) {
                    console.error('Erro ao adicionar item:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }

                // Atualizar total do pedido
                const updateOrderQuery = `
                    UPDATE table_orders 
                    SET total_amount = (
                        SELECT COALESCE(SUM(total_price), 0) 
                        FROM table_order_items 
                        WHERE order_id = ?
                    )
                    WHERE id = ?
                `;
                
                db.run(updateOrderQuery, [order_id, order_id], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar total do pedido:', updateErr);
                    }
                });

                res.status(201).json({
                    id: this.lastID,
                    order_id,
                    product_id,
                    quantity,
                    unit_price,
                    total_price,
                    command_number
                });
            });
        });
    });

    // PUT /api/order-items/:id - Atualizar quantidade do item
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
        }

        // Buscar item atual
        db.get('SELECT * FROM table_order_items WHERE id = ?', [id], (err, item) => {
            if (err) {
                console.error('Erro ao buscar item:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!item) {
                return res.status(404).json({ error: 'Item não encontrado' });
            }

            const total_price = item.unit_price * quantity;

            db.run('UPDATE table_order_items SET quantity = ?, total_price = ? WHERE id = ?', 
                [quantity, total_price, id], function(updateErr) {
                if (updateErr) {
                    console.error('Erro ao atualizar item:', updateErr);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }

                // Atualizar total do pedido
                const updateOrderQuery = `
                    UPDATE table_orders 
                    SET total_amount = (
                        SELECT COALESCE(SUM(total_price), 0) 
                        FROM table_order_items 
                        WHERE order_id = ?
                    )
                    WHERE id = ?
                `;
                
                db.run(updateOrderQuery, [item.order_id, item.order_id], (orderUpdateErr) => {
                    if (orderUpdateErr) {
                        console.error('Erro ao atualizar total do pedido:', orderUpdateErr);
                    }
                });

                res.json({ message: 'Item atualizado com sucesso' });
            });
        });
    });

    // PUT /api/order-items/:id/command - Atualizar comanda do item
    router.put('/:id/command', (req, res) => {
        const { id } = req.params;
        const { command_number } = req.body;
        
        if (!command_number || command_number < 1 || command_number > 6) {
            return res.status(400).json({ error: 'Número da comanda deve estar entre 1 e 6' });
        }

        // Verificar se o item existe
        db.get('SELECT * FROM table_order_items WHERE id = ?', [id], (err, item) => {
            if (err) {
                console.error('Erro ao buscar item:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!item) {
                return res.status(404).json({ error: 'Item não encontrado' });
            }

            // Atualizar a comanda do item
            db.run('UPDATE table_order_items SET command_number = ? WHERE id = ?', 
                [command_number, id], function(updateErr) {
                if (updateErr) {
                    console.error('Erro ao atualizar comanda do item:', updateErr);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }

                res.json({ message: 'Comanda do item atualizada com sucesso' });
            });
        });
    });

    // DELETE /api/order-items/:id - Remover item do pedido
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        
        // Buscar order_id antes de deletar
        db.get('SELECT order_id FROM table_order_items WHERE id = ?', [id], (err, item) => {
            if (err) {
                console.error('Erro ao buscar item:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!item) {
                return res.status(404).json({ error: 'Item não encontrado' });
            }

            db.run('DELETE FROM table_order_items WHERE id = ?', [id], function(deleteErr) {
                if (deleteErr) {
                    console.error('Erro ao remover item:', deleteErr);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }

                // Atualizar total do pedido
                const updateOrderQuery = `
                    UPDATE table_orders 
                    SET total_amount = (
                        SELECT COALESCE(SUM(total_price), 0) 
                        FROM table_order_items 
                        WHERE order_id = ?
                    )
                    WHERE id = ?
                `;
                
                db.run(updateOrderQuery, [item.order_id, item.order_id], (updateErr) => {
                    if (updateErr) {
                        console.error('Erro ao atualizar total do pedido:', updateErr);
                    }
                });

                res.json({ message: 'Item removido com sucesso' });
            });
        });
    });

    // PUT /api/order-items/:id/command - Atualizar comanda do item
    router.put('/:id/command', (req, res) => {
        const { id } = req.params;
        const { command_number } = req.body;
        
        if (!command_number || command_number < 1) {
            return res.status(400).json({ error: 'Número da comanda deve ser maior que zero' });
        }

        // Buscar item atual
        db.get('SELECT * FROM table_order_items WHERE id = ?', [id], (err, item) => {
            if (err) {
                console.error('Erro ao buscar item:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (!item) {
                return res.status(404).json({ error: 'Item não encontrado' });
            }

            // Atualizar número da comanda
            db.run('UPDATE table_order_items SET command_number = ? WHERE id = ?', 
                [command_number, id], function(updateErr) {
                if (updateErr) {
                    console.error('Erro ao atualizar comanda do item:', updateErr);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }

                res.json({ 
                    message: 'Comanda do item atualizada com sucesso',
                    item_id: id,
                    new_command: command_number
                });
            });
        });
    });

    return router;
};

module.exports = orderItemRoutes;
