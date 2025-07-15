# IRONBOX - Sistema de Tabacaria e Distribuidora

Sistema completo de gestão para tabacarias e distribuidoras com design profissional moderno, dashboard interativo, controle de estoque, vendas, mesas e relatórios.

## Nova Versão 4.0 - Sistema de Comandas e Relatórios

A versão 4.0 traz funcionalidades avançadas para controle de mesas e relatórios analíticos:

- **Sistema de Comandas Completo** - Gestão de pedidos por mesa com adição/remoção de itens
- **Dashboard Visual de Mesas** - Visualização em tempo real do status das mesas
- **Relatórios Analíticos** - Dashboards com métricas de ocupação, faturamento e performance
- **Interface Aprimorada** - Layout responsivo e intuitivo para todas as funcionalidades
- **Performance Otimizada** - Correção de problemas de memória e otimizações

## Nova Versão - Design Profissional e UX Aprimorada

O sistema foi completamente redesenhado com um visual moderno e profissional, incluindo:

- **Glassmorphism Design** - Interface com efeitos de vidro e blur
- **Gradientes Sofisticados** - Paleta de cores corporativa premium
- **Animações Fluidas** - Transições suaves e efeitos hover elegantes
- **Design Responsivo** - Otimizado para desktop, tablet e mobile
- **UX/UI Premium** - Interface intuitiva com padrões de design modernos
- **Botões Ultra-Responsivos** - Feedback visual instantâneo e animações suaves
- **Micro-Interações Avançadas** - Efeitos ripple, loading states e transições otimizadas

## Funcionalidades

### Dashboard
- Visão geral do total de produtos com cards animados
- Quantidade de vendas do dia com métricas em tempo real
- Quantidade de itens em estoque com alertas visuais
- Faturamento total com formatação de moeda brasileira
- Produtos mais vendidos em tabelas estilizadas
- Alertas de estoque baixo com indicadores coloridos
- Interface glassmorphism com efeitos de profundidade

### Produtos
- Cadastro de novos produtos com formulários modernos
- Edição de produtos existentes via modais elegantes
- Controle de estoque com validações em tempo real
- Associação com categorias e fornecedores via dropdowns estilizados
- Produtos fictícios para teste com dados realistas
- Tabelas responsivas com hover effects

### Categorias
- Gestão de categorias de produtos com interface intuitiva
- Categorias pré-cadastradas: Cigarros, Charutos, Bebidas, Acessórios, Tabaco
- Adicionar e editar categorias via modais profissionais
- Validação de dependências antes da exclusão

### Fornecedores
- Cadastro de fornecedores com formulários completos
- Informações de contato completas organizadas em cards
- Fornecedores fictícios para teste com dados brasileiros
- Edição de dados dos fornecedores com interface moderna
- Sistema de busca e filtros visuais

### Vendas
- Registro de vendas com cálculos automáticos
- Controle automático de estoque com atualizações em tempo real
- Histórico de vendas em tabelas organizadas
- Cancelamento de vendas com restauração automática de estoque
- Validações de estoque para prevenir overselling

### Mesas e Comandas
- **Dashboard Visual de Mesas** - Grid com status em tempo real (disponível, ocupada, manutenção)
- **Sistema de Comandas** - Gestão completa de pedidos por mesa
- **Abertura/Fechamento de Mesas** - Controle de ocupação com informações do cliente
- **Adição de Itens** - Interface intuitiva para adicionar produtos aos pedidos
- **Gerenciamento de Pedidos** - Editar quantidades, remover itens, calcular totais
- **Informações Detalhadas** - Cliente, garçom, valor total, tempo de abertura

### Relatórios Analíticos
- **Relatório de Ocupação** - Análise de uso das mesas, tempo médio e faturamento
- **Performance de Garçons** - Vendas, comissões, pedidos ativos por funcionário
- **Relatório de Faturamento** - Análise por período com divisão por método de pagamento
- **Itens Mais Vendidos** - Top produtos com quantidades e receita gerada
- **Filtros Dinâmicos** - Por data, período (hoje, 7 dias, 30 dias, personalizado)
- **Interface Responsiva** - Tabelas bem formatadas com totais e estatísticas

