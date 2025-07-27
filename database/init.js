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
                name TEXT,
                number INTEGER UNIQUE NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 4,
                description TEXT,
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

        // Adicionar colunas para suporte a comandas múltiplas
        db.run(`
            ALTER TABLE table_orders ADD COLUMN command_count INTEGER DEFAULT 1
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna command_count:', err);
            }
        });

        db.run(`
            ALTER TABLE table_orders ADD COLUMN command_names TEXT
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna command_names:', err);
            }
        });

        // Adicionar coluna para identificar a qual comanda pertence cada item
        db.run(`
            ALTER TABLE table_order_items ADD COLUMN command_number INTEGER DEFAULT 1
        `, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Erro ao adicionar coluna command_number:', err);
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

        // Inserir dados essenciais do sistema (sem dados fictícios)
        insertEssentialData(db);
    });
};

const insertEssentialData = (db) => {
    // Inserir apenas dados essenciais para o funcionamento do sistema
    
    // Garçom padrão para sistema funcionar (usuário pode adicionar mais depois)
    db.run(`
        INSERT OR IGNORE INTO waiters (name, shift, commission_rate) VALUES 
        ('Atendente Padrão', 'integral', 0.00)
    `, (err) => {
        if (err) {
            console.error('Erro ao inserir garçom padrão:', err);
        } else {
            console.log('✅ Garçom padrão inserido com sucesso');
        }
    });

    // Algumas mesas básicas para demonstração (usuário pode adicionar/remover)
    const insertBasicTables = `
        INSERT OR IGNORE INTO tables (number, capacity) VALUES
        (1, 4), (2, 4), (3, 2), (4, 6)
    `;

    db.run(insertBasicTables, (err) => {
        if (err) {
            console.error('Erro ao inserir mesas básicas:', err);
        } else {
            console.log('✅ Mesas básicas inseridas com sucesso');
        }
    });

    // Sistema iniciará sem:
    // - Produtos fictícios
    // - Categorias fictícias  
    // - Fornecedores fictícios
    // - Vendas fictícias
    console.log('🎯 Sistema iniciado LIMPO - Pronto para dados reais do cliente');
};

module.exports = initDB;
