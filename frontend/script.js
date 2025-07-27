// API Base URL
const API_BASE = '/api';

// Global data storage
let products = [];
let categories = [];
let suppliers = [];
let sales = [];
let cart = []; // Carrinho de compras
let currentTables = []; // Mesas
let currentOrderItems = [];
let currentOrderData = {}; // Dados do pedido atual

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupSidebar();
    
    // Forçar atribuições globais imediatamente
    setTimeout(forceGlobalAssignments, 100);
    
    // Initialize sidebar state on page load
    const body = document.body;
    if (sidebar.classList.contains('collapsed')) {
        body.classList.add('sidebar-collapsed');
    }
});

function setupSidebar() {
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    // Sidebar toggle functionality with 60fps performance
    sidebarToggle.addEventListener('click', function() {
        requestAnimationFrame(() => {
            if (window.innerWidth <= 768) {
                // Mobile: toggle open/close
                sidebar.classList.toggle('open');
                sidebarOverlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            } else {
                // Desktop: toggle collapsed/expanded
                sidebar.classList.toggle('collapsed');
                // Apply class to body to control main content
                body.classList.toggle('sidebar-collapsed', sidebar.classList.contains('collapsed'));
            }
        });
    });

    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', function() {
        requestAnimationFrame(() => {
            sidebar.classList.remove('open');
            sidebarOverlay.style.display = 'none';
        });
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && 
                !sidebarToggle.contains(event.target) && 
                sidebar.classList.contains('open')) {
                requestAnimationFrame(() => {
                    sidebar.classList.remove('open');
                    sidebarOverlay.style.display = 'none';
                });
            }
        }
    });

    // Handle window resize with throttling for performance
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            requestAnimationFrame(() => {
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.style.display = 'none';
                } else {
                    sidebar.classList.remove('collapsed');
                    body.classList.remove('sidebar-collapsed');
                }
            });
        }, 100);
    });

    // Auto-collapse sidebar on mobile on page load
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('collapsed');
        sidebar.classList.remove('open');
        body.classList.remove('sidebar-collapsed');
        sidebarOverlay.style.display = 'none';
    }

    // Close sidebar when navigation item is clicked on mobile
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                requestAnimationFrame(() => {
                    sidebar.classList.remove('open');
                    sidebarOverlay.style.display = 'none';
                });
            }
        });
    });
}

function initializeApp() {
    loadDashboard();
    loadProducts();
    loadCategories();
    loadSuppliers();
    loadSales();
    loadTables(); // Carregar mesas
    initializeReports(); // Inicializar relatórios
    updateCartCounter(); // Inicializar contador do carrinho
}

function setupEventListeners() {
    // Navigation
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });

    // Botões principais - com verificação de existência
    const newProductBtn = document.getElementById('new-product-btn');
    const newCategoryBtn = document.getElementById('new-category-btn');
    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const newSaleBtn = document.getElementById('new-sale-btn');
    const cartBtn = document.getElementById('cart-btn');
    const newTableBtn = document.getElementById('new-table-btn');
    
    if (newProductBtn) newProductBtn.addEventListener('click', () => showProductModal());
    if (newCategoryBtn) newCategoryBtn.addEventListener('click', () => showCategoryModal());
    if (newSupplierBtn) newSupplierBtn.addEventListener('click', () => showSupplierModal());
    if (newSaleBtn) newSaleBtn.addEventListener('click', () => showSaleModal());
    if (cartBtn) cartBtn.addEventListener('click', () => showCartModal());
    if (newTableBtn) newTableBtn.addEventListener('click', () => openTableModal());

    // Forms - com verificação de existência
    const productForm = document.getElementById('productForm');
    const categoryForm = document.getElementById('categoryForm');
    const supplierForm = document.getElementById('supplierForm');
    const saleForm = document.getElementById('saleForm');
    const tableForm = document.getElementById('tableForm');
    
    if (productForm) productForm.addEventListener('submit', handleProductSubmit);
    if (categoryForm) categoryForm.addEventListener('submit', handleCategorySubmit);
    if (supplierForm) supplierForm.addEventListener('submit', handleSupplierSubmit);
    if (saleForm) saleForm.addEventListener('submit', handleSaleSubmit);
    if (tableForm) tableForm.addEventListener('submit', saveTable);
    
    // Table forms
    const openTableForm = document.getElementById('openTableForm');
    if (openTableForm) openTableForm.addEventListener('submit', openTable);

    // Sale form product selection - com verificação
    const saleProduct = document.getElementById('saleProduct');
    const saleQuantity = document.getElementById('saleQuantity');
    
    if (saleProduct) saleProduct.addEventListener('change', updateSalePrice);
    if (saleQuantity) saleQuantity.addEventListener('input', updateSalePrice);

    // Payment method listeners - com verificação
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    if (paymentMethods.length > 0) {
        paymentMethods.forEach(radio => {
            radio.addEventListener('change', handlePaymentMethodChange);
        });
    }

    // Interest rate listener - com verificação
    const interestRate = document.getElementById('interestRate');
    if (interestRate) {
        interestRate.addEventListener('input', updateCartTotals);
    }
}

// Tab switching
function switchTab(tabId) {
    // Remove active class from current tab
    const currentActiveTab = document.querySelector('.tab-content.active');
    const newActiveTab = document.getElementById(tabId);
    const targetNavBtn = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (!newActiveTab || !targetNavBtn) return;
    
    // Use requestAnimationFrame for smooth 60fps animation
    requestAnimationFrame(() => {
        // Update navigation buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        targetNavBtn.classList.add('active');
        
        // Hide current tab instantly
        if (currentActiveTab && currentActiveTab !== newActiveTab) {
            currentActiveTab.classList.remove('active');
            currentActiveTab.style.display = 'none';
        }
        
        // Show new tab with smooth transition
        newActiveTab.style.display = 'block';
        
        // Force reflow then add active class for transition
        newActiveTab.offsetHeight;
        
        requestAnimationFrame(() => {
            newActiveTab.classList.add('active');
            
            // Load data for the new tab
            switch(tabId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'products':
                    loadProducts();
                    break;
                case 'categories':
                    loadCategories();
                    break;
                case 'suppliers':
                    loadSuppliers();
                    break;
                case 'sales':
                    loadSales();
                    break;
                case 'tables':
                    initTables();
                    break;
                case 'reports':
                    loadCurrentReport();
                    break;
            }
        });
    });
}

// API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showAlert('Erro na comunicação com o servidor', 'error');
        throw error;
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const data = await apiCall('/dashboard');
        
        // Update statistics
        document.getElementById('total-products').textContent = data.totalProducts?.count || 0;
        document.getElementById('sales-today').textContent = data.totalSalesToday?.count || 0;
        document.getElementById('total-stock').textContent = data.totalStock?.total || 0;
        document.getElementById('total-revenue').textContent = formatCurrency(data.totalRevenue?.total || 0);
        
        // Update top products table
        updateTopProductsTable(data.topProducts || []);
        
        // Update low stock alerts
        updateLowStockAlerts(data.lowStockProducts?.count || 0);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateTopProductsTable(products) {
    const tbody = document.getElementById('top-products-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.total_sold}</td>
            <td>${formatCurrency(product.revenue)}</td>
        `;
        tbody.appendChild(row);
    });
}

async function updateLowStockAlerts(count) {
    const container = document.getElementById('low-stock-list');
    
    if (count === 0) {
        container.innerHTML = '<p>Nenhum produto com estoque baixo</p>';
        return;
    }
    
    try {
        const lowStockProducts = await apiCall('/dashboard/low-stock');
        container.innerHTML = '';
        
        lowStockProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = `low-stock-item ${product.stock_quantity <= 5 ? 'critical' : ''}`;
            item.innerHTML = `
                <span>${product.name}</span>
                <span class="stock-quantity ${product.stock_quantity <= 5 ? '' : 'warning'}">
                    ${product.stock_quantity}
                </span>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar produtos com estoque baixo</p>';
    }
}

// Products functions
async function loadProducts() {
    console.log('🔄 Carregando produtos...');
    try {
        products = await apiCall('/products');
        console.log('📦 Produtos carregados:', products.length);
        renderProductsTable();
        loadProductSelections();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProductsTable() {
    console.log('🔧 Renderizando tabela de produtos...');
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach((product, index) => {
        console.log(`Renderizando produto ${index + 1}: ${product.name} (ID: ${product.id})`);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category_name || 'N/A'}</td>
            <td>${product.supplier_name || 'N/A'}</td>
            <td class="price">${formatCurrency(product.price)}</td>
            <td>${product.stock_quantity}</td>
            <td>
                <div class="btn-container">
                    <button class="btn-edit" data-action="edit" data-id="${product.id}" title="Editar produto">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" data-action="delete" data-id="${product.id}" title="Excluir produto">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        
        // Usar onclick diretamente (mais confiável) com melhorias de UX
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.onclick = function(e) {
            console.log('Editando produto ID:', product.id);
            
            // Add loading state
            if (typeof window.addLoadingState === 'function') {
                window.addLoadingState(this, 500);
            }
            
            if (typeof window.editProduct === 'function') {
                window.editProduct(product.id);
            } else {
                console.error('Função editProduct não disponível');
            }
        };
        
        deleteBtn.onclick = function(e) {
            console.log('Excluindo produto ID:', product.id);
            
            // Add visual feedback before confirmation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (typeof window.deleteProduct === 'function') {
                window.deleteProduct(product.id);
            } else {
                console.error('Função deleteProduct não disponível');
            }
        };
        
        tbody.appendChild(row);
    });
    
    // Reapply button enhancements after rendering
    if (typeof window.reapplyButtonEnhancements === 'function') {
        window.reapplyButtonEnhancements();
    }
}