## Funcionalidades da Versão 4.0

### Sistema de Comandas
- **Abertura de Mesas**: Interface para abrir mesas com informações do cliente
- **Gestão de Pedidos**: Modal completo para gerenciar comandas
- **Adição de Itens**: Seleção de produtos com cálculo automático de preços
- **Controle de Quantidades**: Edição em tempo real das quantidades
- **Remoção de Itens**: Sistema para remover produtos do pedido
- **Cálculo de Totais**: Atualização automática do valor total do pedido
- **Fechamento de Mesas**: Processo para finalizar pedidos e liberar mesas

### Dashboard Visual de Mesas
- **Grid Responsivo**: Layout em cards adaptável para diferentes telas
- **Status Visual**: Cores diferentes para cada status (disponível, ocupada, manutenção)
- **Informações Detalhadas**: Capacidade, cliente, valor e tempo de abertura
- **Ações Contextuais**: Botões específicos para cada status da mesa
- **Atualização em Tempo Real**: Interface sincronizada com o banco de dados

### Relatórios Analíticos
- **Relatório de Ocupação**: 
  - Taxa de ocupação por mesa
  - Tempo médio de permanência
  - Faturamento por mesa
  - Último uso de cada mesa
- **Performance de Garçons**:
  - Total de vendas por funcionário
  - Quantidade de pedidos atendidos
  - Comissões calculadas automaticamente
  - Pedidos ativos por garçom
- **Relatório de Faturamento**:
  - Análise por período configurável
  - Divisão por método de pagamento
  - Ticket médio e total de pedidos
  - Gráficos e métricas visuais
- **Itens Mais Vendidos**:
  - Ranking de produtos por quantidade
  - Receita gerada por produto
  - Frequência de pedidos
  - Análise de preços médios

### Melhorias Técnicas
- **Otimização de Memória**: Aumento do limite para 2GB (--max-old-space-size=2048)
- **Correção de Bugs**: Resolvidos problemas de nomenclatura de colunas no banco
- **Validações Aprimoradas**: Controle rigoroso de dados e estoque
- **API RESTful**: Endpoints organizados e documentados
- **Interface Moderna**: Estilos CSS aprimorados para as novas funcionalidades

### Dados de Teste Expandidos
- **10 Mesas**: Pré-cadastradas com diferentes capacidades
- **Garçons**: 4 funcionários com turnos e comissões configuradas
- **Métodos de Pagamento**: Dinheiro, PIX, cartões de débito e crédito
- **Produtos Diversificados**: Mais de 40 produtos em diferentes categorias

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design e UX**: 
  - CSS Grid & Flexbox para layouts responsivos
  - Gradientes CSS para efeitos visuais
  - Glassmorphism com backdrop-filter
  - Animações CSS com cubic-bezier otimizadas
  - Font Awesome para ícones
  - Typography moderna e hierárquica
  - Sistema de design responsivo com breakpoints
  - Micro-interações e feedback visual avançado

## Melhorias de UX e Responsividade - Versão 3.0

### Transições Ultra-Suaves
- **Animações aprimoradas** com cubic-bezier para movimento natural
- **Efeitos ripple** nos cliques para feedback visual instantâneo
- **Micro-animações** nos ícones dos botões com rotação e escala
- **60fps garantidos** com hardware acceleration
- **Transições de 400ms** otimizadas para fluidez

### Responsividade Avançada
- **Botões adaptativos** que se redimensionam em dispositivos móveis
- **Touch targets** de pelo menos 44px para facilitar o toque
- **Layout flexível** dos botões em telas pequenas
- **Otimizações específicas** para tablets e smartphones
- **Breakpoints otimizados** em 768px e 480px

### Feedback Visual Aprimorado
- **Estados de loading** com spinner animado
- **Estados de sucesso/erro** com cores e animações específicas
- **Hover effects** mais suaves e responsivos
- **Efeitos de pressionamento** para feedback tátil
- **Indicadores visuais** para todas as ações

