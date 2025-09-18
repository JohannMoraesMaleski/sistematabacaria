const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Listar todos os mensalistas
    router.get('/', (req, res) => {
    const sql = 'SELECT * FROM subscribers ORDER BY name';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar mensalistas' });
            return;
        }
        res.json(rows);
    });
});

// Buscar mensalista por ID
router.get('/:id', (req, res) => {
    const sql = 'SELECT * FROM subscribers WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao buscar mensalista' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Mensalista não encontrado' });
            return;
        }
        res.json(row);
    });
});

// Criar novo mensalista
router.post('/', (req, res) => {
    const { name, phone, payment_day } = req.body;
    
    if (!name || !phone || !payment_day) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
    }

    const sql = `
        INSERT INTO subscribers (name, phone, payment_day)
        VALUES (?, ?, ?)
    `;
    
    db.run(sql, [name, phone, payment_day], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao criar mensalista' });
            return;
        }
        res.status(201).json({ id: this.lastID, name, phone, payment_day });
    });
});

// Atualizar mensalista
router.put('/:id', (req, res) => {
    const { name, phone, payment_day } = req.body;
    
    if (!name || !phone || !payment_day) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
    }

    const sql = `
        UPDATE subscribers 
        SET name = ?, phone = ?, payment_day = ?
        WHERE id = ?
    `;
    
    db.run(sql, [name, phone, payment_day, req.params.id], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao atualizar mensalista' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Mensalista não encontrado' });
            return;
        }
        res.json({ id: req.params.id, name, phone, payment_day });
    });
});

// Excluir mensalista
router.delete('/:id', (req, res) => {
    const sql = 'DELETE FROM subscribers WHERE id = ?';
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao excluir mensalista' });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Mensalista não encontrado' });
            return;
        }
        res.json({ message: 'Mensalista excluído com sucesso' });
    });
});

    return router;
};