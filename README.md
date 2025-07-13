# IRONBOX - Sistema de Tabacaria e Distribuidora

Sistema completo de gestão para tabacarias e distribuidoras com dashboard, controle de estoque, vendas e fornecedores.

## Funcionalidades

### 📊 Dashboard
- Visão geral do total de produtos
- Quantidade de vendas do dia
- Quantidade de itens em estoque
- Faturamento total
- Produtos mais vendidos
- Alertas de estoque baixo

### 📦 Produtos
- Cadastro de novos produtos
- Edição de produtos existentes
- Controle de estoque
- Associação com categorias e fornecedores
- Produtos fictícios para teste

### 🏷️ Categorias
- Gestão de categorias de produtos
- Categorias pré-cadastradas: Cigarros, Charutos, Bebidas, Acessórios, Tabaco
- Adicionar e editar categorias

### 🚚 Fornecedores
- Cadastro de fornecedores
- Informações de contato completas
- Fornecedores fictícios para teste
- Edição de dados dos fornecedores

### 💰 Vendas
- Registro de vendas
- Controle automático de estoque
- Histórico de vendas
- Cancelamento de vendas com restauração de estoque

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilo**: CSS Grid, Flexbox, Font Awesome

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm

### Passos para executar

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd sistematabacaria2.0
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o servidor**
   ```bash
   npm start
   ```

4. **Acesse o sistema**
   - Abra o navegador e acesse: `http://localhost:3000`

## Estrutura do Projeto

```
sistematabacaria2.0/
├── backend/
│   └── routes/
│       ├── products.js
│       ├── categories.js
│       ├── suppliers.js
│       ├── sales.js
│       └── dashboard.js
├── database/
│   ├── init.js
│   └── ironbox.db (criado automaticamente)
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .github/
│   └── copilot-instructions.md
├── server.js
├── package.json
└── README.md
```

## Dados de Teste

O sistema vem com dados fictícios pré-cadastrados para facilitar os testes:

### Categorias
- Cigarros
- Charutos
- Bebidas
- Acessórios
- Tabaco

### Fornecedores
- Philip Morris Brasil
- British American Tobacco
- Ambev Distribuidora
- Davidoff do Brasil
- Zippo Brasil

### Produtos
- Marlboro Gold
- Lucky Strike
- Montecristo No.4
- Cohiba Robusto
- Whisky Johnnie Walker
- Cerveja Heineken
- Isqueiro Zippo
- Cinzeiro Cristal
- Tabaco Amsterdamer
- Papel Smoking

## API Endpoints

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria

### Fornecedores
- `GET /api/suppliers` - Listar fornecedores
- `POST /api/suppliers` - Criar fornecedor
- `PUT /api/suppliers/:id` - Atualizar fornecedor
- `DELETE /api/suppliers/:id` - Deletar fornecedor

### Vendas
- `GET /api/sales` - Listar vendas
- `POST /api/sales` - Criar venda
- `DELETE /api/sales/:id` - Cancelar venda

### Dashboard
- `GET /api/dashboard` - Dados do dashboard
- `GET /api/dashboard/low-stock` - Produtos com estoque baixo

## Características Técnicas

- **Responsivo**: Interface adaptável para desktop e mobile
- **Validações**: Validação de dados no frontend e backend
- **Controle de Estoque**: Atualização automática do estoque nas vendas
- **Alertas**: Notificações de estoque baixo no dashboard
- **Modais**: Interface amigável com modais para cadastros
- **Formatação**: Formatação de moeda e datas em português brasileiro

## Funcionalidades Especiais

- **Controle de Estoque**: O sistema reduz automaticamente o estoque ao realizar vendas
- **Alertas de Estoque Baixo**: Produtos com menos de 10 unidades aparecem no dashboard
- **Cancelamento de Vendas**: Possibilidade de cancelar vendas e restaurar o estoque
- **Validações**: Não permite vender mais do que o estoque disponível
- **Interface Intuitiva**: Design moderno e fácil de usar

## Suporte

Para dúvidas ou sugestões, entre em contato através do sistema de issues do repositório.

---

**IRONBOX** - Sistema de Tabacaria e Distribuidora v1.0