### Acessibilidade Melhorada
- **Focus indicators** mais visíveis para navegação por teclado
- **High contrast mode** support
- **Reduced motion** support para usuários sensíveis
- **ARIA labels** e tooltips informativos
- **Keyboard navigation** otimizada

### Performance Otimizada
- **Will-change** properties para otimização GPU
- **Event delegation** para melhor performance
- **Debounced animations** em dispositivos móveis
- **Hardware acceleration** em todas as transições
- **Otimizações específicas** para mobile

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
│       ├── dashboard.js
│       ├── tables.js
│       ├── order-items.js
│       ├── reports.js
│       ├── waiters.js
│       └── payments.js
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

### Mesas
- `GET /api/tables` - Listar todas as mesas
- `GET /api/tables/:id` - Buscar mesa específica
- `POST /api/tables` - Criar nova mesa
- `POST /api/tables/:id/open` - Abrir mesa
- `POST /api/tables/:id/close` - Fechar mesa
- `PUT /api/tables/:id` - Atualizar mesa
- `DELETE /api/tables/:id` - Deletar mesa

### Itens de Pedido (Comandas)
- `GET /api/order-items/:orderId` - Listar itens de um pedido
- `POST /api/order-items` - Adicionar item ao pedido
- `PUT /api/order-items/:id` - Atualizar quantidade do item
- `DELETE /api/order-items/:id` - Remover item do pedido

### Relatórios
- `GET /api/reports/occupancy` - Relatório de ocupação de mesas
- `GET /api/reports/waiters` - Relatório de performance dos garçons
- `GET /api/reports/revenue` - Relatório de faturamento
- `GET /api/reports/popular-items` - Itens mais vendidos

### Garçons
- `GET /api/waiters` - Listar garçons
- `POST /api/waiters` - Criar garçom
- `PUT /api/waiters/:id` - Atualizar garçom
- `DELETE /api/waiters/:id` - Deletar garçom

### Pagamentos
- `GET /api/payments/methods` - Listar métodos de pagamento
- `POST /api/payments/process` - Processar pagamento

## Características Técnicas

## Características Técnicas

### Design e Interface
- **Glassmorphism**: Interface com efeitos de vidro e blur modernos
- **Gradientes Dinâmicos**: Paleta de cores corporativa com transições suaves
- **Animações Fluidas**: Transições com cubic-bezier para experiência premium
- **Micro-interações**: Hover effects, scaling e movimentos sutis
- **Typography Moderna**: Hierarquia visual clara com fontes sistema

### Responsividade
- **Design Mobile-First**: Interface adaptável para todos os dispositivos
- **Breakpoints Otimizados**: 768px e 480px para tablet e mobile
- **Grid Flexível**: Layouts que se adaptam automaticamente
- **Touch-Friendly**: Botões e elementos otimizados para touch
- **Experiência Móvel**: Animações simplificadas para melhor performance

### Funcionalidades Técnicas
- **Validações Completas**: Frontend e backend sincronizados
- **Controle de Estoque**: Atualização automática em tempo real
- **Alertas Inteligentes**: Sistema de notificações visuais
- **Modais Profissionais**: Interface overlay com blur de fundo
- **Formatação Regional**: Moeda e datas em português brasileiro
- **Estados de Loading**: Indicadores visuais para operações assíncronas

### Performance
- **CSS Otimizado**: Código limpo e organizado
- **Animações Performáticas**: GPU-accelerated com transform
- **Loading States**: Indicadores visuais para operações assíncronas
- **Scroll Customizado**: Barras de rolagem estilizadas
- **Hardware Acceleration**: Will-change properties para otimização
- **60FPS**: Animações fluidas em todos os dispositivos

### Experiência do Usuário
- **Feedback Instantâneo**: Resposta visual imediata em todas as interações
- **Ripple Effects**: Efeitos de ondulação nos cliques dos botões
- **Button States**: Estados visuais para loading, sucesso e erro
- **Smooth Transitions**: Transições de 400ms com cubic-bezier otimizado
- **Touch Optimization**: Otimizações específicas para dispositivos touch
- **Keyboard Navigation**: Suporte completo para navegação por teclado

## Funcionalidades Especiais

## Funcionalidades Especiais

