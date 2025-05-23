document.addEventListener('DOMContentLoaded', () => {
    loadAvailableOrders();
    setupEventListeners();
    loadDeliveryPartnerInfo();
    loadEarningsAndRatings();
});

async function loadAvailableOrders() {
    const availableOrdersContainer = document.getElementById('availableOrders');
    if (!availableOrdersContainer) return;

    availableOrdersContainer.innerHTML = '<p>Loading available orders...</p>';

    try {
        const response = await fetch('http://localhost:3001/api/available-orders');
        if (response.ok) {
            const orders = await response.json();
            availableOrdersContainer.innerHTML = '';

            if (orders.length === 0) {
                availableOrdersContainer.innerHTML = '<p>No available orders at the moment.</p>';
                return;
            }

            orders.forEach(order => {
                const orderElement = createAvailableOrderElement(order);
                availableOrdersContainer.appendChild(orderElement);
            });
            
            setupEventListeners();

        } else {
            console.error('Error loading available orders:', response.status, response.statusText);
            availableOrdersContainer.innerHTML = '<p>Error loading available orders.</p>';
        }
    } catch (error) {
        console.error('Error loading available orders:', error);
        availableOrdersContainer.innerHTML = '<p>Error loading available orders.</p>';
    }
}

function createAvailableOrderElement(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.dataset.orderId = order.order_id;

    orderCard.innerHTML = `
        <div class="order-header">
            <h3>Order #${order.order_id}</h3>
            <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
        </div>
        <div class="order-details">
            <p><strong>Customer:</strong> ${order.customer_name || 'N/A'}</p>
            <p><strong>Address:</strong> ${order.delivery_address || 'N/A'}</p>
            <p><strong>Items:</strong> ${order.items && order.items.length > 0 ? order.items.map(item => `${item.quantity}x ${item.name}`).join(', ') : 'N/A'}</p>
            <p><strong>Total Amount:</strong> ₹${order.total_amount !== undefined ? order.total_amount.toFixed(2) : 'N/A'}</p>
        </div>
        <div class="order-actions">
            <button class="accept-order-btn" data-order-id="${order.order_id}">Accept Order</button>
        </div>
    `;
    
    return orderCard;
}

function setupEventListeners() {
    document.querySelectorAll('.accept-order-btn').forEach(button => {
        button.removeEventListener('click', handleAcceptButtonClick);
    });

    document.querySelectorAll('#availableOrders .accept-order-btn').forEach(button => {
        button.addEventListener('click', handleAcceptButtonClick);
    });
}

function handleAcceptButtonClick(event) {
    const orderId = event.target.dataset.orderId;
    acceptOrder(orderId);
}

function acceptOrder(orderId) {
    // Get the delivery partner ID from localStorage
    const deliveryPartnerId = localStorage.getItem('userId');

    if (!deliveryPartnerId) {
        console.error('Delivery Partner ID not found in localStorage.');
        showNotification('Could not accept order: Delivery partner not identified.', 'error');
        return;
    }

    fetch(`http://localhost:3001/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryPartnerId: deliveryPartnerId })
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const acceptedOrderCard = document.querySelector(`#availableOrders .order-card[data-order-id="${orderId}"]`);
                if (acceptedOrderCard) {
                    acceptedOrderCard.remove();
                }
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

async function loadDeliveryPartnerInfo() {
    const partnerId = localStorage.getItem('userId');
    if (!partnerId) {
        console.error('Delivery Partner ID not found in localStorage.');
        document.getElementById('partnerInfo').innerHTML = '<p>Error loading partner information: User not logged in or ID missing.</p>';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/delivery-partners/${partnerId}`);
        if (response.ok) {
            const partner = await response.json();
            document.getElementById('partnerName').textContent = partner.name;
            document.getElementById('partnerEmail').textContent = partner.email;
            document.getElementById('partnerPhone').textContent = partner.phone_number;
            document.getElementById('partnerVehicle').textContent = partner.vehicle_details || 'N/A';
            document.getElementById('partnerStatus').textContent = partner.current_status || 'N/A';
        } else {
            console.error('Error fetching delivery partner info:', response.status, response.statusText);
            document.getElementById('partnerInfo').innerHTML = '<p>Error loading partner information.</p>';
        }
    } catch (error) {
        console.error('Error loading delivery partner info:', error);
        document.getElementById('partnerInfo').innerHTML = '<p>Error loading partner information.</p>';
    }
}

async function loadEarningsAndRatings() {
    const partnerId = localStorage.getItem('userId');
    if (!partnerId) {
        console.error('Delivery Partner ID not found in localStorage.');
        document.getElementById('earningsAndRatings').innerHTML = '<p>Error loading earnings and ratings: User not logged in or ID missing.</p>';
        return;
    }

    try {
        const earningsResponse = await fetch(`http://localhost:3001/api/delivery-partners/${partnerId}/earnings`);
        let totalEarnings = 'N/A';
        if (earningsResponse.ok) {
            const earningsData = await earningsResponse.json();
            totalEarnings = earningsData.totalEarnings !== undefined ? `₹${earningsData.totalEarnings.toFixed(2)}` : 'N/A';
        } else {
            console.error('Error fetching earnings:', earningsResponse.status, earningsResponse.statusText);
        }

        const ratingsResponse = await fetch(`http://localhost:3001/api/delivery-partners/${partnerId}/ratings`);
        let averageRating = 'N/A';
        if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            averageRating = ratingsData.averageRating !== undefined ? `${ratingsData.averageRating.toFixed(1)} / 5` : 'N/A';
        } else {
            console.error('Error fetching ratings:', ratingsResponse.status, ratingsResponse.statusText);
        }

        document.getElementById('totalEarnings').textContent = totalEarnings;
        document.getElementById('averageRating').textContent = averageRating;

    } catch (error) {
        console.error('Error loading earnings and ratings:', error);
        document.getElementById('earningsAndRatings').innerHTML = '<p>Error loading earnings and ratings.</p>';
    }
} 