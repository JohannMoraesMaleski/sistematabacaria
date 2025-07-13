const express = require('express');

const productRoutes = (db) => {
    const router = express.Router();

    // Listar todos os produtos
    router.get('/', (req, res) => {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.name
        `;
        
        db.all(query, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    });

    // Buscar produto por ID
    router.get('/:id', (req, res) => {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
        `;
        
        db.get(query, [req.params.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json(row);
        });
    });

    // Criar novo produto
    router.post('/', (req, res) => {
        const { name, description, price, stock_quantity, category_id, supplier_id } = req.body;
        
        if (!name || !price || stock_quantity === undefined) {
            return res.status(400).json({ error: 'Nome, preço e quantidade são obrigatórios' });
        }

        const query = `
            INSERT INTO products (name, description, price, stock_quantity, category_id, supplier_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(query, [name, description, price, stock_quantity, category_id, supplier_id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ 
                id: this.lastID,
                message: 'Produto criado com sucesso'
            });
        });
    });

    // Atualizar produto
    router.put('/:id', (req, res) => {
        const { name, description, price, stock_quantity, category_id, supplier_id } = req.body;
        
        if (!name || !price || stock_quantity === undefined) {
            return res.status(400).json({ error: 'Nome, preço e quantidade são obrigatórios' });
        }

        const query = `
            UPDATE products 
            SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, supplier_id = ?
            WHERE id = ?
        `;
        
        db.run(query, [name, description, price, stock_quantity, category_id, supplier_id, req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json({ message: 'Produto atualizado com sucesso' });
        });
    });

    // Deletar produto
    router.delete('/:id', (req, res) => {
        const query = 'DELETE FROM products WHERE id = ?';
        
        db.run(query, [req.params.id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }
            res.json({ message: 'Produto deletado com sucesso' });
        });
    });

    return router;
};

module.exports = productRoutes;
