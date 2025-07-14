# IRONBOX - Sistema de Tabacaria e Distribuidora

Sistema completo de gestão para tabacarias e distribuidoras com **design profissional moderno**, dashboard interativo, controle de estoque, vendas e fornecedores.

## 🎨 **Novo Design Profissional**

O sistema foi completamente redesenhado com um visual moderno e profissional, incluindo:

- **🔮 Glassmorphism Design** - Interface com efeitos de vidro e blur
- **🌈 Gradientes Sofisticados** - Paleta de cores corporativa premium
- **✨ Animações Fluidas** - Transições suaves e efeitos hover elegantes
- **📱 Design Responsivo** - Otimizado para desktop, tablet e mobile
- **🎯 UX/UI Premium** - Interface intuitiva com padrões de design modernos

## Funcionalidades

### 📊 Dashboard
- Visão geral do total de produtos com **cards animados**
- Quantidade de vendas do dia com **métricas em tempo real**
- Quantidade de itens em estoque com **alertas visuais**
- Faturamento total com **formatação de moeda brasileira**
- Produtos mais vendidos em **tabelas estilizadas**
- Alertas de estoque baixo com **indicadores coloridos**
- **Interface glassmorphism** com efeitos de profundidade

### 📦 Produtos
- Cadastro de novos produtos com **formulários modernos**
- Edição de produtos existentes via **modais elegantes**
- Controle de estoque com **validações em tempo real**
- Associação com categorias e fornecedores via **dropdowns estilizados**
- Produtos fictícios para teste com **dados realistas**
- **Tabelas responsivas** com hover effects

### 🏷️ Categorias
- Gestão de categorias de produtos com **interface intuitiva**
- Categorias pré-cadastradas: Cigarros, Charutos, Bebidas, Acessórios, Tabaco
- Adicionar e editar categorias via **modais profissionais**
- **Validação de dependências** antes da exclusão

### 🚚 Fornecedores
- Cadastro de fornecedores com **formulários completos**
- Informações de contato completas organizadas em **cards**
- Fornecedores fictícios para teste com **dados brasileiros**
- Edição de dados dos fornecedores com **interface moderna**
- **Sistema de busca e filtros** visuais

### 💰 Vendas
- Registro de vendas com **cálculos automáticos**
- Controle automático de estoque com **atualizações em tempo real**
- Histórico de vendas em **tabelas organizadas**
- Cancelamento de vendas com **restauração automática** de estoque
- **Validações de estoque** para prevenir overselling

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: 
  - CSS Grid & Flexbox para layouts responsivos
  - Gradientes CSS para efeitos visuais
  - Glassmorphism com backdrop-filter
  - Animações CSS com cubic-bezier
  - Font Awesome para ícones
  - Typography moderna e hierárquica

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

### 🎨 **Design e Interface**
- **Glassmorphism**: Interface com efeitos de vidro e blur modernos
- **Gradientes Dinâmicos**: Paleta de cores corporativa com transições suaves
- **Animações Fluidas**: Transições com cubic-bezier para experiência premium
- **Micro-interações**: Hover effects, scaling e movimentos sutis
- **Typography Moderna**: Hierarquia visual clara com fontes sistema

### 📱 **Responsividade**
- **Design Mobile-First**: Interface adaptável para todos os dispositivos
- **Breakpoints Otimizados**: 768px e 480px para tablet e mobile
- **Grid Flexível**: Layouts que se adaptam automaticamente
- **Touch-Friendly**: Botões e elementos otimizados para touch

### 🔧 **Funcionalidades Técnicas**
- **Validações Completas**: Frontend e backend sincronizados
- **Controle de Estoque**: Atualização automática em tempo real
- **Alertas Inteligentes**: Sistema de notificações visuais
- **Modais Profissionais**: Interface overlay com blur de fundo
- **Formatação Regional**: Moeda e datas em português brasileiro

### ⚡ **Performance**
- **CSS Otimizado**: Código limpo e organizado
- **Animações Performáticas**: GPU-accelerated com transform
- **Loading States**: Indicadores visuais para operações assíncronas
- **Scroll Customizado**: Barras de rolagem estilizadas

## Funcionalidades Especiais

### 🎯 **Interface e Experiência**
- **Header IRONBOX**: Logo com efeitos de gradiente e brilho
- **Navegação Moderna**: Botões com animações de hover e indicadores visuais
- **Cards Interativos**: Estatísticas com ícones animados e sombras dinâmicas
- **Tabelas Profissionais**: Headers com gradiente e rows com hover scaling
- **Formulários Elegantes**: Inputs com focus effects e validação visual

