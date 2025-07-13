const express = require('express');

const supplierRoutes = (db) => {
    const router = express.Router();

    // Listar todos os fornecedores
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM suppliers ORDER BY name';
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // Buscar fornecedor por ID
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM suppliers WHERE id = ?';
        
        db.get(query, [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Fornecedor não encontrado' });
            }
            res.json(row);
        });
    });

    // Criar novo fornecedor
    router.post('/', (req, res) => {
        const { name, contact_person, email, phone, address } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        const query = `
            INSERT INTO suppliers (name, contact_person, email, phone, address)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(query, [name, contact_person, email, phone, address], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ 
                id: this.lastID,
                message: 'Fornecedor criado com sucesso'
            });
        });
    });

    // Atualizar fornecedor
    router.put('/:id', (req, res) => {
        const { name, contact_person, email, phone, address } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        const query = `
            UPDATE suppliers 
            SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?
            WHERE id = ?
        `;
        
        db.run(query, [name, contact_person, email, phone, address, req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Fornecedor não encontrado' });
            }
            res.json({ message: 'Fornecedor atualizado com sucesso' });
        });
    });

    // Deletar fornecedor
    router.delete('/:id', (req, res) => {
        // Verificar se existem produtos associados
        db.get('SELECT COUNT(*) as count FROM products WHERE supplier_id = ?', [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (row.count > 0) {
                return res.status(409).json({ error: 'Não é possível deletar fornecedor com produtos associados' });
            }
            
            const query = 'DELETE FROM suppliers WHERE id = ?';
            
            db.run(query, [req.params.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Fornecedor não encontrado' });
                }
                res.json({ message: 'Fornecedor deletado com sucesso' });
            });
        });
    });

    return router;
};

module.exports = supplierRoutes;