function showProductModal(product = null) {
    console.log('🔵 showProductModal chamada!', product);
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
    // Verificar se estamos em uma página de teste
    if (!modal || !form || !title) {
        console.log('⚠️ showProductModal: Elementos do modal não encontrados (página de teste?)');
        console.log('Modal encontrado:', !!modal);
        console.log('Form encontrado:', !!form);
        console.log('Title encontrado:', !!title);
        return; // Sair da função se elementos não existirem
    }
    
    console.log('✅ Todos os elementos encontrados, configurando modal...');
    
    if (product) {
        title.textContent = 'Editar Produto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productSupplier').value = product.supplier_id || '';
    } else {
        title.textContent = 'Novo Produto';
        form.reset();
        document.getElementById('productId').value = '';
    }
    
    loadCategoriesSelect();
    loadSuppliersSelect();
    console.log('📋 Chamando showModal(productModal)...');
    showModal('productModal');
}

async function loadCategoriesSelect() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '<option value="">Selecione...</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

async function loadSuppliersSelect() {
    const select = document.getElementById('productSupplier');
    select.innerHTML = '<option value="">Selecione...</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = supplier.name;
        select.appendChild(option);
    });
}

async function loadProductSelections() {
    const select = document.getElementById('saleProduct');
    select.innerHTML = '<option value="">Selecione...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - Estoque: ${product.stock_quantity}`;
        option.dataset.price = product.price;
        option.dataset.stock = product.stock_quantity;
        select.appendChild(option);
    });
}

function editProduct(id) {
    console.log('editProduct chamado com ID:', id);
    
    // Verificar se temos produtos carregados
    if (!products || products.length === 0) {
        console.log('⚠️ editProduct: Nenhum produto carregado');
        return;
    }
    
    const product = products.find(p => p.id === id);
    if (product) {
        console.log('✅ Produto encontrado:', product.name);
        showProductModal(product);
    } else {
        console.log('⚠️ editProduct: Produto com ID', id, 'não encontrado');
        // Para testes, simular um produto
        const mockProduct = {
            id: id,
            name: 'Produto Teste',
            description: 'Descrição teste',
            price: 10.50,
            stock_quantity: 100,
            category_id: 1,
            supplier_id: 1
        };
        console.log('📝 Usando produto simulado para teste');
        showProductModal(mockProduct);
    }
}

async function deleteProduct(id) {
    console.log('deleteProduct chamado com ID:', id);
    
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            console.log('✅ Usuário confirmou exclusão do produto ID:', id);
            await apiCall(`/products/${id}`, { method: 'DELETE' });
            showAlert('Produto excluído com sucesso', 'success');
            loadProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            showAlert('Erro ao excluir produto', 'error');
        }
    } else {
        console.log('❌ Usuário cancelou exclusão do produto ID:', id);
    }
}

async function handleProductSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock_quantity: parseInt(document.getElementById('productStock').value),
        category_id: document.getElementById('productCategory').value || null,
        supplier_id: document.getElementById('productSupplier').value || null
    };
    
    const productId = document.getElementById('productId').value;
    
    try {
        if (productId) {
            await apiCall(`/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showAlert('Produto atualizado com sucesso', 'success');
        } else {
            await apiCall('/products', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showAlert('Produto criado com sucesso', 'success');
        }
        
        closeModal('productModal');
        loadProducts();
    } catch (error) {
        showAlert('Erro ao salvar produto', 'error');
    }
}

// Categories functions
async function loadCategories() {
    try {
        categories = await apiCall('/categories');
        renderCategoriesTable();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categories-table-body');
    tbody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.description || 'N/A'}</td>
            <td>${formatDate(category.created_at)}</td>
            <td>
                <div class="btn-container">
                    <button class="btn-edit" data-action="edit" data-id="${category.id}" title="Editar categoria">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" data-action="delete" data-id="${category.id}" title="Excluir categoria">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        
        // Adicionar event listeners aos botões com UX melhorada
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', function(e) {
            if (typeof window.addLoadingState === 'function') {
                window.addLoadingState(this, 500);
            }
            editCategory(category.id);
        });
        
        deleteBtn.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            deleteCategory(category.id);
        });
        
        tbody.appendChild(row);
    });
    
    // Reapply button enhancements
    if (typeof window.reapplyButtonEnhancements === 'function') {
        window.reapplyButtonEnhancements();
    }
}

function showCategoryModal(category = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryModalTitle');
    
    if (category) {
        title.textContent = 'Editar Categoria';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
    } else {
        title.textContent = 'Nova Categoria';
        form.reset();
        document.getElementById('categoryId').value = '';
    }
    
    showModal('categoryModal');
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        showCategoryModal(category);
    }
}

async function deleteCategory(id) {
    console.log('Tentando deletar categoria com ID:', id);
    
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        try {
            console.log('Fazendo chamada para API DELETE');
            const response = await apiCall(`/categories/${id}`, { method: 'DELETE' });
            console.log('Resposta da API:', response);
            showAlert('Categoria excluída com sucesso', 'success');
            loadCategories();
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            showAlert('Erro ao excluir categoria: ' + (error.message || 'Erro desconhecido'), 'error');
        }
    }
}

async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };
    
    const categoryId = document.getElementById('categoryId').value;
    
    try {
        if (categoryId) {
            await apiCall(`/categories/${categoryId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showAlert('Categoria atualizada com sucesso', 'success');
        } else {
            await apiCall('/categories', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showAlert('Categoria criada com sucesso', 'success');
        }
        
        closeModal('categoryModal');
        loadCategories();
    } catch (error) {
        showAlert('Erro ao salvar categoria', 'error');
    }
}

// Suppliers functions
async function loadSuppliers() {
    try {
        suppliers = await apiCall('/suppliers');
        renderSuppliersTable();
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

function renderSuppliersTable() {
    const tbody = document.getElementById('suppliers-table-body');
    tbody.innerHTML = '';
    
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.contact_person || 'N/A'}</td>
            <td>${supplier.email || 'N/A'}</td>
            <td>${supplier.phone || 'N/A'}</td>
            <td>
                <div class="btn-container">
                    <button class="btn-edit" data-action="edit" data-id="${supplier.id}" title="Editar fornecedor">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" data-action="delete" data-id="${supplier.id}" title="Excluir fornecedor">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        
        // Adicionar event listeners aos botões com UX melhorada
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', function(e) {
            if (typeof window.addLoadingState === 'function') {
                window.addLoadingState(this, 500);
            }
            editSupplier(supplier.id);
        });
        
        deleteBtn.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            deleteSupplier(supplier.id);
        });
        
        tbody.appendChild(row);
    });
    
    // Reapply button enhancements
    if (typeof window.reapplyButtonEnhancements === 'function') {
        window.reapplyButtonEnhancements();
    }
}

function showSupplierModal(supplier = null) {
    const modal = document.getElementById('supplierModal');
    const form = document.getElementById('supplierForm');
    const title = document.getElementById('supplierModalTitle');
    
    if (supplier) {
        title.textContent = 'Editar Fornecedor';
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierContact').value = supplier.contact_person || '';
        document.getElementById('supplierEmail').value = supplier.email || '';
        document.getElementById('supplierPhone').value = supplier.phone || '';
        document.getElementById('supplierAddress').value = supplier.address || '';
    } else {
        title.textContent = 'Novo Fornecedor';
        form.reset();
        document.getElementById('supplierId').value = '';
    }
    
    showModal('supplierModal');
}

function editSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
        showSupplierModal(supplier);
    }
}

async function deleteSupplier(id) {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
        try {
            await apiCall(`/suppliers/${id}`, { method: 'DELETE' });
            showAlert('Fornecedor excluído com sucesso', 'success');
            loadSuppliers();
        } catch (error) {
            showAlert('Erro ao excluir fornecedor', 'error');
        }
    }
}

async function handleSupplierSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('supplierName').value,
        contact_person: document.getElementById('supplierContact').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value
    };
    
    const supplierId = document.getElementById('supplierId').value;
    
    try {
        if (supplierId) {
            await apiCall(`/suppliers/${supplierId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showAlert('Fornecedor atualizado com sucesso', 'success');
        } else {
            await apiCall('/suppliers', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showAlert('Fornecedor criado com sucesso', 'success');
        }
        
        closeModal('supplierModal');
        loadSuppliers();
    } catch (error) {
        showAlert('Erro ao salvar fornecedor', 'error');
    }
}

// Sales functions
async function loadSales() {
    try {
        sales = await apiCall('/sales');
        renderSalesTable();
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function renderSalesTable() {
    const tbody = document.getElementById('sales-table-body');
    tbody.innerHTML = '';
    
    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sale.sale_date)}</td>
            <td>${sale.product_name || 'N/A'}</td>
            <td>${sale.quantity}</td>
            <td class="price">${formatCurrency(sale.unit_price)}</td>
            <td class="price">${formatCurrency(sale.total_price)}</td>
            <td>${getPaymentMethodLabel(sale.payment_method, sale.card_brand)}</td>
            <td>
                <div class="btn-container">
                    <button class="btn-delete" data-action="delete" data-id="${sale.id}" title="Cancelar venda">
                        <i class="fas fa-trash"></i> Cancelar
                    </button>
                </div>
            </td>
        `;
        
        // Adicionar event listener ao botão com UX melhorada
        const deleteBtn = row.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            deleteSale(sale.id);
        });
        
        tbody.appendChild(row);
    });
    
    // Reapply button enhancements
    if (typeof window.reapplyButtonEnhancements === 'function') {
        window.reapplyButtonEnhancements();
    }
}

function getPaymentMethodLabel(method, cardBrand) {
    const methods = {
        'money': '💵 Dinheiro',
        'pix': '📱 PIX',
        'debit': `💳 Débito${cardBrand ? ` (${cardBrand})` : ''}`,
        'credit': `💳 Crédito${cardBrand ? ` (${cardBrand})` : ''}`
    };
    return methods[method] || method;
}

