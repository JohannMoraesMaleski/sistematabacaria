const initDB = (db) => {
    // Criar tabelas
    db.serialize(() => {
        // Tabela de categorias
        db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de fornecedores
        db.run(`
            CREATE TABLE IF NOT EXISTS suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact_person TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de produtos
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock_quantity INTEGER NOT NULL DEFAULT 0,
                category_id INTEGER,
                supplier_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id),
                FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
            )
        `);

        // Tabela de vendas
        db.run(`
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Criação da tabela de mesas
        db.run(`
            CREATE TABLE IF NOT EXISTS tables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number INTEGER UNIQUE NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 4,
                status TEXT CHECK(status IN ('available', 'occupied', 'reserved')) DEFAULT 'available',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Criação da tabela de pedidos de mesa
        db.run(`
            CREATE TABLE IF NOT EXISTS table_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_id INTEGER NOT NULL,
                customer_name TEXT,
                opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                closed_at DATETIME,
                total_amount DECIMAL(10,2) DEFAULT 0,
                status TEXT CHECK(status IN ('open', 'closed', 'cancelled')) DEFAULT 'open',
                FOREIGN KEY (table_id) REFERENCES tables(id)
            )
        `);

        // Criação da tabela de itens do pedido de mesa
        db.run(`
            CREATE TABLE IF NOT EXISTS table_order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES table_orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Tabela de garçons
        db.run(`
            CREATE TABLE IF NOT EXISTS waiters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cpf TEXT UNIQUE,
                phone TEXT,
                email TEXT,
                shift TEXT CHECK(shift IN ('manhã', 'tarde', 'noite', 'integral')),
                commission_rate DECIMAL(5,2) DEFAULT 5.00,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de métodos de pagamento
        db.run(`
            CREATE TABLE IF NOT EXISTS payment_methods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                type TEXT CHECK(type IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outros')),
                fee_percentage DECIMAL(5,2) DEFAULT 0.00,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Atualizar tabela de pedidos para incluir garçom
        db.run(`
            ALTER TABLE table_orders ADD COLUMN waiter_id INTEGER REFERENCES waiters(id)
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna waiter_id:', err);
            }
        });

        // Atualizar tabela de pedidos para incluir método de pagamento
        db.run(`
            ALTER TABLE table_orders ADD COLUMN payment_method_id INTEGER REFERENCES payment_methods(id)
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna payment_method_id:', err);
            }
        });

        // Atualizar tabela table_order_items para usar produtos
        db.run(`
            ALTER TABLE table_order_items ADD COLUMN product_id INTEGER REFERENCES products(id)
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna product_id:', err);
            }
        });

        db.run(`
            ALTER TABLE table_order_items ADD COLUMN quantity INTEGER DEFAULT 1
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna quantity:', err);
            }
        });

        db.run(`
            ALTER TABLE table_order_items ADD COLUMN unit_price DECIMAL(10,2)
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna unit_price:', err);
            }
        });

        db.run(`
            ALTER TABLE table_order_items ADD COLUMN subtotal DECIMAL(10,2)
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna subtotal:', err);
            }
        });

        // Inserir métodos de pagamento padrão
        db.run(`
            INSERT OR IGNORE INTO payment_methods (name, type, fee_percentage) VALUES 
            ('Dinheiro', 'dinheiro', 0.00),
            ('PIX', 'pix', 0.00),
            ('Cartão de Débito', 'cartao_debito', 2.50),
            ('Cartão de Crédito', 'cartao_credito', 3.50)
        `, (err) => {
            if (err) {
                console.error('Erro ao inserir métodos de pagamento:', err);
            } else {
                console.log('✅ Métodos de pagamento inseridos com sucesso');
            }
        });

        // Inserir garçons padrão
        db.run(`
            INSERT OR IGNORE INTO waiters (name, shift, commission_rate) VALUES 
            ('João Silva', 'manhã', 5.00),
            ('Maria Santos', 'tarde', 5.00),
            ('Pedro Costa', 'noite', 6.00),
            ('Ana Oliveira', 'integral', 4.50)
        `, (err) => {
            if (err) {
                console.error('Erro ao inserir garçons:', err);
            } else {
                console.log('✅ Garçons padrão inseridos com sucesso');
            }
        });

        // Inserir dados fictícios
        insertSampleData(db);
    });
};

const insertSampleData = (db) => {
    // Inserir categorias
    const categories = [
        { name: 'Cigarros', description: 'Cigarros nacionais e importados' },
        { name: 'Charutos', description: 'Charutos premium e tradicionais' },
        { name: 'Bebidas', description: 'Bebidas alcoólicas e não alcoólicas' },
        { name: 'Acessórios', description: 'Isqueiros, cinzeiros e outros acessórios' },
        { name: 'Tabaco', description: 'Tabaco para cachimbo e enrolar' }
    ];

    categories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`, 
            [category.name, category.description]);
    });

    // Inserir fornecedores
    const suppliers = [
        { name: 'Philip Morris Brasil', contact_person: 'João Silva', email: 'joao@philipmorris.com', phone: '(11) 3456-7890', address: 'São Paulo, SP' },
        { name: 'British American Tobacco', contact_person: 'Maria Santos', email: 'maria@bat.com', phone: '(21) 2345-6789', address: 'Rio de Janeiro, RJ' },
        { name: 'Ambev Distribuidora', contact_person: 'Carlos Oliveira', email: 'carlos@ambev.com', phone: '(11) 4567-8901', address: 'São Paulo, SP' },
        { name: 'Davidoff do Brasil', contact_person: 'Ana Costa', email: 'ana@davidoff.com', phone: '(11) 5678-9012', address: 'São Paulo, SP' },
        { name: 'Zippo Brasil', contact_person: 'Pedro Lima', email: 'pedro@zippo.com', phone: '(11) 6789-0123', address: 'São Paulo, SP' }
    ];

    suppliers.forEach(supplier => {
        db.run(`INSERT OR IGNORE INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`, 
            [supplier.name, supplier.contact_person, supplier.email, supplier.phone, supplier.address]);
    });

    // Aguardar inserção de categorias e fornecedores antes de inserir produtos
    setTimeout(() => {
        // Inserir produtos
        const products = [
            { name: 'Marlboro Gold', description: 'Cigarro Marlboro Gold maço', price: 12.50, stock_quantity: 100, category_id: 1, supplier_id: 1 },
            { name: 'Lucky Strike', description: 'Cigarro Lucky Strike maço', price: 11.80, stock_quantity: 80, category_id: 1, supplier_id: 2 },
            { name: 'Montecristo No.4', description: 'Charuto Montecristo premium', price: 45.00, stock_quantity: 25, category_id: 2, supplier_id: 4 },
            { name: 'Cohiba Robusto', description: 'Charuto Cohiba premium', price: 65.00, stock_quantity: 15, category_id: 2, supplier_id: 4 },
            { name: 'Whisky Johnnie Walker', description: 'Whisky Johnnie Walker Red Label', price: 85.00, stock_quantity: 30, category_id: 3, supplier_id: 3 },
            { name: 'Cerveja Heineken', description: 'Cerveja Heineken long neck', price: 8.50, stock_quantity: 200, category_id: 3, supplier_id: 3 },
            { name: 'Isqueiro Zippo', description: 'Isqueiro Zippo clássico', price: 125.00, stock_quantity: 40, category_id: 4, supplier_id: 5 },
            { name: 'Cinzeiro Cristal', description: 'Cinzeiro de cristal premium', price: 35.00, stock_quantity: 20, category_id: 4, supplier_id: 5 },
            { name: 'Tabaco Amsterdamer', description: 'Tabaco para cachimbo Amsterdamer', price: 22.00, stock_quantity: 60, category_id: 5, supplier_id: 2 },
            { name: 'Papel Smoking', description: 'Papel para enrolar cigarro', price: 4.50, stock_quantity: 150, category_id: 5, supplier_id: 1 }
        ];

        products.forEach(product => {
            db.run(`INSERT OR IGNORE INTO products (name, description, price, stock_quantity, category_id, supplier_id) VALUES (?, ?, ?, ?, ?, ?)`, 
                [product.name, product.description, product.price, product.stock_quantity, product.category_id, product.supplier_id]);
        });

        // Inserir algumas vendas de exemplo
        setTimeout(() => {
            const sales = [
                { product_id: 1, quantity: 5, unit_price: 12.50, total_price: 62.50 },
                { product_id: 2, quantity: 3, unit_price: 11.80, total_price: 35.40 },
                { product_id: 6, quantity: 12, unit_price: 8.50, total_price: 102.00 },
                { product_id: 7, quantity: 1, unit_price: 125.00, total_price: 125.00 },
                { product_id: 10, quantity: 8, unit_price: 4.50, total_price: 36.00 }
            ];

            sales.forEach(sale => {
                db.run(`INSERT INTO sales (product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?)`, 
                    [sale.product_id, sale.quantity, sale.unit_price, sale.total_price]);
            });
        }, 1000);
    }, 500);

    // Inserir mesas padrão se não existirem
    const insertDefaultTables = `
        INSERT OR IGNORE INTO tables (number, capacity) VALUES
        (1, 4), (2, 4), (3, 2), (4, 6), (5, 4),
        (6, 2), (7, 4), (8, 4), (9, 2), (10, 6)
    `;

    db.run(insertDefaultTables, (err) => {
        if (err) {
            console.error('Erro ao inserir mesas padrão:', err);
        } else {
            console.log('✅ Mesas padrão inseridas com sucesso');
        }
    });
};

module.exports = initDB;
