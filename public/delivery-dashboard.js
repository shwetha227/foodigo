document.addEventListener('DOMContentLoaded', () => {
    loadPendingOrders();
    setupEventListeners();
});

function loadPendingOrders() {
    fetch('/api/pending-orders')
        .then(response => response.json())
        .then(orders => {
            const pendingOrdersContainer = document.getElementById('pending-orders');
            pendingOrdersContainer.innerHTML = '';

            orders.forEach(order => {
                const orderElement = createOrderElement(order);
                pendingOrdersContainer.appendChild(orderElement);
            });
        })
        .catch(error => console.error('Error loading pending orders:', error));
}

function createOrderElement(order) {
    const template = document.getElementById('order-template');
    const orderElement = template.content.cloneNode(true);

    orderElement.querySelector('.order-id').textContent = order.id;
    orderElement.querySelector('.customer-name').textContent = order.customer_name;
    orderElement.querySelector('.delivery-address').textContent = order.delivery_address;
    orderElement.querySelector('.order-total').textContent = order.total.toFixed(2);

    const itemsList = orderElement.querySelector('.order-items');
    order.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`;
        itemsList.appendChild(li);
    });

    const acceptBtn = orderElement.querySelector('.accept-order-btn');
    acceptBtn.dataset.orderId = order.id;

    return orderElement.firstElementChild;
}

function setupEventListeners() {
    document.getElementById('pending-orders').addEventListener('click', event => {
        if (event.target.classList.contains('accept-order-btn')) {
            const orderId = event.target.dataset.orderId;
            acceptOrder(orderId);
        }
    });
}

function acceptOrder(orderId) {
    fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const orderCard = document.querySelector(`[data-order-id="${orderId}"]`).closest('.order-card');
                orderCard.remove();
                showNotification('Order accepted successfully!');
            }
        })
        .catch(error => {
            console.error('Error accepting order:', error);
            showNotification('Failed to accept order', 'error');
        });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 