function showSaleModal() {
    const modal = document.getElementById('saleModal');
    const form = document.getElementById('saleForm');
    
    form.reset();
    loadProductSelections();
    showModal('saleModal');
}

function updateSalePrice() {
    const select = document.getElementById('saleProduct');
    const priceInput = document.getElementById('salePrice');
    const quantityInput = document.getElementById('saleQuantity');
    
    if (select.value) {
        const option = select.options[select.selectedIndex];
        priceInput.value = option.dataset.price;
        quantityInput.max = option.dataset.stock;
        updateSaleTotal();
    } else {
        priceInput.value = '';
        quantityInput.max = '';
        document.getElementById('saleTotal').value = '';
    }
}

function updateSaleTotal() {
    const price = parseFloat(document.getElementById('salePrice').value) || 0;
    const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    const total = price * quantity;
    
    document.getElementById('saleTotal').value = total.toFixed(2);
}

async function deleteSale(id) {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
        try {
            await apiCall(`/sales/${id}`, { method: 'DELETE' });
            showAlert('Venda cancelada com sucesso', 'success');
            loadSales();
            loadProducts(); // Refresh products to update stock
        } catch (error) {
            showAlert('Erro ao cancelar venda', 'error');
        }
    }
}

// Cart functions
function showCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) {
        console.error('Modal do carrinho não encontrado');
        return;
    }
    
    updateCartDisplay();
    updateCartTotals();
    showModal('cartModal');
}

function addToCart(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock < quantity) {
        showAlert('Quantidade indisponível em estoque', 'error');
        return;
    }

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            productName: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    updateCartCounter();
    updateCartDisplay();
    showAlert('Produto adicionado ao carrinho', 'success');
}

function addToCartFromModal() {
    const productId = parseInt(document.getElementById('saleProduct').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    
    if (!productId || !quantity) {
        showAlert('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    addToCart(productId, quantity);
    
    // Limpar o formulário após adicionar
    document.getElementById('saleForm').reset();
    document.getElementById('salePrice').value = '';
    document.getElementById('saleTotal').value = '';
    
    // Fechar modal
    closeModal('saleModal');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartCounter();
    updateCartDisplay();
    updateCartTotals();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.productId === productId);
    const product = products.find(p => p.id === productId);
    
    if (!item || !product) return;

    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > product.stock) {
        showAlert('Quantidade indisponível em estoque', 'error');
        return;
    }

    item.quantity = newQuantity;
    updateCartDisplay();
    updateCartTotals();
}

function updateCartCounter() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function updateCartDisplay() {
    const cartList = document.getElementById('cartList');
    if (!cartList) {
        console.error('Elemento cartList não encontrado');
        return;
    }
    
    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Carrinho vazio</p>
            </div>
        `;
        const finalizeBtn = document.getElementById('finalizeSaleBtn');
        if (finalizeBtn) finalizeBtn.disabled = true;
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.productName}</span>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.productId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" 
                               onchange="updateCartQuantity(${item.productId}, parseInt(this.value))" min="1">
                        <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                    </div>
                    <span class="cart-item-price">${formatCurrency(item.price * item.quantity)}</span>
                </div>
            </div>
        `).join('');
        const finalizeBtn = document.getElementById('finalizeSaleBtn');
        if (finalizeBtn) finalizeBtn.disabled = false;
    }
    
    updateCartTotals();
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodElement ? paymentMethodElement.value : 'money';
    
    let interest = 0;
    if (paymentMethod === 'credit') {
        const interestRateElement = document.getElementById('interestRate');
        const interestRate = interestRateElement ? (parseFloat(interestRateElement.value) || 0) : 0;
        interest = subtotal * (interestRate / 100);
    }
    
    const total = subtotal + interest;
    
    const subtotalElement = document.getElementById('cart-subtotal');
    const interestElement = document.getElementById('cart-interest');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (interestElement) interestElement.textContent = formatCurrency(interest);
    if (totalElement) totalElement.textContent = formatCurrency(total);
}

function handlePaymentMethodChange() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const cardDetails = document.getElementById('cardDetails');
    const interestSection = document.getElementById('interestSection');
    
    if (paymentMethod === 'debit' || paymentMethod === 'credit') {
        cardDetails.style.display = 'block';
        interestSection.style.display = paymentMethod === 'credit' ? 'block' : 'none';
    } else {
        cardDetails.style.display = 'none';
    }
    
    updateCartTotals();
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        cart = [];
        updateCartCounter();
        updateCartDisplay();
        showAlert('Carrinho limpo', 'success');
    }
}

async function finalizeSale() {
    if (cart.length === 0) {
        showAlert('Carrinho está vazio', 'error');
        return;
    }

    const paymentMethodElement = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodElement) {
        showAlert('Selecione uma forma de pagamento', 'error');
        return;
    }
    
    const paymentMethod = paymentMethodElement.value;
    const cardBrandElement = document.getElementById('cardBrand');
    const cardBrand = cardBrandElement ? cardBrandElement.value : '';
    const interestRateElement = document.getElementById('interestRate');
    const interestRate = interestRateElement ? (parseFloat(interestRateElement.value) || 0) : 0;

    // Validate card details for card payments
    if ((paymentMethod === 'debit' || paymentMethod === 'credit') && !cardBrand) {
        showAlert('Selecione a bandeira do cartão', 'error');
        return;
    }

    try {
        // Process each item in cart
        const salePromises = cart.map(async (item) => {
            const saleData = {
                product_id: item.productId,  // Correção: backend espera product_id
                quantity: item.quantity,
                paymentMethod: paymentMethod,
                cardBrand: cardBrand || null,
                interestRate: paymentMethod === 'credit' ? interestRate : 0
            };

            return await apiCall('/sales', {
                method: 'POST',
                body: JSON.stringify(saleData)
            });
        });

        await Promise.all(salePromises);

        showAlert('Venda finalizada com sucesso!', 'success');
        
        // Clear cart and update displays
        cart = [];
        updateCartCounter();
        updateCartDisplay();
        closeModal('cartModal');
        
        // Reload data
        loadDashboard();
        loadProducts();
        loadSales();
        
    } catch (error) {
        showAlert('Erro ao finalizar venda', 'error');
        console.error('Sale error:', error);
    }
}