### Interface e Experiência
- **Header IRONBOX**: Logo com efeitos de gradiente e brilho
- **Navegação Moderna**: Botões com animações de hover e indicadores visuais
- **Cards Interativos**: Estatísticas com ícones animados e sombras dinâmicas
- **Tabelas Profissionais**: Headers com gradiente e rows com hover scaling
- **Formulários Elegantes**: Inputs com focus effects e validação visual
- **Botões Responsivos**: Feedback tátil e visual instantâneo
- **Estados Dinâmicos**: Loading, sucesso e erro com animações

### Controle de Estoque Avançado
- **Redução Automática**: O sistema reduz automaticamente o estoque ao realizar vendas
- **Alertas Visuais**: Produtos com menos de 10 unidades aparecem no dashboard com cores
- **Validação Inteligente**: Não permite vender mais do que o estoque disponível
- **Restauração**: Cancelamento de vendas restaura o estoque automaticamente

### Efeitos Visuais Modernos
- **Glassmorphism**: Efeitos de vidro com backdrop-filter em cards e modais
- **Gradientes Múltiplos**: Backgrounds e elementos com degradês sofisticados  
- **Animações CSS**: Transições suaves com cubic-bezier timing functions
- **Hover States**: Micro-interações em botões, cards e elementos clicáveis
- **Loading States**: Spinners animados e estados de carregamento elegantes
- **Ripple Effects**: Efeitos de ondulação em cliques para feedback visual

### Acessibilidade e Usabilidade
- **Focus Rings**: Indicadores visuais para navegação por teclado
- **Contrast Ratios**: Cores com contraste adequado para legibilidade
- **Touch Targets**: Elementos com tamanho adequado para dispositivos móveis
- **Screen Reader**: Estrutura semântica para leitores de tela
- **Reduced Motion**: Suporte para usuários sensíveis a movimento
- **High Contrast**: Suporte para modo de alto contraste

### Otimizações Técnicas
- **Performance 60FPS**: Animações fluidas garantidas
- **Hardware Acceleration**: Uso de GPU para transições suaves
- **Event Delegation**: Otimização de eventos para melhor performance
- **Will-Change**: Properties otimizadas para animações
- **Mobile Optimizations**: Simplificações específicas para dispositivos móveis
- **Memory Management**: Limpeza automática de event listeners

## Screenshots e Demonstração

### Interface Principal
- **Dashboard Moderno**: Cards glassmorphism com métricas em tempo real
- **Header Premium**: Logo IRONBOX com efeitos de gradiente e tipografia elegante
- **Navegação Fluida**: Tabs com animações e indicadores visuais
- **Botões Responsivos**: Feedback visual instantâneo e animações suaves

### Versão Mobile
- **Layout Responsivo**: Design que se adapta perfeitamente a smartphones
- **Touch Optimized**: Botões e elementos otimizados para interação touch
- **Performance Mobile**: Animações suaves mesmo em dispositivos menos potentes
- **UX Mobile**: Interface simplificada mantendo todas as funcionalidades

