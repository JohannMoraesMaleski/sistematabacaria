const express = require('express');

const tableRoutes = (db) => {
    const router = express.Router();

// GET /api/tables - Listar todas as mesas
router.get('/', (req, res) => {
    const query = `
        SELECT 
            t.*,
            tord.id as current_order_id,
            tord.customer_name,
            tord.total_amount,
            tord.opened_at as order_opened_at,
            tord.command_count,
            tord.command_names
        FROM tables t
        LEFT JOIN table_orders tord ON t.id = tord.table_id AND tord.status = 'open'
        ORDER BY t.number
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar mesas:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        res.json(rows);
    });
});

// POST /api/tables - Criar nova mesa
router.post('/', (req, res) => {
    const { number, capacity } = req.body;
    
    if (!number || !capacity) {
        return res.status(400).json({ error: 'Número e capacidade são obrigatórios' });
    }
    
    const query = 'INSERT INTO tables (number, capacity) VALUES (?, ?)';
    
    db.run(query, [number, capacity], function(err) {
        if (err) {
            console.error('Erro ao criar mesa:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Já existe uma mesa com este número' });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        res.status(201).json({
            id: this.lastID,
            number,
            capacity,
            status: 'available'
        });
    });
});

// PUT /api/tables/:id - Atualizar mesa
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { number, capacity, status } = req.body;
    
    const query = 'UPDATE tables SET number = ?, capacity = ?, status = ? WHERE id = ?';
    
    db.run(query, [number, capacity, status, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar mesa:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Já existe uma mesa com este número' });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        
        res.json({ message: 'Mesa atualizada com sucesso' });
    });
});

// DELETE /api/tables/:id - Deletar mesa
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar se mesa tem pedidos ativos
    db.get('SELECT id FROM table_orders WHERE table_id = ? AND status = "open"', [id], (err, row) => {
        if (err) {
            console.error('Erro ao verificar pedidos:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (row) {
            return res.status(400).json({ error: 'Não é possível deletar mesa com pedidos ativos' });
        }
        
        db.run('DELETE FROM tables WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Erro ao deletar mesa:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Mesa não encontrada' });
            }
            
            res.json({ message: 'Mesa deletada com sucesso' });
        });
    });
});

// POST /api/tables/:id/open - Abrir mesa
router.post('/:id/open', (req, res) => {
    const { id } = req.params;
    const { customer_name, command_count, command_names } = req.body;
    
    // Verificar se mesa existe e está disponível
    db.get('SELECT * FROM tables WHERE id = ? AND status = "available"', [id], (err, table) => {
        if (err) {
            console.error('Erro ao verificar mesa:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!table) {
            return res.status(400).json({ error: 'Mesa não encontrada ou não disponível' });
        }
        
        // Criar pedido com suporte a comandas múltiplas
        const orderQuery = `
            INSERT INTO table_orders (table_id, customer_name, command_count, command_names) 
            VALUES (?, ?, ?, ?)
        `;
        
        db.run(orderQuery, [
            id, 
            customer_name || '', 
            command_count || 1, 
            command_names || JSON.stringify([customer_name])
        ], function(err) {
            if (err) {
                console.error('Erro ao criar pedido:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            // Atualizar status da mesa
            db.run('UPDATE tables SET status = "occupied" WHERE id = ?', [id], (err) => {
                if (err) {
                    console.error('Erro ao atualizar mesa:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                res.json({
                    message: 'Mesa aberta com sucesso',
                    order_id: this.lastID
                });
            });
        });
    });
});

// POST /api/tables/:id/close - Fechar mesa
router.post('/:id/close', (req, res) => {
    const { id } = req.params;
    
    // Buscar pedido ativo
    db.get('SELECT * FROM table_orders WHERE table_id = ? AND status = "open"', [id], (err, order) => {
        if (err) {
            console.error('Erro ao buscar pedido:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!order) {
            return res.status(400).json({ error: 'Nenhum pedido ativo encontrado para esta mesa' });
        }
        
        // Fechar pedido
        db.run('UPDATE table_orders SET status = "closed", closed_at = CURRENT_TIMESTAMP WHERE id = ?', [order.id], (err) => {
            if (err) {
                console.error('Erro ao fechar pedido:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            // Liberar mesa
            db.run('UPDATE tables SET status = "available" WHERE id = ?', [id], (err) => {
                if (err) {
                    console.error('Erro ao liberar mesa:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                res.json({
                    message: 'Mesa fechada com sucesso',
                    total_amount: order.total_amount
                });
            });
        });
    });
});

// GET /api/tables/:id - Buscar mesa específica
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            t.*,
            tord.id as current_order_id,
            tord.customer_name,
            tord.total_amount,
            tord.opened_at as order_opened_at,
            tord.command_count,
            tord.command_names,
            w.name as waiter_name
        FROM tables t
        LEFT JOIN table_orders tord ON t.id = tord.table_id AND tord.status = 'open'
        LEFT JOIN waiters w ON tord.waiter_id = w.id
        WHERE t.id = ?
    `;
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar mesa:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Mesa não encontrada' });
        }
        
        res.json(row);
    });
});

    return router;
};

module.exports = tableRoutes;