// Update sale form to add to cart instead of direct sale
async function handleSaleSubmit(event) {
    event.preventDefault();
    
    const productId = parseInt(document.getElementById('saleProduct').value);
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    
    if (!productId || !quantity) {
        showAlert('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    addToCart(productId, quantity);
    closeModal('saleModal');
    
    // Reset form
    document.getElementById('saleForm').reset();
    document.getElementById('salePrice').value = '';
    document.getElementById('saleTotal').value = '';
}

// ==================== TABLES MANAGEMENT ====================
// Load and display tables
async function loadTables() {
    try {
        const response = await fetch('/api/tables');
        if (!response.ok) throw new Error('Erro ao carregar mesas');
        
        currentTables = await response.json();
        renderTablesGrid();
    } catch (error) {
        console.error('Erro ao carregar mesas:', error);
        showAlert('Erro ao carregar mesas', 'error');
    }
}

// Render tables grid
function renderTablesGrid() {
    const grid = document.getElementById('tables-grid');
    if (!grid) return;
    
    if (currentTables.length === 0) {
        grid.innerHTML = '<p class="no-data">Nenhuma mesa cadastrada. Clique em "Nova Mesa" para começar.</p>';
        return;
    }
    
    grid.innerHTML = currentTables.map(table => {
        const statusClass = table.status || 'available';
        const statusText = {
            'available': 'Disponível',
            'occupied': 'Ocupada',
            'maintenance': 'Manutenção'
        }[statusClass] || 'Disponível';
        
        let orderInfo = '';
        if (table.current_order_id) {
            // Processar nomes das comandas
            let commandsDisplay = '';
            if (table.command_names) {
                try {
                    const commandNames = JSON.parse(table.command_names);
                    if (commandNames && commandNames.length > 1) {
                        commandsDisplay = `
                            <p><strong>Comandas (${commandNames.length}):</strong></p>
                            <ul class="command-list">
                                ${commandNames.map((name, index) => 
                                    `<li>Comanda ${index + 1}: ${name}</li>`
                                ).join('')}
                            </ul>
                        `;
                    } else {
                        commandsDisplay = `<p><strong>Cliente:</strong> ${table.customer_name || 'Sem nome'}</p>`;
                    }
                } catch (e) {
                    commandsDisplay = `<p><strong>Cliente:</strong> ${table.customer_name || 'Sem nome'}</p>`;
                }
            } else {
                commandsDisplay = `<p><strong>Cliente:</strong> ${table.customer_name || 'Sem nome'}</p>`;
            }
            
            orderInfo = `
                <div class="table-order-info">
                    <h4>Pedido Ativo</h4>
                    ${commandsDisplay}
                    <p><strong>Valor:</strong> R$ ${(table.total_amount || 0).toFixed(2)}</p>
                    <p><strong>Aberto:</strong> ${new Date(table.order_opened_at).toLocaleString()}</p>
                </div>
            `;
        }
        
        let actions = '';
        if (statusClass === 'available') {
            actions = `
                <button class="btn btn-open" onclick="showOpenTableModal(${table.id})">
                    <i class="fas fa-play"></i> Abrir
                </button>
                <div class="button-group">
                    <button class="btn btn-edit" onclick="editTable(${table.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-delete" onclick="deleteTable(${table.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else if (statusClass === 'occupied') {
            actions = `
                <div class="button-group" style="margin-bottom: 8px; justify-content: space-between;">
                    <button class="btn btn-primary" style="width: 48%;" onclick="showManageOrderModal(${table.id})">
                        <i class="fas fa-utensils"></i> Gerenciar
                    </button>
                    <button class="btn btn-close" style="width: 48%;" onclick="showCloseTableModal(${table.id})">
                        <i class="fas fa-stop"></i> Fechar
                    </button>
                </div>
                <div class="button-group" style="justify-content: space-between;">
                    <button class="btn btn-edit" style="width: 48%;" onclick="editTable(${table.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-delete" style="width: 48%;" onclick="deleteTable(${table.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        } else {
            actions = `
                <div class="button-group">
                    <button class="btn btn-edit" onclick="editTable(${table.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-delete" onclick="deleteTable(${table.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="table-card ${statusClass}">
                <div class="table-header">
                    <div class="table-number">Mesa ${table.number}</div>
                    <div class="table-status ${statusClass}">${statusText}</div>
                </div>
                <div class="table-info">
                    <p><i class="fas fa-tag"></i> ${table.name || `Mesa #${table.number}`}</p>
                    <p><i class="fas fa-users"></i> Capacidade: ${table.capacity} pessoas</p>
                    ${table.description ? `<p><i class="fas fa-info-circle"></i> ${table.description}</p>` : ''}
                </div>
                ${orderInfo}
                <div class="table-actions">
                    ${actions}
                </div>
            </div>
        `;
    }).join('');
}

// Show open table modal
function showOpenTableModal(tableId) {
    document.getElementById('openTableId').value = tableId;
    document.getElementById('customerName').value = '';
    document.getElementById('commandCount').value = '';
    
    // Limpar campos de comandas adicionais
    const additionalCommands = document.getElementById('additionalCommands');
    additionalCommands.style.display = 'none';
    document.getElementById('commandFields').innerHTML = '';
    
    showModal('openTableModal');
}

// Update command fields based on selected number
function updateCommandFields() {
    const commandCount = parseInt(document.getElementById('commandCount').value);
    const additionalCommands = document.getElementById('additionalCommands');
    const commandFields = document.getElementById('commandFields');
    
    if (commandCount <= 1) {
        additionalCommands.style.display = 'none';
        commandFields.innerHTML = '';
        return;
    }
    
    additionalCommands.style.display = 'block';
    commandFields.innerHTML = '';
    
    // Criar campos para comandas adicionais (começando da 2ª comanda)
    for (let i = 2; i <= commandCount; i++) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'command-field';
        fieldDiv.innerHTML = `
            <label>Comanda ${i}:</label>
            <input type="text" 
                   id="commandName${i}" 
                   name="commandName${i}"
                   placeholder="Nome do cliente da comanda ${i}" 
                   required>
        `;
        commandFields.appendChild(fieldDiv);
    }
}

// Show close table modal
function showCloseTableModal(tableId) {
    const table = currentTables.find(t => t.id === tableId);
    if (!table) return;
    
    document.getElementById('closeTableId').value = tableId;
    
    const info = document.getElementById('closeTableInfo');
    info.innerHTML = `
        <div class="table-order-info">
            <h4>Mesa ${table.number}</h4>
            <p><strong>Cliente:</strong> ${table.customer_name || 'Sem nome'}</p>
            <p><strong>Valor Total:</strong> R$ ${(table.total_amount || 0).toFixed(2)}</p>
            <p><strong>Aberto em:</strong> ${new Date(table.order_opened_at).toLocaleString()}</p>
        </div>
    `;
    
    showModal('closeTableModal');
}

// Open table
async function openTable(event) {
    event.preventDefault();
    
    const tableId = document.getElementById('openTableId').value;
    const customerName = document.getElementById('customerName').value;
    const commandCount = parseInt(document.getElementById('commandCount').value);
    
    if (!customerName.trim()) {
        showAlert('Nome do cliente principal é obrigatório', 'error');
        return;
    }
    
    if (!commandCount || commandCount < 1) {
        showAlert('Selecione o número de comandas', 'error');
        return;
    }
    
    // Coletar nomes das comandas adicionais
    const commandNames = [customerName]; // Primeira comanda sempre é do cliente principal
    
    if (commandCount > 1) {
        for (let i = 2; i <= commandCount; i++) {
            const commandNameField = document.getElementById(`commandName${i}`);
            if (commandNameField && commandNameField.value.trim()) {
                commandNames.push(commandNameField.value.trim());
            } else {
                showAlert(`Nome da comanda ${i} é obrigatório`, 'error');
                return;
            }
        }
    }
    
    try {
        const response = await fetch(`/api/tables/${tableId}/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                customer_name: customerName,
                command_count: commandCount,
                command_names: JSON.stringify(commandNames)
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao abrir mesa');
        }
        
        closeModal('openTableModal');
        await loadTables();
        showAlert(`Mesa aberta com sucesso! ${commandCount} comanda(s) criada(s).`, 'success');
    } catch (error) {
        console.error('Erro ao abrir mesa:', error);
        showAlert(error.message, 'error');
    }
}

// Confirm close table
async function confirmCloseTable() {
    const tableId = document.getElementById('closeTableId').value;
    
    try {
        const response = await fetch(`/api/tables/${tableId}/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao fechar mesa');
        }
        
        const result = await response.json();
        closeModal('closeTableModal');
        await loadTables();
        showAlert(`Mesa fechada! Total: R$ ${(result.total_amount || 0).toFixed(2)}`, 'success');
    } catch (error) {
        console.error('Erro ao fechar mesa:', error);
        showAlert(error.message, 'error');
    }
}

// Open table modal for creating new table
function openTableModal() {
    document.getElementById('tableForm').reset();
    document.getElementById('tableModalTitle').textContent = 'Nova Mesa';
    document.getElementById('tableId').value = '';
    showModal('tableModal');
}

// Edit table
function editTable(id) {
    const table = currentTables.find(t => t.id === id);
    if (!table) return;
    
    document.getElementById('tableModalTitle').textContent = 'Editar Mesa';
    document.getElementById('tableId').value = table.id;
    document.getElementById('tableName').value = table.name || '';
    document.getElementById('tableNumber').value = table.number;
    document.getElementById('tableCapacity').value = table.capacity;
    document.getElementById('tableDescription').value = table.description || '';
    showModal('tableModal');
}

// Save table (create or update)
async function saveTable(event) {
    event.preventDefault();
    
    const id = document.getElementById('tableId').value;
    const name = document.getElementById('tableName').value;
    const number = document.getElementById('tableNumber').value;
    const capacity = document.getElementById('tableCapacity').value;
    const description = document.getElementById('tableDescription').value;
    
    if (!name || !number || !capacity) {
        showAlert('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    try {
        const url = id ? `/api/tables/${id}` : '/api/tables';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                number: parseInt(number),
                capacity: parseInt(capacity),
                description: description,
                status: 'available'
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar mesa');
        }
        
        closeModal('tableModal');
        await loadTables();
        showAlert(`Mesa ${id ? 'atualizada' : 'criada'} com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao salvar mesa:', error);
        showAlert(error.message, 'error');
    }
}

// Delete table
async function deleteTable(id) {
    if (!confirm('Tem certeza que deseja deletar esta mesa?')) return;
    
    try {
        const response = await fetch(`/api/tables/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao deletar mesa');
        }
        
        await loadTables();
        showAlert('Mesa deletada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao deletar mesa:', error);
        showAlert(error.message, 'error');
    }
}

// Initialize tables when tab is activated
function initTables() {
    loadTables();
}

// ==================== END TABLES MANAGEMENT ====================

// ==================== ORDER MANAGEMENT ====================
// Show manage order modal
async function showManageOrderModal(tableId) {
    try {
        // Buscar informações da mesa e pedido ativo
        const tableResponse = await fetch(`/api/tables/${tableId}`);
        if (!tableResponse.ok) throw new Error('Erro ao buscar informações da mesa');
        
        const table = await tableResponse.json();
        
        if (!table.current_order_id) {
            showAlert('Esta mesa não possui pedido ativo', 'warning');
            return;
        }
        
        // Buscar itens do pedido
        const itemsResponse = await fetch(`/api/order-items/${table.current_order_id}`);
        if (!itemsResponse.ok) throw new Error('Erro ao buscar itens do pedido');
        
        currentOrderItems = await itemsResponse.json();
        currentOrderData = table;
        
        // Preencher informações do modal
        document.getElementById('orderTableNumber').textContent = table.number;
        document.getElementById('currentOrderId').value = table.current_order_id;
        document.getElementById('orderCustomerName').textContent = table.customer_name || 'Sem nome';
        document.getElementById('orderOpenedAt').textContent = new Date(table.order_opened_at).toLocaleString();
        
        // Configurar comandas
        setupOrderCommands(table);
        
        // Carregar produtos no select
        await loadProductsForOrder();
        
        // Renderizar itens do pedido
        renderOrderItems();
        
        // Mostrar modal
        showModal('manageOrderModal');
        
    } catch (error) {
        console.error('Erro ao carregar pedido:', error);
        showAlert('Erro ao carregar pedido: ' + error.message, 'error');
    }
}

// Setup commands for order modal
function setupOrderCommands(table) {
    const commandsInfo = document.getElementById('commandsInfo');
    const commandsList = document.getElementById('commandsList');
    const itemCommand = document.getElementById('itemCommand');
    
    // Parse command names
    let commandNames = [];
    try {
        if (table.command_names) {
            commandNames = JSON.parse(table.command_names);
        } else {
            commandNames = [table.customer_name || 'Cliente Principal'];
        }
    } catch (e) {
        commandNames = [table.customer_name || 'Cliente Principal'];
    }
    
    // Store current commands globally
    window.currentCommands = commandNames;
    
    if (commandNames.length > 1) {
        // Show commands info for multiple commands
        commandsInfo.style.display = 'block';
        commandsList.innerHTML = commandNames.map((name, index) => `
            <div class="command-item clickable-command" data-command-index="${index}">
                <div class="command-number">${index + 1}</div>
                <div class="command-name">${name}</div>
            </div>
        `).join('') +
        `<button id="showAllCommandsBtn" class="btn btn-secondary btn-small" style="margin-top:8px;display:none;width:100%">Mostrar todos</button>`;

        // Adicionar event listeners para cada comanda clicável
        setTimeout(() => {
            const commandItems = commandsList.querySelectorAll('.clickable-command');
            commandItems.forEach(item => {
                item.addEventListener('click', function() {
                    const cmdIndex = parseInt(this.getAttribute('data-command-index'));
                    filterOrderItemsByCommand(cmdIndex);
                    // Destacar selecionada
                    commandItems.forEach(i => i.classList.remove('selected-command'));
                    this.classList.add('selected-command');
                    // Mostrar botão de mostrar todos
                    const showAllBtn = document.getElementById('showAllCommandsBtn');
                    if (showAllBtn) showAllBtn.style.display = 'block';
                });
            });
            // Botão para mostrar todos
            const showAllBtn = document.getElementById('showAllCommandsBtn');
            if (showAllBtn) {
                showAllBtn.addEventListener('click', function() {
                    renderOrderItems();
                    // Remover destaque
                    commandItems.forEach(i => i.classList.remove('selected-command'));
                    showAllBtn.style.display = 'none';
                });
            }
        }, 0);

        // Show command selector in add item form with all options
        itemCommand.style.display = 'block';
        itemCommand.innerHTML = '<option value="">Selecione a comanda</option>' +
            commandNames.map((name, index) => 
                `<option value="${index + 1}">Comanda ${index + 1}: ${name}</option>`
            ).join('');
    } else {
        // For single command, still show selector but with only one option
        commandsInfo.style.display = 'none';
        itemCommand.style.display = 'block';
        itemCommand.innerHTML = `<option value="1">Comanda 1: ${commandNames[0]}</option>`;
        itemCommand.value = '1'; // Auto-select the only option
        window.currentCommands = commandNames;
    }
}

// Filtra os itens do pedido pela comanda selecionada e atualiza a tabela principal
function filterOrderItemsByCommand(commandIndex) {
    const tbody = document.getElementById('orderItemsList');
    const totalElement = document.getElementById('orderTotal');
    if (!tbody || !totalElement) return;
    const items = (window.currentOrderItems || currentOrderItems || []).filter(item => (item.command_number || 1) === commandIndex + 1);
    let total = 0;
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhum item nesta comanda</td></tr>';
        totalElement.textContent = '0.00';
        return;
    }
    tbody.innerHTML = items.map(item => {
        const itemTotal = item.total_price || (item.unit_price * item.quantity);
        total += itemTotal;
        // Determinar nome da comanda
        const commandNumber = item.command_number || 1;
        let commandName = 'Comanda 1';
        if (window.currentCommands && window.currentCommands[commandNumber - 1]) {
            commandName = `Comanda ${commandNumber}: ${window.currentCommands[commandNumber - 1]}`;
        }
        return `
            <tr>
                <td><div class="command-cell">${commandName}</div></td>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.unit_price.toFixed(2)}</td>
                <td>R$ ${itemTotal.toFixed(2)}</td>
                <td>
                    ${window.currentCommands && window.currentCommands.length > 1 ? 
                        `<button class="btn-edit-command" onclick="showEditItemCommandModal(${item.id}, '${item.product_name}', ${commandNumber})" title="Editar Comanda">
                            <i class="fas fa-exchange-alt"></i>
                        </button>` : ''
                    }
                    <button class="btn btn-small btn-edit" onclick="editOrderItem(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-delete" onclick="removeOrderItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    totalElement.textContent = total.toFixed(2);
}

// Modal para exibir itens e total de uma comanda específica
function showCommandItemsModal(commandIndex) {
    // Filtrar itens da comanda selecionada
    const items = (window.currentOrderItems || currentOrderItems || []).filter(item => (item.command_number || 1) === commandIndex + 1);
    const commandName = (window.currentCommands && window.currentCommands[commandIndex]) ? window.currentCommands[commandIndex] : `Comanda ${commandIndex + 1}`;
    let total = 0;
    let itemsHtml = '';
    if (items.length === 0) {
        itemsHtml = '<tr><td colspan="4" class="no-data">Nenhum item nesta comanda</td></tr>';
    } else {
        itemsHtml = items.map(item => {
            const itemTotal = item.total_price || (item.unit_price * item.quantity);
            total += itemTotal;
            return `<tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.unit_price.toFixed(2)}</td>
                <td>R$ ${itemTotal.toFixed(2)}</td>
            </tr>`;
        }).join('');
    }

    // Criar modal se não existir
    let modal = document.getElementById('commandItemsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'commandItemsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" id="closeCommandItemsModal">&times;</span>
                <h3 id="commandItemsModalTitle"></h3>
                <div class="command-items-list">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Qtd</th>
                                <th>Unitário</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="commandItemsTableBody"></tbody>
                    </table>
                    <div class="command-items-total">Total: <span id="commandItemsTotal"></span></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    // Preencher dados
    document.getElementById('commandItemsModalTitle').textContent = `Itens da Comanda ${commandIndex + 1}: ${commandName}`;
    document.getElementById('commandItemsTableBody').innerHTML = itemsHtml;
    document.getElementById('commandItemsTotal').textContent = `R$ ${total.toFixed(2)}`;

    // Mostrar modal
    modal.style.display = 'block';
    // Fechar modal
    document.getElementById('closeCommandItemsModal').onclick = function() {
        modal.style.display = 'none';
    };
    // Fechar ao clicar fora
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Load products for order
async function loadProductsForOrder() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        const products = await response.json();
        const select = document.getElementById('itemProduct');
        
        select.innerHTML = '<option value="">Selecione um produto</option>';
        products.forEach(product => {
            if (product.stock_quantity > 0) {
                select.innerHTML += `<option value="${product.id}" data-price="${product.price}">${product.name} - R$ ${product.price.toFixed(2)}</option>`;
            }
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showAlert('Erro ao carregar produtos', 'error');
    }
}

// Add item to order
async function addItemToOrder() {
    const productId = document.getElementById('itemProduct').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const orderId = document.getElementById('currentOrderId').value;
    const commandSelect = document.getElementById('itemCommand');
    const commandNumber = commandSelect ? parseInt(commandSelect.value) || 1 : 1;
    
    if (!productId) {
        showAlert('Selecione um produto', 'warning');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        showAlert('Informe uma quantidade válida', 'warning');
        return;
    }
    
    // Verificar se comanda foi selecionada quando há múltiplas comandas
    if (window.currentCommands && window.currentCommands.length > 1 && !commandNumber) {
        showAlert('Selecione uma comanda para o item', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/order-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: orderId,
                product_id: productId,
                quantity: quantity,
                command_number: commandNumber
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar item');
        }
        
        // Recarregar itens do pedido
        const itemsResponse = await fetch(`/api/order-items/${orderId}`);
        if (itemsResponse.ok) {
            currentOrderItems = await itemsResponse.json();
            renderOrderItems();
        }
        
        // Limpar formulário (mas manter comanda selecionada se só há uma)
        document.getElementById('itemProduct').value = '';
        document.getElementById('itemQuantity').value = '1';
        if (window.currentCommands && window.currentCommands.length > 1) {
            commandSelect.value = '';
        }
        
        showAlert('Item adicionado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        showAlert('Erro ao adicionar item: ' + error.message, 'error');
    }
}

// Render order items
function renderOrderItems() {
    const tbody = document.getElementById('orderItemsList');
    const totalElement = document.getElementById('orderTotal');
    
    if (!tbody || !totalElement) return;
    
    if (currentOrderItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhum item no pedido</td></tr>';
        totalElement.textContent = '0.00';
        return;
    }
    
    let total = 0;
    tbody.innerHTML = currentOrderItems.map(item => {
        const itemTotal = item.total_price || (item.unit_price * item.quantity);
        total += itemTotal;
        
        // Determinar nome da comanda
        const commandNumber = item.command_number || 1;
        let commandName = 'Comanda 1';
        if (window.currentCommands && window.currentCommands[commandNumber - 1]) {
            commandName = `Comanda ${commandNumber}: ${window.currentCommands[commandNumber - 1]}`;
        }
        
        return `
            <tr>
                <td>
                    <div class="command-cell">${commandName}</div>
                </td>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>R$ ${item.unit_price.toFixed(2)}</td>
                <td>R$ ${itemTotal.toFixed(2)}</td>
                <td>
                    ${window.currentCommands && window.currentCommands.length > 1 ? 
                        `<button class="btn-edit-command" onclick="showEditItemCommandModal(${item.id}, '${item.product_name}', ${commandNumber})" title="Editar Comanda">
                            <i class="fas fa-exchange-alt"></i>
                        </button>` : ''
                    }
                    <button class="btn btn-small btn-edit" onclick="editOrderItem(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-delete" onclick="removeOrderItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    totalElement.textContent = total.toFixed(2);
}

// Remove item from order
async function removeOrderItem(itemId) {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    
    try {
        const response = await fetch(`/api/order-items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao remover item');
        }
        
        // Recarregar itens do pedido
        const orderId = document.getElementById('currentOrderId').value;
        const itemsResponse = await fetch(`/api/order-items/${orderId}`);
        if (itemsResponse.ok) {
            currentOrderItems = await itemsResponse.json();
            renderOrderItems();
        }
        
        showAlert('Item removido com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao remover item:', error);
        showAlert('Erro ao remover item: ' + error.message, 'error');
    }
}

// Edit order item quantity
async function editOrderItem(itemId) {
    const item = currentOrderItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newQuantity = prompt('Nova quantidade:', item.quantity);
    if (!newQuantity || newQuantity <= 0) return;
    
    try {
        const response = await fetch(`/api/order-items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: parseInt(newQuantity) })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar item');
        }
        
        // Recarregar itens do pedido
        const orderId = document.getElementById('currentOrderId').value;
        const itemsResponse = await fetch(`/api/order-items/${orderId}`);
        if (itemsResponse.ok) {
            currentOrderItems = await itemsResponse.json();
            renderOrderItems();
        }
        
        showAlert('Item atualizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        showAlert('Erro ao atualizar item: ' + error.message, 'error');
    }
}

// ==================== END ORDER MANAGEMENT ====================

// ==================== REPORTS MANAGEMENT ====================
let currentReportType = 'occupancy';

// Load reports based on current tab
async function loadCurrentReport() {
    const reportType = currentReportType;
    const dateFilter = document.getElementById('reportDate')?.value;
    const periodFilter = document.getElementById('reportPeriod')?.value;
    
    try {
        let url = `/api/reports/${reportType}`;
        const params = new URLSearchParams();
        
        if (dateFilter) params.append('date', dateFilter);
        if (periodFilter && periodFilter !== 'custom') {
            switch (periodFilter) {
                case 'today':
                    params.append('date', new Date().toISOString().split('T')[0]);
                    break;
                case '7days':
                    // Default behavior - últimos 7 dias
                    break;
                case '30days':
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    params.append('start_date', thirtyDaysAgo.toISOString().split('T')[0]);
                    params.append('end_date', new Date().toISOString().split('T')[0]);
                    break;
            }
        }
        
        if (params.toString()) url += '?' + params.toString();
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar relatório');
        
        const data = await response.json();
        renderReport(reportType, data);
        
    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        showAlert('Erro ao carregar relatório: ' + error.message, 'error');
    }
}

// Render report based on type
function renderReport(type, data) {
    const container = document.getElementById('report-content');
    if (!container) return;
    
    switch (type) {
        case 'occupancy':
            renderOccupancyReport(container, data);
            break;
        case 'waiters':
            renderWaitersReport(container, data);
            break;
        case 'revenue':
            renderRevenueReport(container, data);
            break;
        case 'sales':
            renderSalesReport(container, data);
            break;
        case 'comparison':
            renderComparisonReport(container, data);
            break;
        case 'popular':
            renderPopularItemsReport(container, data);
            break;
        default:
            container.innerHTML = '<p class="no-data">Tipo de relatório não encontrado</p>';
    }
}

// Render occupancy report
function renderOccupancyReport(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhum dado encontrado para o período selecionado</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="report-header">
            <h3>Relatório de Ocupação de Mesas</h3>
            <p class="report-summary">Total de mesas: ${data.length}</p>
        </div>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Mesa</th>
                        <th>Capacidade</th>
                        <th>Usos</th>
                        <th>Tempo Médio</th>
                        <th>Faturamento</th>
                        <th>Último Uso</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>Mesa ${row.table_number}</td>
                            <td>${row.capacity} pessoas</td>
                            <td>${row.total_uses || 0}</td>
                            <td>${row.avg_duration_minutes ? Math.round(row.avg_duration_minutes) + ' min' : 'N/A'}</td>
                            <td>R$ ${(row.total_revenue || 0).toFixed(2)}</td>
                            <td>${row.last_used ? new Date(row.last_used).toLocaleString() : 'Nunca'}</td>
                            <td><span class="status ${row.current_status}">${getStatusText(row.current_status)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render waiters report
function renderWaitersReport(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhum garçom encontrado</p>';
        return;
    }
    
    const totalSales = data.reduce((sum, waiter) => sum + (waiter.total_sales || 0), 0);
    const totalCommission = data.reduce((sum, waiter) => sum + (waiter.total_commission || 0), 0);
    
    container.innerHTML = `
        <div class="report-header">
            <h3>Relatório de Performance dos Garçons</h3>
            <div class="report-summary">
                <span>Total de Vendas: R$ ${totalSales.toFixed(2)}</span>
                <span>Total de Comissões: R$ ${totalCommission.toFixed(2)}</span>
            </div>
        </div>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Garçom</th>
                        <th>Turno</th>
                        <th>Pedidos</th>
                        <th>Vendas</th>
                        <th>Ticket Médio</th>
                        <th>Comissão</th>
                        <th>Pedidos Ativos</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(waiter => `
                        <tr>
                            <td>${waiter.waiter_name}</td>
                            <td>${waiter.shift}</td>
                            <td>${waiter.total_orders || 0}</td>
                            <td>R$ ${(waiter.total_sales || 0).toFixed(2)}</td>
                            <td>R$ ${(waiter.avg_order_value || 0).toFixed(2)}</td>
                            <td>R$ ${(waiter.total_commission || 0).toFixed(2)} (${waiter.commission_rate}%)</td>
                            <td>${waiter.active_orders || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render revenue report
function renderRevenueReport(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhum dado de faturamento encontrado</p>';
        return;
    }
    
    const totalRevenue = data.reduce((sum, row) => sum + (row.total_revenue || 0), 0);
    const totalOrders = data.reduce((sum, row) => sum + (row.total_orders || 0), 0);
    
    container.innerHTML = `
        <div class="report-header">
            <h3>Relatório de Faturamento</h3>
            <div class="report-summary">
                <span>Total de Pedidos: ${totalOrders}</span>
                <span>Faturamento Total: R$ ${totalRevenue.toFixed(2)}</span>
                <span>Ticket Médio: R$ ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}</span>
            </div>
        </div>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Período</th>
                        <th>Pedidos</th>
                        <th>Faturamento</th>
                        <th>Ticket Médio</th>
                        <th>Dinheiro</th>
                        <th>PIX</th>
                        <th>Cartão</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>${new Date(row.period).toLocaleDateString()}</td>
                            <td>${row.total_orders || 0}</td>
                            <td>R$ ${(row.total_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${(row.avg_order_value || 0).toFixed(2)}</td>
                            <td>R$ ${(row.cash_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${(row.pix_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${((row.credit_revenue || 0) + (row.debit_revenue || 0)).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render popular items report
function renderPopularItemsReport(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhum item vendido encontrado</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="report-header">
            <h3>Itens Mais Vendidos</h3>
            <p class="report-summary">Top ${data.length} produtos mais vendidos</p>
        </div>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Pedidos</th>
                        <th>Faturamento</th>
                        <th>Preço Médio</th>
                        <th>Preço Atual</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => `
                        <tr>
                            <td>${index + 1}º</td>
                            <td>${item.product_name}</td>
                            <td>${item.total_quantity}</td>
                            <td>${item.orders_count}</td>
                            <td>R$ ${(item.total_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${(item.avg_unit_price || 0).toFixed(2)}</td>
                            <td>R$ ${(item.current_price || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render sales report (vendas avulsas)
function renderSalesReport(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma venda avulsa encontrada para o período selecionado</p>';
        return;
    }
    
    const totalRevenue = data.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
    const totalSales = data.reduce((sum, item) => sum + (item.total_sales || 0), 0);
    const totalItems = data.reduce((sum, item) => sum + (item.total_items_sold || 0), 0);
    
    container.innerHTML = `
        <div class="report-header">
            <h3>Relatório de Vendas Avulsas</h3>
            <div class="report-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Total de Vendas:</span>
                        <span class="summary-value">${totalSales}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Faturamento Total:</span>
                        <span class="summary-value">R$ ${totalRevenue.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Itens Vendidos:</span>
                        <span class="summary-value">${totalItems}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Ticket Médio:</span>
                        <span class="summary-value">R$ ${totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00'}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Qtd. Vendas</th>
                        <th>Faturamento</th>
                        <th>Ticket Médio</th>
                        <th>Itens Vendidos</th>
                        <th>Produtos Únicos</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>${formatDate(item.period)}</td>
                            <td>${item.total_sales}</td>
                            <td>R$ ${(item.total_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${(item.avg_sale_value || 0).toFixed(2)}</td>
                            <td>${item.total_items_sold}</td>
                            <td>${item.unique_products}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render comparison report
function renderComparisonReport(container, data) {
    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhum dado encontrado para comparação</p>';
        return;
    }
    
    let totalMesas = { transactions: 0, revenue: 0 };
    let totalAvulsas = { transactions: 0, revenue: 0 };
    
    data.forEach(item => {
        totalMesas.transactions += item.mesas.total_transactions || 0;
        totalMesas.revenue += item.mesas.total_revenue || 0;
        totalAvulsas.transactions += item.avulsas.total_transactions || 0;
        totalAvulsas.revenue += item.avulsas.total_revenue || 0;
    });
    
    const totalGeral = totalMesas.revenue + totalAvulsas.revenue;
    const percentualMesas = totalGeral > 0 ? (totalMesas.revenue / totalGeral * 100).toFixed(1) : 0;
    const percentualAvulsas = totalGeral > 0 ? (totalAvulsas.revenue / totalGeral * 100).toFixed(1) : 0;
    
    container.innerHTML = `
        <div class="report-header">
            <h3>Comparativo: Vendas de Mesas vs Vendas Avulsas</h3>
            <div class="comparison-summary">
                <div class="comparison-item">
                    <h4>Vendas de Mesas</h4>
                    <div class="comparison-stats">
                        <p><strong>Transações:</strong> ${totalMesas.transactions}</p>
                        <p><strong>Faturamento:</strong> R$ ${totalMesas.revenue.toFixed(2)}</p>
                        <p><strong>Participação:</strong> ${percentualMesas}%</p>
                        <p><strong>Ticket Médio:</strong> R$ ${totalMesas.transactions > 0 ? (totalMesas.revenue / totalMesas.transactions).toFixed(2) : '0.00'}</p>
                    </div>
                </div>
                <div class="comparison-item">
                    <h4>Vendas Avulsas</h4>
                    <div class="comparison-stats">
                        <p><strong>Transações:</strong> ${totalAvulsas.transactions}</p>
                        <p><strong>Faturamento:</strong> R$ ${totalAvulsas.revenue.toFixed(2)}</p>
                        <p><strong>Participação:</strong> ${percentualAvulsas}%</p>
                        <p><strong>Ticket Médio:</strong> R$ ${totalAvulsas.transactions > 0 ? (totalAvulsas.revenue / totalAvulsas.transactions).toFixed(2) : '0.00'}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="report-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th rowspan="2">Data</th>
                        <th colspan="3">Vendas de Mesas</th>
                        <th colspan="3">Vendas Avulsas</th>
                    </tr>
                    <tr>
                        <th>Transações</th>
                        <th>Faturamento</th>
                        <th>Ticket Médio</th>
                        <th>Transações</th>
                        <th>Faturamento</th>
                        <th>Ticket Médio</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>${formatDate(item.period)}</td>
                            <td>${item.mesas.total_transactions || 0}</td>
                            <td>R$ ${(item.mesas.total_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${(item.mesas.avg_transaction_value || 0).toFixed(2)}</td>
                            <td>${item.avulsas.total_transactions || 0}</td>
                            <td>R$ ${(item.avulsas.total_revenue || 0).toFixed(2)}</td>
                            <td>R$ ${(item.avulsas.avg_transaction_value || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'available': 'Disponível',
        'occupied': 'Ocupada',
        'maintenance': 'Manutenção'
    };
    return statusMap[status] || 'Desconhecido';
}

// Handle report tab change
function switchReportTab(reportType) {
    currentReportType = reportType;
    
    // Update active tab
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.report === reportType) {
            btn.classList.add('active');
        }
    });
    
    loadCurrentReport();
}

// Add event listeners for report tabs
function initializeReports() {
    // Report tabs
    document.querySelectorAll('.report-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchReportTab(this.dataset.report);
        });
    });
    
    // Auto-load reports when tab becomes active
    const reportsTab = document.querySelector('[data-tab="reports"]');
    if (reportsTab) {
        reportsTab.addEventListener('click', function() {
            setTimeout(() => {
                loadCurrentReport();
            }, 100);
        });
    }
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        // Hide modal after animation
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }
}

// Show modal with smooth animation
function showModal(modalId) {
    console.log('🎭 showModal chamada para:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log('✅ Modal encontrado, exibindo...');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        // Trigger animation after display is set
        requestAnimationFrame(() => {
            modal.classList.add('show');
            console.log('✅ Classe "show" adicionada ao modal');
        });
    } else {
        console.error('❌ Modal não encontrado:', modalId);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}

// Exibe o modal de pagamento ao clicar em Finalizar Pedido
function showPaymentModal() {
    // Preencher dados do pedido no modal de pagamento
    const orderId = document.getElementById('currentOrderId').value;
    const tableNumber = document.getElementById('orderTableNumber').textContent;
    const total = document.getElementById('orderTotal').textContent;
    document.getElementById('paymentOrderId').value = orderId;
    document.getElementById('paymentTableNumber').textContent = tableNumber;
    document.getElementById('paymentTotal').textContent = total;
    document.getElementById('finalAmount').value = total;
    document.getElementById('discount').value = 0;
    document.getElementById('amountPaid').value = '';
    // Carregar métodos de pagamento se necessário
    // Exibir modal
    showModal('paymentModal');
}

// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the beginning of main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(alert, mainContent.firstChild);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Enhanced Button Interactions and UX Improvements
function enhanceButtonUX() {
    console.log('🎨 Aplicando melhorias de UX aos botões...');
    
    // Add loading states for async operations
    function addLoadingState(button, duration = 1000) {
        if (!button) return;
        
        const originalText = button.innerHTML;
        const originalDisabled = button.disabled;
        
        button.classList.add('btn-loading');
        button.disabled = true;
        
        setTimeout(() => {
            button.classList.remove('btn-loading');
            button.disabled = originalDisabled;
            button.innerHTML = originalText;
        }, duration);
    }
    
    // Enhanced ripple effect for better feedback
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add ripple effect to all buttons
    const allButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-edit, .btn-delete, .nav-btn');
    allButtons.forEach(button => {
        // Remove existing ripple listeners to avoid duplicates
        button.removeEventListener('click', createRipple);
        button.addEventListener('click', createRipple);
        
        // Add focus enhancement
        button.addEventListener('focus', function() {
            this.style.willChange = 'transform, box-shadow';
        });
        
        button.addEventListener('blur', function() {
            this.style.willChange = 'auto';
        });
        
        // Add touch feedback for mobile
        button.addEventListener('touchstart', function(e) {
            this.classList.add('btn-touched');
            this.style.transform = this.style.transform.replace(/scale\([^)]*\)/, '') + ' scale(0.95)';
        });
        
        button.addEventListener('touchend', function(e) {
            this.classList.remove('btn-touched');
            setTimeout(() => {
                if (!this.matches(':hover')) {
                    this.style.transform = this.style.transform.replace(/scale\([^)]*\)/, '');
                }
            }, 150);
        });
    });
    
    // Enhanced button state management
    function updateButtonState(button, state) {
        button.classList.remove('btn-loading', 'btn-success', 'btn-error');
        
        switch(state) {
            case 'loading':
                button.classList.add('btn-loading');
                break;
            case 'success':
                button.classList.add('btn-success');
                setTimeout(() => button.classList.remove('btn-success'), 2000);
                break;
            case 'error':
                button.classList.add('btn-error');
                setTimeout(() => button.classList.remove('btn-error'), 2000);
                break;
        }
    }
    
    // Add keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('nav-btn')) {
                e.preventDefault();
                focusedElement.click();
            }
        }
    });
    
    // Add smooth scroll to forms when validation fails
    function smoothScrollToFirstError() {
        const firstError = document.querySelector('.form-group.error, .alert-error, input:invalid');
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    // Enhanced form submission with better UX
    function enhanceFormSubmission() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitButton = form.querySelector('button[type="submit"], .btn-primary');
                if (submitButton) {
                    addLoadingState(submitButton, 2000);
                }
            });
        });
    }
    
    // Performance optimization for hover effects
    function optimizeHoverEffects() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-edit, .btn-delete');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.willChange = 'transform, box-shadow, background';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.willChange = 'auto';
            });
        });
    }
    
    // Initialize all enhancements
    enhanceFormSubmission();
    optimizeHoverEffects();
    
    // Global button state manager
    window.setButtonState = updateButtonState;
    window.addLoadingState = addLoadingState;
    
    console.log('✅ Melhorias de UX aplicadas aos botões');
}

// Add CSS animations for button states
function addButtonStateStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .btn-success {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%) !important;
            animation: successPulse 0.6s ease-out;
        }
        
        .btn-error {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
            animation: errorShake 0.5s ease-out;
        }
        
        @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes errorShake {
            0%, 20%, 40%, 60%, 80% { transform: translateX(0); }
            10%, 30%, 50%, 70% { transform: translateX(-3px); }
            20%, 40%, 60% { transform: translateX(3px); }
        }
        
        .btn-touched {
            transition: transform 0.1s ease-out;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .btn-primary, .btn-secondary, .btn-edit, .btn-delete {
                border: 2px solid currentColor;
                font-weight: bold;
            }
        }
        
        /* Focus improvements for keyboard navigation */
        .btn-primary:focus-visible,
        .btn-secondary:focus-visible,
        .btn-edit:focus-visible,
        .btn-delete:focus-visible,
        .nav-btn:focus-visible {
            outline: 3px solid #3498db;
            outline-offset: 2px;
            animation: focusPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes focusPulse {
            0%, 100% { outline-color: #3498db; }
            50% { outline-color: #5dade2; }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    // Add small delay to ensure all elements are ready
    setTimeout(() => {
        enhanceButtonUX();
        addButtonStateStyles();
    }, 200);
});

// Re-apply enhancements when content is dynamically updated
function reapplyButtonEnhancements() {
    setTimeout(() => {
        enhanceButtonUX();
    }, 100);
}

// Export for use in other functions
window.reapplyButtonEnhancements = reapplyButtonEnhancements;

// ===== ATRIBUIÇÕES GLOBAIS =====
// Função para garantir que as funções estejam no escopo global
function assignGlobalFunctions() {
    window.showProductModal = showProductModal;
    window.showCategoryModal = showCategoryModal;
    window.showSupplierModal = showSupplierModal;
    window.showSaleModal = showSaleModal;
    window.showCartModal = showCartModal;
    window.editProduct = editProduct;
    window.editCategory = editCategory;
    window.editSupplier = editSupplier;
    window.deleteProduct = deleteProduct;
    window.deleteCategory = deleteCategory;
    window.deleteSupplier = deleteSupplier;
    window.deleteSale = deleteSale;
    window.addToCart = addToCart;
    window.addToCartFromModal = addToCartFromModal;
    window.clearCart = clearCart;
    window.removeFromCart = removeFromCart;
    window.updateCartQuantity = updateCartQuantity;
    window.updateQuantity = updateQuantity;
    window.closeModal = closeModal;
    window.openTableModal = openTableModal;
    window.showOpenTableModal = showOpenTableModal;
    window.updateCommandFields = updateCommandFields;
    window.showCloseTableModal = showCloseTableModal;
    window.confirmCloseTable = confirmCloseTable;
    window.editTable = editTable;
    window.deleteTable = deleteTable;
    window.showManageOrderModal = showManageOrderModal;
    window.addItemToOrder = addItemToOrder;
    window.removeOrderItem = removeOrderItem;
    window.editOrderItem = editOrderItem;
    window.showPaymentModal = showPaymentModal;

    console.log('✅ Funções globais atribuídas:', {
        showProductModal: typeof window.showProductModal,
        showCategoryModal: typeof window.showCategoryModal,
        showSupplierModal: typeof window.showSupplierModal,
        showSaleModal: typeof window.showSaleModal,
        showCartModal: typeof window.showCartModal,
        editProduct: typeof window.editProduct,
        deleteProduct: typeof window.deleteProduct
    });
}

// Garantir que as funções estejam no escopo global para os onclick do HTML
window.showProductModal = showProductModal;
window.showCategoryModal = showCategoryModal;
window.showSupplierModal = showSupplierModal;
window.showSaleModal = showSaleModal;
window.showCartModal = showCartModal;
window.editProduct = editProduct;
window.editCategory = editCategory;
window.editSupplier = editSupplier;
window.deleteProduct = deleteProduct;
window.deleteCategory = deleteCategory;
window.deleteSupplier = deleteSupplier;
window.deleteSale = deleteSale;
window.addToCart = addToCart;
window.addToCartFromModal = addToCartFromModal;
window.clearCart = clearCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.updateQuantity = updateQuantity;
window.closeModal = closeModal;
window.openTableModal = openTableModal;
window.showOpenTableModal = showOpenTableModal;
window.updateCommandFields = updateCommandFields;
window.showCloseTableModal = showCloseTableModal;
window.confirmCloseTable = confirmCloseTable;
window.deleteTable = deleteTable;
window.showManageOrderModal = showManageOrderModal;
window.showPaymentModal = showPaymentModal;

console.log('✅ Funções globais carregadas:', {
    showProductModal: typeof window.showProductModal,
    showCategoryModal: typeof window.showCategoryModal,
    showSupplierModal: typeof window.showSupplierModal,
    showSaleModal: typeof window.showSaleModal,
    showCartModal: typeof window.showCartModal,
    editProduct: typeof window.editProduct,
    deleteProduct: typeof window.deleteProduct
});

// Função para forçar atribuições globais imediatamente
function forceGlobalAssignments() {
    console.log('🔧 Forçando atribuições globais...');
    
    // Verificar se as funções existem antes de atribuir
    if (typeof showProductModal !== 'undefined') {
        window.showProductModal = showProductModal;
        console.log('✅ showProductModal atribuído');
    } else {
        console.error('❌ showProductModal não definido');
    }
    
    if (typeof editProduct !== 'undefined') {
        window.editProduct = editProduct;
        console.log('✅ editProduct atribuído');
    } else {
        console.error('❌ editProduct não definido');
    }
    
    if (typeof deleteProduct !== 'undefined') {
        window.deleteProduct = deleteProduct;
        console.log('✅ deleteProduct atribuído');
    } else {
        console.error('❌ deleteProduct não definido');
    }
    
    // Atribuições das outras funções
    if (typeof showCategoryModal !== 'undefined') window.showCategoryModal = showCategoryModal;
    if (typeof editCategory !== 'undefined') window.editCategory = editCategory;
    if (typeof deleteCategory !== 'undefined') window.deleteCategory = deleteCategory;
    if (typeof showSupplierModal !== 'undefined') window.showSupplierModal = showSupplierModal;
    if (typeof editSupplier !== 'undefined') window.editSupplier = editSupplier;
    if (typeof deleteSupplier !== 'undefined') window.deleteSupplier = deleteSupplier;
    if (typeof showSaleModal !== 'undefined') window.showSaleModal = showSaleModal;
    if (typeof showCartModal !== 'undefined') window.showCartModal = showCartModal;
    if (typeof deleteSale !== 'undefined') window.deleteSale = deleteSale;
    if (typeof closeModal !== 'undefined') window.closeModal = closeModal;
    if (typeof addToCart !== 'undefined') window.addToCart = addToCart;
    if (typeof addToCartFromModal !== 'undefined') window.addToCartFromModal = addToCartFromModal;
    if (typeof clearCart !== 'undefined') window.clearCart = clearCart;
    if (typeof removeFromCart !== 'undefined') window.removeFromCart = removeFromCart;
    if (typeof updateCartQuantity !== 'undefined') window.updateCartQuantity = updateCartQuantity;
    if (typeof updateQuantity !== 'undefined') window.updateQuantity = updateQuantity;
    if (typeof openTableModal !== 'undefined') window.openTableModal = openTableModal;
    if (typeof showOpenTableModal !== 'undefined') window.showOpenTableModal = showOpenTableModal;
    if (typeof updateCommandFields !== 'undefined') window.updateCommandFields = updateCommandFields;
    if (typeof showCloseTableModal !== 'undefined') window.showCloseTableModal = showCloseTableModal;
    if (typeof confirmCloseTable !== 'undefined') window.confirmCloseTable = confirmCloseTable;
    if (typeof editTable !== 'undefined') window.editTable = editTable;
    if (typeof deleteTable !== 'undefined') window.deleteTable = deleteTable;
    if (typeof showManageOrderModal !== 'undefined') window.showManageOrderModal = showManageOrderModal;
    if (typeof addItemToOrder !== 'undefined') window.addItemToOrder = addItemToOrder;
    if (typeof removeOrderItem !== 'undefined') window.removeOrderItem = removeOrderItem;
    if (typeof editOrderItem !== 'undefined') window.editOrderItem = editOrderItem;
    if (typeof showPaymentModal !== 'undefined') window.showPaymentModal = showPaymentModal;
    
    console.log('✅ Funções atribuídas globalmente:', {
        showProductModal: typeof window.showProductModal,
        editProduct: typeof window.editProduct,
        deleteProduct: typeof window.deleteProduct
    });
    
    // Configurar botões imediatamente
    setTimeout(setupProductButtons, 200);
}

function setupProductButtons() {
    console.log('🔧 Configurando botões de produtos...');
    
    // Botão Novo Produto
    const newProductBtn = document.getElementById('new-product-btn');
    if (newProductBtn) {
        newProductBtn.onclick = function() {
            console.log('Clicou em Novo Produto');
            window.showProductModal();
        };
        console.log('✅ Botão Novo Produto configurado');
    }
    
    // Configurar botões das tabelas existentes
    updateProductTableButtons();
}

function updateProductTableButtons() {
    const productTable = document.getElementById('products-table-body');
    if (productTable) {
        // Remover listeners antigos e adicionar novos
        const editButtons = productTable.querySelectorAll('.btn-edit');
        const deleteButtons = productTable.querySelectorAll('.btn-delete');
        
        editButtons.forEach(btn => {
            const productId = btn.getAttribute('data-id');
            if (productId) {
                btn.onclick = function() {
                    console.log('Editando produto:', productId);
                    window.editProduct(parseInt(productId));
                };
            }
        });
        
        deleteButtons.forEach(btn => {
            const productId = btn.getAttribute('data-id');
            if (productId) {
                btn.onclick = function() {
                    console.log('Excluindo produto:', productId);
                    window.deleteProduct(parseInt(productId));
                };
            }
        });
        
        console.log('✅ Botões da tabela de produtos atualizados');
    }
}

// ===== INICIALIZAÇÃO FINAL =====
// Garantir que as funções sejam atribuídas ao final de tudo
setTimeout(function() {
    console.log('🔧 Atribuição final das funções globais...');
    forceGlobalAssignments();
}, 500);

// Também atribuir quando o DOM estiver completamente carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(forceGlobalAssignments, 1000);
    });
} else {
    setTimeout(forceGlobalAssignments, 1000);
}

// Função para mostrar modal de edição de comanda do item
function showEditItemCommandModal(itemId, productName, currentCommand) {
    if (!window.currentCommands || window.currentCommands.length <= 1) {
        showAlert('Não há outras comandas disponíveis para transferir este item', 'info');
        return;
    }
    // Remover modal existente se houver
    const existingModal = document.getElementById('editItemCommandModal');
    if (existingModal) existingModal.remove();

    // Montar opções do select
    let options = '';
    window.currentCommands.forEach((name, idx) => {
        const commandNum = idx + 1;
        if (commandNum !== currentCommand) {
            options += `<option value="${commandNum}">Comanda ${commandNum}: ${name}</option>`;
        }
    });

    // Criar HTML do modal dinamicamente
    const modalHtml = `
        <div id="editItemCommandModal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Alterar Comanda do Item</h3>
                    <button class="close-btn" onclick="closeEditItemCommandModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Produto:</strong> ${productName}</p>
                    <p><strong>Comanda Atual:</strong> Comanda ${currentCommand}${window.currentCommands[currentCommand - 1] ? ': ' + window.currentCommands[currentCommand - 1] : ''}</p>
                    <div class="form-group">
                        <label for="newCommand">Nova Comanda:</label>
                        <select id="newCommand" required>
                            <option value="">Selecione</option>
                            ${options}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="closeEditItemCommandModal()">Cancelar</button>
                    <button type="button" class="btn-primary" id="btnAlterarComanda" disabled onclick="updateItemCommand(${itemId}, ${currentCommand})">Alterar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // Habilitar botão apenas se selecionar uma opção
    const select = document.getElementById('newCommand');
    const btn = document.getElementById('btnAlterarComanda');
    select.addEventListener('change', function() {
        btn.disabled = !select.value;
    });
}

// Função para fechar modal de edição de comanda
function closeEditItemCommandModal() {
    const modal = document.getElementById('editItemCommandModal');
    if (modal) {
        modal.remove();
    }
}

// Função para atualizar comanda do item
async function updateItemCommand(itemId, currentCommand) {
    const newCommandSelect = document.getElementById('newCommand');
    if (!newCommandSelect || !newCommandSelect.value) {
        showAlert('Selecione uma nova comanda', 'warning');
        return;
    }
    
    const newCommand = parseInt(newCommandSelect.value);
    const orderId = document.getElementById('currentOrderId').value;
    
    try {
        const response = await fetch(`/api/order-items/${itemId}/command`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command_number: newCommand
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao alterar comanda do item');
        }
        
        // Recarregar itens do pedido
        const itemsResponse = await fetch(`/api/order-items/${orderId}`);
        if (itemsResponse.ok) {
            currentOrderItems = await itemsResponse.json();
            renderOrderItems();
        }
        
        closeEditItemCommandModal();
        showAlert('Comanda do item alterada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao alterar comanda do item:', error);
        showAlert('Erro ao alterar comanda: ' + error.message, 'error');
    }
}
