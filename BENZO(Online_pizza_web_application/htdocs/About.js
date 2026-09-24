//  CART SYSTEM 
let cart = [];

// Load cart from storage
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

// Update cart display
function updateCartDisplay() {
    // Update cart count in navbar
    document.getElementById('cartCount').textContent = cart.length;
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.animation = 'slideIn 0.3s';
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 2000);
}

// Go to checkout
function goToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty! Add some pizzas first.');
        return;
    }
    window.location.href = 'checkout.html';
}

//  SIDEBAR MENU TOGGLE 
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Open sidebar
menuBtn.addEventListener('click', function() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close sidebar
closeBtn.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close sidebar when clicking overlay
overlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close sidebar when clicking a link (on mobile)
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

// Update active link in sidebar
const currentPage = window.location.pathname.split('/').pop();
sidebarLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// Close sidebar on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 900) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Button click handlers for cards
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        const cardTitle = this.closest('.card').querySelector('h2').textContent;
        alert(`Thank you for your interest in ${cardTitle}! We'll keep you updated.`);
    });
});

// Card links click handlers
document.querySelectorAll('.card a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (this.getAttribute('href').includes('.html')) {
            return true;
        }
        e.preventDefault();
        const branchName = this.textContent.trim();
        alert(`You clicked on ${branchName}. This feature will be available soon!`);
    });
});

// NAVBAR SCROLL BEHAVIOR
const header = document.getElementById('header');
let lastScrollY = window.scrollY;
let hideTimeout;
let isScrolling;

function handleScroll() {
    window.clearTimeout(isScrolling);
    
    const currentScrollY = window.scrollY;
    
    isScrolling = setTimeout(function() {
        
        if (currentScrollY <= 50) {
            header.classList.remove('hidden');
        } 
        
        else if (currentScrollY > lastScrollY && currentScrollY > 100) {
            hideTimeout = setTimeout(() => {
                header.classList.add('hidden');
            }, 1000);
        }
       
        else if (currentScrollY < lastScrollY && currentScrollY > 100) {
            header.classList.remove('hidden');
            
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
        }
        
        lastScrollY = currentScrollY;
    }, 66);
}

// Initialize navbar behavior
function initNavbar() {
    // Hide navbar after 1 second on page load
    hideTimeout = setTimeout(() => {
        if (window.scrollY > 100) {
            header.classList.add('hidden');
        }
    }, 1000);
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    
    updateCartDisplay();
});

// Make functions available globally
window.goToCheckout = goToCheckout;