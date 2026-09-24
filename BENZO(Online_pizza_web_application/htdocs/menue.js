
let cart = [];

// Load cart from storage
if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

// Update cart display
function updateCartDisplay() {
    
    document.getElementById('cartCount').textContent = cart.length;
    
    
    document.getElementById('cartCountDisplay').textContent = cart.length;
    
    // Calculate total
    let total = 0;
    cart.forEach(item => {
        total += item.price;
    });
    document.getElementById('cartTotalDisplay').textContent = total.toFixed(2);
}

// Navbar behavior
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
    hideTimeout = setTimeout(() => {
        if (window.scrollY > 100) {
            header.classList.add('hidden');
        }
    }, 1000);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

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


function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// Add to cart function
function addToCart(pizzaName, size, price) {
    const item = {
        id: Date.now(),
        pizza: pizzaName,
        size: size,
        price: parseFloat(price),
        date: new Date().toLocaleString()
    };
    
    cart.push(item);
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
    
    showNotification('Added to cart: ' + pizzaName + ' (' + size + ') - Rs.' + price);
    updateCartDisplay();
}

// Initialize once on page load
window.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    initNavbar();
    
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const pizzaName = this.getAttribute('data-pizza');
            const size = this.getAttribute('data-size');
            const price = this.getAttribute('data-price');
            
            addToCart(pizzaName, size, price);
        });
    });
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.pizza-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

//  CATEGORY and SEARCH FILTERS 
(function initFilters() {
    function setupFilters() {
        const pizzaCards = document.querySelectorAll('.pizza-card');
        const searchInput = document.getElementById('searchInput');
        const categoryBtns = document.querySelectorAll('.filter-btn');
        const noResultsDiv = document.getElementById('noResultsMsg');
        if (!pizzaCards.length || !searchInput || !categoryBtns.length) return;

        let activeCategory = 'all';

        function getSearchTerm() {
            return searchInput.value.trim().toLowerCase();
        }

        function filterPizzas() {
            const term = getSearchTerm();
            let anyVisible = false;

            pizzaCards.forEach(card => {
                const cardCat = card.getAttribute('data-category') || '';
                const nameEl = card.querySelector('.pizza-title');
                const pizzaName = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
                const descEl = card.querySelector('.flip-card-back p');
                const description = descEl ? descEl.textContent.trim().toLowerCase() : '';
                const textMatch = pizzaName + ' ' + description;
                
                const catMatch = (activeCategory === 'all') || (cardCat === activeCategory);
                const searchMatch = (term === '') || textMatch.includes(term);

                if (catMatch && searchMatch) {
                    card.classList.remove('filter-hidden');
                    anyVisible = true;
                } else {
                    card.classList.add('filter-hidden');
                }
            });

            if (noResultsDiv) {
                noResultsDiv.style.display = anyVisible ? 'none' : 'block';
            }
        }

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-category');
                if (cat) {
                    activeCategory = cat;
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterPizzas();
                }
            });
        });

        searchInput.addEventListener('input', () => filterPizzas());

        filterPizzas();
    }

    document.addEventListener('pizzasLoaded', setupFilters);
})();


// LOAD PIZZAS FROM DATABASE
async function loadPizzas() {

    const container = document.getElementById('pizzaCardsContainer');
    const noResultsDiv = document.getElementById('noResultsMsg');

    if (!container) {
        console.error('Pizza cards container not found.');
        return;
    }

    try {

        const result = await Api.getPizzas();

        console.log('Pizza data from database:', result);

        if (!result.success) {
            console.error('Failed to load pizzas:', result.message);
            return;
        }

        const pizzas = result.data || [];

        console.log('Number of pizzas from database:', pizzas.length);

        // Remove hard-coded pizzas
        container.innerHTML = '';

        // If database is empty
        if (pizzas.length === 0) {

            if (noResultsDiv) {
                noResultsDiv.textContent = 'No pizzas available.';
                noResultsDiv.style.display = 'block';
            }

            return;
        }

        // Create pizza cards from database
        pizzas.forEach(pizza => {

            const card = document.createElement('div');

            card.className = 'pizza-card';

            card.setAttribute('data-category', pizza.category || '');
            card.setAttribute('data-pizza-name', pizza.name || '');
            card.setAttribute('data-is-new', pizza.is_new || '0');
            // Show NEW badge when pizza is marked as new in database
if (String(pizza.is_new) === '1') {
    const newBadge = document.createElement('div');
    newBadge.className = 'new-badge';
    newBadge.textContent = 'NEW';
    card.appendChild(newBadge);
}

            card.innerHTML = `
                ${String(pizza.is_new) === '1' ? '<div class="new-badge">NEW</div>' : ''}
                <div class="flip-card-inner">

                    <div
                        class="flip-card-front"
                        style="background-image: url('${pizza.image || ''}');">
                    </div>

                    <div class="flip-card-back">

                        <h3>${pizza.name || ''}</h3>

                        <p>${pizza.description || ''}</p>

                        <div class="pizza-prices">

                            <button
                                class="size-btn order-btn"
                                data-pizza="${pizza.name || ''}"
                                data-size="Small"
                                data-price="${Number(pizza.small_price || 0)}">
                                Small - Rs.${Number(pizza.small_price || 0).toFixed(0)}
                            </button>

                            <button
                                class="size-btn order-btn"
                                data-pizza="${pizza.name || ''}"
                                data-size="Medium"
                                data-price="${Number(pizza.medium_price || 0)}">
                                Medium - Rs.${Number(pizza.medium_price || 0).toFixed(0)}
                            </button>

                            <button
                                class="size-btn order-btn"
                                data-pizza="${pizza.name || ''}"
                                data-size="Large"
                                data-price="${Number(pizza.large_price || 0).toFixed(0)}">
                                Large - Rs.${Number(pizza.large_price || 0).toFixed(0)}
                            </button>

                        </div>

                    </div>

                </div>

                <div class="pizza-info">

                    <h3 class="pizza-title">
                        ${pizza.name || ''}
                    </h3>

                </div>
            `;

            container.appendChild(card);

        });

        // Add cart functionality
        container.querySelectorAll('.order-btn').forEach(button => {

            button.addEventListener('click', function (event) {

                event.stopPropagation();

                const pizzaName = this.getAttribute('data-pizza');
                const size = this.getAttribute('data-size');
                const price = this.getAttribute('data-price');

                addToCart(pizzaName, size, price);

            });

        });

        // Animation for dynamically loaded cards
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';

                }

            });

        }, observerOptions);

        container.querySelectorAll('.pizza-card').forEach(card => {

            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition =
                'opacity 0.5s ease, transform 0.5s ease';

            observer.observe(card);

        });

        // Tell filter system that database pizzas are ready
        document.dispatchEvent(new Event('pizzasLoaded'));

    } catch (error) {

        console.error('Error loading pizzas from database:', error);

    }
}


// Load database pizzas when page opens
window.addEventListener('DOMContentLoaded', async () => {

    updateCartDisplay();
    initNavbar();

    await loadPizzas();

});