### 🔄 **Controle de Estoque Avançado**
- **Redução Automática**: O sistema reduz automaticamente o estoque ao realizar vendas
- **Alertas Visuais**: Produtos com menos de 10 unidades aparecem no dashboard com cores
- **Validação Inteligente**: Não permite vender mais do que o estoque disponível
- **Restauração**: Cancelamento de vendas restaura o estoque automaticamente

### 🎨 **Efeitos Visuais Modernos**
- **Glassmorphism**: Efeitos de vidro com backdrop-filter em cards e modais
- **Gradientes Múltiplos**: Backgrounds e elementos com degradês sofisticados  
- **Animações CSS**: Transições suaves com cubic-bezier timing functions
- **Hover States**: Micro-interações em botões, cards e elementos clicáveis
- **Loading States**: Spinners animados e estados de carregamento elegantes

### 🔒 **Acessibilidade e Usabilidade**
- **Focus Rings**: Indicadores visuais para navegação por teclado
- **Contrast Ratios**: Cores com contraste adequado para legibilidade
- **Touch Targets**: Elementos com tamanho adequado para dispositivos móveis
- **Screen Reader**: Estrutura semântica para leitores de tela

## Screenshots e Demonstração

### 🖥️ **Interface Principal**
- **Dashboard Moderno**: Cards glassmorphism com métricas em tempo real
- **Header Premium**: Logo IRONBOX com efeitos de gradiente e tipografia elegante
- **Navegação Fluida**: Tabs com animações e indicadores visuais

### 📱 **Versão Mobile**
- **Layout Responsivo**: Design que se adapta perfeitamente a smartphones
- **Touch Optimized**: Botões e elementos otimizados para interação touch
- **Performance Mobile**: Animações suaves mesmo em dispositivos menos potentes

### 🎨 **Elementos Visuais**
- **Paleta de Cores**: Azuis corporativos (#1e3c72, #2a5298, #3498db)
- **Gradientes**: Backgrounds com transições suaves entre cores
- **Sombras**: Múltiplas camadas para profundidade visual
- **Bordas**: Cantos arredondados (20px) para modernidade

---

**💡 Dica**: Acesse `http://localhost:3000` após iniciar o servidor para ver a interface completa em ação!

## 🎨 Melhorias Visuais Implementadas

### **Versão 2.0 - Design Profissional**

#### **🔄 Atualizações Principais:**

1. **Background Moderno**
   - Gradiente dinâmico de fundo (púrpura para azul)
   - Container com glassmorphism e backdrop-filter
   - Bordas arredondadas de 20px para suavidade

2. **Header IRONBOX Renovado**
   - Logo com efeito de gradiente em texto
   - Sombras múltiplas com brilho
   - Background gradiente azul corporativo
   - Efeitos de luz radial sobrepostos

3. **Navegação Premium**
   - Botões com efeitos de hover animados
   - Transições cubic-bezier para suavidade
   - Indicadores visuais aprimorados
   - Efeitos de luz ao passar o mouse

4. **Cards e Elementos**
   - Estatísticas com gradientes e sombras coloridas
   - Ícones com efeitos de profundidade
   - Hover effects com scaling e movimento
   - Glassmorphism em todos os elementos principais

5. **Formulários Modernos**
   - Inputs com focus effects avançados
   - Sombras dinâmicas e bordas coloridas
   - Labels com tipografia aprimorada
   - Validação visual sofisticada

6. **Tabelas Profissionais**
   - Headers com gradiente e linha decorativa
   - Rows com hover scaling sutil
   - Cores zebradas com transparência
   - Bordas arredondadas e sombras

7. **Botões Interativos**
   - Gradientes dinâmicos por categoria
   - Efeitos de luz ao hover
   - Animações de scale e translate
   - Sombras coloridas matching

8. **Modais Elegantes**
   - Backdrop blur para foco
   - Animações de entrada suaves
   - Headers com efeitos visuais
   - Formulários integrados

#### **📱 Responsividade Aprimorada:**
- Breakpoints otimizados (768px, 480px)
- Typography responsiva escalável
- Grid system flexível
- Elementos touch-friendly

#### **⚡ Performance Visual:**
- Animações GPU-accelerated
- CSS otimizado e organizado
- Loading states elegantes
- Scroll bars customizadas

## Suporte e Desenvolvimento

### 🛠️ **Status do Projeto**
- ✅ **v1.0**: Funcionalidades core implementadas
- ✅ **v2.0**: Design profissional e interface moderna
- 🔄 **Em Desenvolvimento**: Novas funcionalidades e otimizações

### 📞 **Contato**
Para dúvidas, sugestões ou melhorias, entre em contato através do sistema de issues do repositório.

### 🤝 **Contribuições**
Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Contribuir com código
- Melhorar a documentação

---

**🏢 IRONBOX** - Sistema de Tabacaria e Distribuidora **v2.0**  
*Desenvolvido com tecnologias modernas e design profissional*
