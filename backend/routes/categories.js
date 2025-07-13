const express = require('express');

const categoryRoutes = (db) => {
    const router = express.Router();

    // Listar todas as categorias
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM categories ORDER BY name';
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // Buscar categoria por ID
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM categories WHERE id = ?';
        
        db.get(query, [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            res.json(row);
        });
    });

    // Criar nova categoria
    router.post('/', (req, res) => {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
        
        db.run(query, [name, description], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Categoria já existe' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ 
                id: this.lastID,
                message: 'Categoria criada com sucesso'
            });
        });
    });

    // Atualizar categoria
    router.put('/:id', (req, res) => {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
        
        db.run(query, [name, description, req.params.id], function(err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Categoria já existe' });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Categoria não encontrada' });
            }
            res.json({ message: 'Categoria atualizada com sucesso' });
        });
    });

    // Deletar categoria
    router.delete('/:id', (req, res) => {
        // Verificar se existem produtos associados
        db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (row.count > 0) {
                return res.status(409).json({ error: 'Não é possível deletar categoria com produtos associados' });
            }
            
            const query = 'DELETE FROM categories WHERE id = ?';
            
            db.run(query, [req.params.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Categoria não encontrada' });
                }
                res.json({ message: 'Categoria deletada com sucesso' });
            });
        });
    });

    return router;
};

module.exports = categoryRoutes;
