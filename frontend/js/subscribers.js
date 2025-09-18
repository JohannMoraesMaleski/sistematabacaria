// Variável global para armazenar os mensalistas
let subscribers = [];

// Carregar mensalistas
async function loadSubscribers() {
    try {
        subscribers = await apiCall('/subscribers');
        renderSubscribersTable();
    } catch (error) {
        console.error('Error loading subscribers:', error);
        showAlert('Erro ao carregar mensalistas', 'error');
    }
}

// Renderizar tabela de mensalistas
function renderSubscribersTable() {
    const tbody = document.getElementById('subscribers-table-body');
    tbody.innerHTML = '';
    
    subscribers.forEach(subscriber => {
        const row = document.createElement('tr');
        const paymentDate = new Date(subscriber.payment_date);
        const status = isPaymentLate(paymentDate) ? 'Atrasado' : 'Em dia';
        const statusClass = isPaymentLate(paymentDate) ? 'status-late' : 'status-ok';
        
        row.innerHTML = `
            <td>${subscriber.name}</td>
            <td>${formatPhone(subscriber.phone)}</td>
            <td>${formatDate(subscriber.payment_date)}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
                <div class="btn-container">
                    <button class="btn-edit" onclick="editSubscriber(${subscriber.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteSubscriber(${subscriber.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Mostrar modal de mensalista
function showSubscriberModal(subscriber = null) {
    document.getElementById('subscriberModalTitle').textContent = subscriber ? 'Editar Mensalista' : 'Novo Mensalista';
    document.getElementById('subscriberId').value = subscriber ? subscriber.id : '';
    document.getElementById('subscriberName').value = subscriber ? subscriber.name : '';
    document.getElementById('subscriberPhone').value = subscriber ? subscriber.phone : '';
    document.getElementById('subscriberPaymentDate').value = subscriber ? subscriber.payment_date : '';
    
    showModal('subscriberModal');
}

// Editar mensalista
function editSubscriber(id) {
    const subscriber = subscribers.find(s => s.id === id);
    if (subscriber) {
        showSubscriberModal(subscriber);
    }
}

// Deletar mensalista
async function deleteSubscriber(id) {
    if (!confirm('Tem certeza que deseja excluir este mensalista?')) return;
    
    try {
        await apiCall(`/subscribers/${id}`, { method: 'DELETE' });
        showAlert('Mensalista excluído com sucesso', 'success');
        await loadSubscribers();
    } catch (error) {
        showAlert('Erro ao excluir mensalista', 'error');
        console.error('Error deleting subscriber:', error);
    }
}

// Salvar mensalista
async function handleSubscriberSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('subscriberName').value,
        phone: document.getElementById('subscriberPhone').value.replace(/\D/g, ''),
        payment_date: document.getElementById('subscriberPaymentDate').value
    };
    
    const id = document.getElementById('subscriberId').value;
    
    try {
        if (id) {
            await apiCall(`/subscribers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showAlert('Mensalista atualizado com sucesso', 'success');
        } else {
            await apiCall('/subscribers', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showAlert('Mensalista cadastrado com sucesso', 'success');
        }
        
        closeModal('subscriberModal');
        await loadSubscribers();
    } catch (error) {
        showAlert('Erro ao salvar mensalista', 'error');
        console.error('Error saving subscriber:', error);
    }
}

// Funções auxiliares
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.substr(0,2)}) ${cleaned.substr(2,5)}-${cleaned.substr(7)}`;
    }
    return phone;
}

function isPaymentLate(paymentDate) {
    const today = new Date();
    return new Date(paymentDate) < today;
}

// Inicializar quando a aba de mensalistas for aberta
document.querySelector('[data-tab="subscribers"]').addEventListener('click', loadSubscribers);