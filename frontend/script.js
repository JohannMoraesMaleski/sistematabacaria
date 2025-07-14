// API Base URL
const API_BASE = '/api';

// Global data storage
let products = [];
let categories = [];
let suppliers = [];
let sales = [];

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
    
    // Initialize sidebar state on page load
    const body = document.body;
    if (sidebar.classList.contains('collapsed')) {
        body.classList.add('sidebar-collapsed');
    }
});

function setupSidebar() {
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', function() {
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

    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        sidebarOverlay.style.display = 'none';
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && 
                !sidebarToggle.contains(event.target) && 
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                sidebarOverlay.style.display = 'none';
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            sidebarOverlay.style.display = 'none';
        } else {
            sidebar.classList.remove('collapsed');
            body.classList.remove('sidebar-collapsed');
        }
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
                sidebar.classList.remove('open');
                sidebarOverlay.style.display = 'none';
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
}

function setupEventListeners() {
    // Navigation
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });

    // Forms
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);
    document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);

    // Sale form product selection
    document.getElementById('saleProduct').addEventListener('change', updateSalePrice);
    document.getElementById('saleQuantity').addEventListener('input', updateSaleTotal);
}

// Tab switching
function switchTab(tabId) {
    // Remove active class from current tab with fade out effect
    const currentActiveTab = document.querySelector('.tab-content.active');
    if (currentActiveTab) {
        currentActiveTab.style.opacity = '0';
        currentActiveTab.style.transform = 'translateY(-10px)';
    }
    
    // Add smooth transition delay
    setTimeout(() => {
        navButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        const newActiveTab = document.getElementById(tabId);
        newActiveTab.classList.add('active');
        
        // Reset styles for smooth fade in
        newActiveTab.style.opacity = '1';
        newActiveTab.style.transform = 'translateY(0)';
        
        // Reload data when switching tabs
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
        }
    }, 150);
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
    try {
        products = await apiCall('/products');
        renderProductsTable();
        loadProductSelections();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category_name || 'N/A'}</td>
            <td>${product.supplier_name || 'N/A'}</td>
            <td class="price">${formatCurrency(product.price)}</td>
            <td>${product.stock_quantity}</td>
            <td>
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
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
    modal.style.display = 'block';
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
    const product = products.find(p => p.id === id);
    if (product) {
        showProductModal(product);
    }
}

async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            await apiCall(`/products/${id}`, { method: 'DELETE' });
            showAlert('Produto excluído com sucesso', 'success');
            loadProducts();
        } catch (error) {
            showAlert('Erro ao excluir produto', 'error');
        }
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
                <button class="btn-edit" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
    
    modal.style.display = 'block';
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        showCategoryModal(category);
    }
}

async function deleteCategory(id) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        try {
            await apiCall(`/categories/${id}`, { method: 'DELETE' });
            showAlert('Categoria excluída com sucesso', 'success');
            loadCategories();
        } catch (error) {
            showAlert('Erro ao excluir categoria', 'error');
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
                <button class="btn-edit" onclick="editSupplier(${supplier.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="deleteSupplier(${supplier.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
    
    modal.style.display = 'block';
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
            <td>
                <button class="btn-delete" onclick="deleteSale(${sale.id})">
                    <i class="fas fa-trash"></i> Cancelar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showSaleModal() {
    const modal = document.getElementById('saleModal');
    const form = document.getElementById('saleForm');
    
    form.reset();
    loadProductSelections();
    modal.style.display = 'block';
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

async function handleSaleSubmit(event) {
    event.preventDefault();
    
    const formData = {
        product_id: parseInt(document.getElementById('saleProduct').value),
        quantity: parseInt(document.getElementById('saleQuantity').value)
    };
    
    try {
        await apiCall('/sales', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        showAlert('Venda realizada com sucesso', 'success');
        closeModal('saleModal');
        loadSales();
        loadProducts(); // Refresh products to update stock
        loadDashboard(); // Refresh dashboard
    } catch (error) {
        showAlert('Erro ao realizar venda', 'error');
    }
}

// Modal functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
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
