let cart = [];

// Load cart from storage
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

function updateCartDisplay() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
}

// SIDEBAR 
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

if (menuBtn && closeBtn && sidebar && overlay) {
    menuBtn.addEventListener('click', function() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 900) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    window.addEventListener('resize', function() {
        if (window.innerWidth > 900) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

//  LOAD ORDERS with "Complimentary Item" 
async function loadOrders() {

    const ordersList = document.getElementById('ordersList');
    const deleteAllRow = document.getElementById('deleteAllRow');

    // Show loading state
    ordersList.innerHTML = `
        <div class="empty-history">
            <p><i class="fas fa-spinner fa-spin"></i> Loading your orders...</p>
        </div>
    `;

    // Check logged-in user
    const session = Api.getSession();

    if (!session || !session.userId) {

        if (deleteAllRow) {
            deleteAllRow.style.display = 'none';
        }

        ordersList.innerHTML = `
            <div class="empty-history">
                <p><i class="fas fa-lock"></i> Please login to view your order history.</p>
                <div class="empty-history-links">
                    <br>
                    <a href="login.html" class="browse-link">
                        <i class="fas fa-right-to-bracket"></i> Login
                    </a>
                </div>
            </div>
        `;

        return;
    }

    // Get orders from database
    const result = await Api.getOrderHistory(session.userId);

    if (!result.success) {

        if (deleteAllRow) {
            deleteAllRow.style.display = 'none';
        }

        ordersList.innerHTML = `
            <div class="empty-history">
                <p><i class="fas fa-exclamation-circle"></i> Unable to load orders.</p>
                <p>${result.message || 'Something went wrong.'}</p>
            </div>
        `;

        return;
    }

    const orders = result.data?.orders || [];

    // Show and hide delete all button
    if (deleteAllRow) {
        deleteAllRow.style.display = orders.length > 0 ? 'block' : 'none';
    }

    // No orders
    if (orders.length === 0) {

        ordersList.innerHTML = `
            <div class="empty-history">
                <p>No orders yet! 😊</p>
                <p>Your orders will appear here after checkout.</p>

                <div class="empty-history-links">
                    <br>

                    <a href="test.html" class="browse-link">
                        <i class="fas fa-utensils"></i> Browse Menu
                    </a>

                    <br><br>

                    <a href="custom.html" class="customize-link">
                        <i class="fas fa-sliders-h"></i> Customize Pizza
                    </a>
                </div>
            </div>
        `;

        return;
    }

    let ordersHTML = '';

    orders.forEach(order => {

        const orderDate = order.created_at
            ? new Date(order.created_at)
            : null;

        const formattedDate = orderDate
            ? orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Date not available';

        let itemsHTML = '';

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        if (items.length > 0) {

            items.forEach(item => {

                const qty = item.quantity || 1;
                const price = parseFloat(item.price || 0);

                itemsHTML += `
                    <div class="order-item">
                        ${item.pizza || 'Pizza'}
                        ${item.size ? `(${item.size})` : ''}
                        x${qty}
                        - Rs.${(price * qty).toFixed(2)}
                    </div>
                `;
            });

        } else {

            itemsHTML = `
                <div class="order-item">
                    No items found
                </div>
            `;
        }

        const isVip = order.membership === 'vip';

        let xpHtml = '';

        if (order.xp_earned && !isVip) {

            xpHtml = `
                <div style="color:#ffc107; font-size:13px; margin-top:5px;">
                    ✨ XP Earned: ${order.xp_earned}
                </div>
            `;
        }

        let discountHtml = '';

        if (parseFloat(order.discount_amount || 0) > 0) {

            discountHtml = `
                <div style="color:#28a745; font-size:13px;">
                    Discount: ${order.discount_percent}%
                    (-Rs.${parseFloat(order.discount_amount).toFixed(2)})
                </div>
            `;
        }

        let compHtml = '';

        if (order.complimentary_item) {

            compHtml = `
                <div style="color:#ffc107; font-size:13px;">
                    🎁 Complimentary Item
                </div>
            `;
        }

        ordersHTML += `
            <div
                class="order-card"
                id="order-${order.id}"
                style="border-left-color: ${isVip ? '#ffc107' : '#ff5a2e'};"
            >

                <div class="order-header">

                    <div>

                        <div class="order-id">
                            Order #${order.order_number}
                        </div>

                        <div class="order-date">
                            ${formattedDate}
                        </div>

                        <div
                            class="order-status"
                            style="color:#28a745; font-size:14px; margin-top:5px;"
                        >
                            Status: ${order.status || 'confirmed'}
                            • ${order.delivery_type || 'pickup'}
                            • ${order.payment_method || 'cash'}

                            ${
                                isVip
                                ? `
                                    <span
                                        style="
                                            background:#ffc107;
                                            color:#000;
                                            padding:2px 6px;
                                            border-radius:12px;
                                            margin-left:8px;
                                        "
                                    >
                                        VIP
                                    </span>
                                `
                                : `
                                    <span
                                        style="
                                            background:#ff5a2e;
                                            padding:2px 6px;
                                            border-radius:12px;
                                        "
                                    >
                                        Level ${order.level || 1}
                                    </span>
                                `
                            }
                        </div>

                        ${xpHtml}
                        ${discountHtml}
                        ${compHtml}

                    </div>

                    <div style="display:flex; gap:10px;">

                        <button
                            class="reorder-btn"
                            onclick="reorderOrder('${order.order_number}')"
                            style="
                                background:#28a745;
                                color:white;
                                border:none;
                                padding:8px 15px;
                                border-radius:25px;
                                cursor:pointer;
                            "
                        >
                            🔄 Reorder
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteOrder('${order.order_number}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>

                <div class="order-items">
                    ${itemsHTML}
                </div>

                <div class="order-total">
                    Total: Rs.${parseFloat(order.final_total || 0).toFixed(2)}
                </div>

            </div>
        `;
    });

    ordersList.innerHTML = ordersHTML;
}

//  DELETE ORDER 
async function deleteOrder(orderNumber) {

    if (!confirm('Are you sure you want to delete this order?')) {
        return;
    }

    const session = Api.getSession();

    if (!session || !session.userId) {
        alert('Please login first.');
        window.location.href = 'login.html';
        return;
    }

    try {

        const response = await fetch('backend/delete_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: session.userId,
                orderNumber: orderNumber
            })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Failed to delete order.');
            return;
        }

        const orderElement = document.getElementById(
            'order-' + result.data.orderId
        );

        if (orderElement) {
            orderElement.style.opacity = '0';
            orderElement.style.transform = 'translateX(20px)';

            setTimeout(() => {
                orderElement.remove();
                loadOrders();
            }, 300);
        } else {
            loadOrders();
        }

        alert('Order deleted successfully.');

    } catch (error) {

        console.error('Delete order error:', error);

        alert('Unable to delete order. Please try again.');
    }
}

//  DELETE ALL ORDERS 
async function deleteAllOrders() {

    const session = Api.getSession();

    if (!session || !session.userId) {
        alert('Please login first.');
        window.location.href = 'login.html';
        return;
    }

    const result = await Api.getOrderHistory(session.userId);

    if (!result.success) {
        alert(result.message || 'Unable to load your orders.');
        return;
    }

    const orders = result.data?.orders || [];

    if (orders.length === 0) {
        return;
    }

    if (!confirm(
        `⚠️ Are you sure you want to delete all ${orders.length} orders? This cannot be undone.`
    )) {
        return;
    }

    try {

        const response = await fetch('backend/delete_all_orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: session.userId
            })
        });

        const deleteResult = await response.json();

        if (!deleteResult.success) {
            alert(
                deleteResult.message ||
                'Failed to delete all orders.'
            );
            return;
        }

        alert(
            `${deleteResult.data?.deletedCount || 0} orders deleted successfully.`
        );

        loadOrders();

        updateCartDisplay();

    } catch (error) {

        console.error('Delete all orders error:', error);

        alert(
            'Unable to delete all orders. Please try again.'
        );
    }
}

//  REORDER FUNCTION 
function reorderOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
    for (let item of order.items) {
        let existing = cart.find(i => i.pizza === item.pizza && i.size === item.size);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }
    }
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
    alert('Items added to your cart! Redirecting to checkout...');
    window.location.href = 'checkout.html';
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    loadOrders();
    // Scroll animations
    setTimeout(() => {
        document.querySelectorAll('.order-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(card);
        });
    }, 100);
});