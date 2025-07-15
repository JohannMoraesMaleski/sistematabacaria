const express = require('express');

const waiterRoutes = (db) => {
    const router = express.Router();

    // GET /api/waiters - Listar todos os garçons
    router.get('/', (req, res) => {
        const query = `
            SELECT * FROM waiters 
            WHERE active = 1 
            ORDER BY name
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar garçons:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.json(rows);
        });
    });

    // POST /api/waiters - Criar novo garçom
    router.post('/', (req, res) => {
        const { name, cpf, phone, email, shift, commission_rate } = req.body;
        
        if (!name || !shift) {
            return res.status(400).json({ error: 'Nome e turno são obrigatórios' });
        }
        
        const query = `
            INSERT INTO waiters (name, cpf, phone, email, shift, commission_rate) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [name, cpf, phone, email, shift, commission_rate || 5.00], function(err) {
            if (err) {
                console.error('Erro ao criar garçom:', err);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'CPF já cadastrado' });
                }
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.status(201).json({
                id: this.lastID,
                name,
                cpf,
                phone,
                email,
                shift,
                commission_rate: commission_rate || 5.00
            });
        });
    });

    // PUT /api/waiters/:id - Atualizar garçom
    router.put('/:id', (req, res) => {
        const { id } = req.params;
        const { name, cpf, phone, email, shift, commission_rate, active } = req.body;
        
        const query = `
            UPDATE waiters 
            SET name = ?, cpf = ?, phone = ?, email = ?, shift = ?, commission_rate = ?, active = ?
            WHERE id = ?
        `;
        
        db.run(query, [name, cpf, phone, email, shift, commission_rate, active, id], function(err) {
            if (err) {
                console.error('Erro ao atualizar garçom:', err);
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'CPF já cadastrado' });
                }
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Garçom não encontrado' });
            }
            
            res.json({ message: 'Garçom atualizado com sucesso' });
        });
    });

    // DELETE /api/waiters/:id - Desativar garçom
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        
        db.run('UPDATE waiters SET active = 0 WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Erro ao desativar garçom:', err);
                return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Garçom não encontrado' });
            }
            
            res.json({ message: 'Garçom desativado com sucesso' });
        });
    });

    return router;
};

module.exports = waiterRoutes;