### Elementos Visuais
- **Paleta de Cores**: Azuis corporativos (#1e3c72, #2a5298, #3498db)
- **Gradientes**: Backgrounds com transições suaves entre cores
- **Sombras**: Múltiplas camadas para profundidade visual
- **Bordas**: Cantos arredondados (20px) para modernidade
- **Animações**: Ripple effects e micro-interações fluidas

## Histórico de Versões

### Versão 4.0 - Sistema de Comandas e Relatórios
- **Sistema de Comandas**: Gestão completa de pedidos por mesa
- **Dashboard de Mesas**: Grid visual com status em tempo real
- **Relatórios Analíticos**: 4 tipos de relatórios com filtros dinâmicos
- **Correção de Performance**: Solução do problema "JS heap out of memory"
- **API Expandida**: Novas rotas para mesas, pedidos e relatórios
- **Interface Aprimorada**: Modais e formulários para gestão de comandas
- **Validações Robustas**: Controle de estoque e validação de dados

### Versão 3.0 - UX e Responsividade Aprimorada
- **Botões Ultra-Responsivos**: Transições de 400ms com feedback visual instantâneo
- **Ripple Effects**: Efeitos de ondulação em todos os cliques
- **Estados Dinâmicos**: Loading, sucesso e erro com animações
- **Mobile Optimized**: Otimizações específicas para dispositivos móveis
- **Acessibilidade**: Suporte completo para navegação por teclado e leitores de tela
- **Performance 60FPS**: Hardware acceleration em todas as animações

### Versão 2.0 - Design Profissional
- **Glassmorphism**: Interface com efeitos de vidro e blur
- **Gradientes Dinâmicos**: Paleta de cores corporativa premium
- **Animações Fluidas**: Transições suaves com cubic-bezier
- **Design Responsivo**: Otimizado para todos os dispositivos
- **Typography Moderna**: Hierarquia visual clara

### Versão 1.0 - Funcionalidades Core
- **CRUD Completo**: Produtos, categorias, fornecedores e vendas
- **Dashboard**: Métricas e estatísticas em tempo real
- **Controle de Estoque**: Validações e atualizações automáticas
- **API RESTful**: Endpoints organizados e documentados

---

**Dica**: Acesse `http://localhost:3000` após iniciar o servidor para ver a interface completa em ação!

## Melhorias Visuais Implementadas

### Versão 2.0 - Design Profissional

#### Atualizações Principais:

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

#### Responsividade Aprimorada:
- Breakpoints otimizados (768px, 480px)
- Typography responsiva escalável
- Grid system flexível
- Elementos touch-friendly

#### Performance Visual:
- Animações GPU-accelerated
- CSS otimizado e organizado
- Loading states elegantes
- Scroll bars customizadas

### Versão 3.0 - UX e Responsividade Avançada

#### Novas Implementações:

1. **Botões Ultra-Responsivos**
   - Transições de 400ms otimizadas
   - Efeitos ripple em todos os cliques
   - Estados de loading com spinner animado
   - Feedback visual instantâneo

2. **Micro-Interações Avançadas**
   - Animações nos ícones (rotação e escala)
   - Hover effects com múltiplas camadas
   - Touch feedback para dispositivos móveis
   - Keyboard navigation otimizada

3. **Acessibilidade Completa**
   - Focus indicators visíveis
   - High contrast mode support
   - Reduced motion support
   - ARIA labels e tooltips

4. **Performance Otimizada**
   - Hardware acceleration (will-change)
   - Event delegation otimizada
   - Animações simplificadas no mobile
   - Memory management aprimorado

## Suporte e Desenvolvimento

### Status do Projeto
- **v1.0**: Funcionalidades core implementadas
- **v2.0**: Design profissional e interface moderna
- **v3.0**: UX aprimorada e responsividade avançada
- **Em Desenvolvimento**: Novas funcionalidades e otimizações

### Contato
Para dúvidas, sugestões ou melhorias, entre em contato através do sistema de issues do repositório.

### Contribuições
Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Contribuir com código
- Melhorar a documentação

---

**IRONBOX** - Sistema de Tabacaria e Distribuidora **v4.0**  
*Sistema completo com comandas, relatórios e gestão de mesas*  
*Desenvolvido com tecnologias modernas, design profissional e UX otimizada*

### Principais Destaques da v4.0:
✅ **Sistema de Comandas Funcional** - Gestão completa de pedidos por mesa  
✅ **Dashboard de Mesas Visual** - Interface moderna com status em tempo real  
✅ **4 Tipos de Relatórios** - Análises detalhadas de ocupação, vendas e performance  
✅ **Performance Otimizada** - Correção do problema de memória e otimizações  
✅ **Interface Aprimorada** - Novos modais, formulários e estilos CSS  
✅ **API Expandida** - 20+ endpoints para todas as funcionalidades  

### Como Testar as Novas Funcionalidades:
1. **Acesse a aba "Mesas"** para ver o dashboard visual
2. **Abra uma mesa** clicando em "Abrir" nas mesas disponíveis
3. **Gerencie pedidos** usando o botão "Gerenciar" nas mesas ocupadas
4. **Visualize relatórios** na aba "Relatórios" com diferentes filtros
5. **Explore as métricas** em tempo real no dashboard principal
