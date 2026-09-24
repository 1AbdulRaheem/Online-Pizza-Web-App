        // CART SYSTEM
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
            document.getElementById('cartTotalDisplay').textContent = total;
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
        
        // Add regional pizza to cart
        function addRegionalPizzaToCart(pizza) {
            const item = {
                id: Date.now(),
                pizza: `Regional Pizza (${pizza.city} - ${pizza.flavor})`,
                city: pizza.city,
                size: pizza.size,
                crust: pizza.crust,
                flavor: pizza.flavor,
                price: pizza.total,
                date: new Date().toLocaleString(),
                type: 'regional'
            };
            
            cart.push(item);
            localStorage.setItem('pizzaCart', JSON.stringify(cart));
            
            showNotification('Added to cart: Regional Pizza');
            updateCartDisplay();
        }
        
        // Go to checkout
        function goToCheckout() {
            if (cart.length === 0) {
                alert('Your cart is empty! Add some pizzas first.');
                return;
            }
            window.location.href = 'checkout.html';
        }

        // Data for crust options based on size
        const crusts = {
          None: [
            ["Regular", 0], 
            ["Thin Crust", 0], 
            ["Cheese Burst", 0], 
            ["Kabab Crust", 0] 
          ],
          Small: [
            ["Regular", 89],
            ["Thin Crust", 119],
            ["Cheese Burst", 149],
            ["Kabab Crust", 179]
          ],
          Medium: [
            ["Regular", 189],
            ["Thin Crust", 239],
            ["Cheese Burst", 279],
            ["Kabab Crust", 309]
          ],
          Large: [
            ["Regular", 289],
            ["Thin Crust", 349],
            ["Cheese Burst", 399],
            ["Kabab Crust", 459]
          ],
          "Extra Large": [
            ["Regular", 359],
            ["Thin Crust", 419],
            ["Cheese Burst", 499],
            ["Kabab Crust", 559]
          ]
        };

        // City-specific flavors with base prices (for Small size)
        const cityFlavors = {
          Lahore: [
            { name: "Spicy Karahi Pizza", basePrice: 150 },
            { name: "Lahori Chargha Pizza", basePrice: 120 }
          ],
          Karachi: [
            { name: "Beef Bihari Pizza", basePrice: 180 },
            { name: "Beef Kaleji Pizza", basePrice: 160 }
          ],
          Peshawar: [
            { name: "Chapli Nallli Pizza", basePrice: 140 },
            { name: "Peshawri Namkeen Pizza", basePrice: 130 }
          ],
          Balochistan: [
            { name: "Sajji Pizza", basePrice: 200 },
            { name: "Rosh Pizza", basePrice: 170 }
          ]
        };

        // Size multipliers for flavor prices
        const sizeMultiplier = {
          Small: 1,
          Medium: 1.2,
          Large: 1.4,
          "Extra Large": 1.6
        };

        // DOM Elements
        const cityEl = document.getElementById('city');
        const sizeEl = document.getElementById('size');
        const crustEl = document.getElementById('crust');
        const flavorGroup = document.getElementById('flavor-group');
        const flavorsList = document.getElementById('flavors-list');
        const totalPrice = document.getElementById('totalPrice');
        const confirmBtn = document.getElementById('confirmBtn');
        const pizzaImage = document.getElementById('pizzaImage');
        const historyToggleBtn = document.getElementById('historyToggleBtn');
        const historyWindow = document.getElementById('historyWindow');
        const historyContent = document.getElementById('historyContent');
        const header = document.getElementById('header');
        const saveToProfileBtn = document.getElementById('saveToProfileBtn');
        const modeToggleBtn = document.getElementById('modeToggleBtn');
        const profileBtn = document.getElementById('profileBtn');

        // User Profile Data
        let userProfile = {
          username: "Pizza Lover",
          bio: "Pizza enthusiast creating delicious combinations",
          followers: 24,
          following: false,
          pizzas: [],
          savedPizzas: [],
          badges: []
        };

        
        let lastScrollY = window.scrollY;
        let hideTimeout;
        let isScrolling;

        function handleScroll() {
          window.clearTimeout(isScrolling);
          
          const currentScrollY = window.scrollY;
          
          isScrolling = setTimeout(function() {
            // At the top of page show navbar
            if (currentScrollY <= 50) {
              header.classList.remove('hidden');
            } 
            // Scrolled down hide navbar after 1 second
            else if (currentScrollY > lastScrollY && currentScrollY > 100) {
              hideTimeout = setTimeout(() => {
                header.classList.add('hidden');
              }, 1000);
            }
            // Scrolling up but not at top keep navbar visible
            else if (currentScrollY < lastScrollY && currentScrollY > 100) {
              header.classList.remove('hidden');
              // Clear any pending hide timeout when scrolling up
              if (hideTimeout) {
                clearTimeout(hideTimeout);
              }
            }
            
            lastScrollY = currentScrollY;
          }, 66);
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
            // Auto-close sidebar on desktop if window gets larger
            if (window.innerWidth > 900) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

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

        // Initialize crust options based on selected size
        function setCrustOptions(size) {
          crustEl.innerHTML = '';
          (crusts[size] || crusts.Small).forEach(([val, price]) => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = `${val} - Rs.${price}`;
            opt.dataset.price = price;
            crustEl.appendChild(opt);
          });
          calculatePrice();
        }

        // Set city-specific flavors with dynamic pricing based on size
        function setCityFlavors(city, size) {
          flavorsList.innerHTML = '';
          
          if (city === "None") {
            flavorGroup.classList.add('hidden');
            return;
          }
          
          const flavors = cityFlavors[city];
          if (flavors) {
            const multiplier = sizeMultiplier[size] || 1;
            
            flavors.forEach(flavor => {
              const calculatedPrice = Math.round(flavor.basePrice * multiplier);
              const label = document.createElement('label');
              label.innerHTML = `
                <input type="radio" name="flavor" value="${flavor.name}" data-base-price="${flavor.basePrice}" data-price="${calculatedPrice}">
                ${flavor.name} - Rs.${calculatedPrice}
              `;
              flavorsList.appendChild(label);
            });
            flavorGroup.classList.remove('hidden');
          }
          
          calculatePrice();
        }

        // Update flavor prices when size changes
        function updateFlavorPrices(size) {
          const multiplier = sizeMultiplier[size] || 1;
          const flavorRadios = document.querySelectorAll('input[name="flavor"]');
          
          flavorRadios.forEach(radio => {
            const basePrice = parseInt(radio.dataset.basePrice);
            const newPrice = Math.round(basePrice * multiplier);
            radio.dataset.price = newPrice;
            
            // Update the label text
            const label = radio.parentElement;
            const newText = `${radio.value} - Rs.${newPrice}`;
            // Remove existing text nodes
            Array.from(label.childNodes).forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                label.removeChild(node);
              }
            });
            // Add new text after the input
            label.appendChild(document.createTextNode(' ' + newText));
          });
          
          calculatePrice();
        }

        // Calculate total price
        function calculatePrice() {
          let total = 0;

          // Size price
          total += parseInt(sizeEl.selectedOptions[0].dataset.price || 0);

          // Crust price
          total += parseInt(crustEl.selectedOptions[0].dataset.price || 0);

          // Selected flavor price
          const selectedFlavor = document.querySelector('input[name="flavor"]:checked');
          if (selectedFlavor) {
            total += parseInt(selectedFlavor.dataset.price || 0);
          }

          totalPrice.textContent = `Total: Rs.${total}`;
          
          
          
          return {
            city: cityEl.value,
            size: sizeEl.value,
            crust: crustEl.value,
            flavor: selectedFlavor ? selectedFlavor.value : "None",
            total: total
          };
        }


        // Save pizza configuration to localStorage
        function saveRegionalPizzaConfig(pizza) {
          localStorage.setItem('lastRegionalPizzaConfig', JSON.stringify(pizza));
          
          // Also save to history keep last 3
          let pizzaHistory = JSON.parse(localStorage.getItem('regionalPizzaHistory') || '[]');
          pizzaHistory.unshift({
            ...pizza,
            timestamp: new Date().toISOString()
          });
          
          
          if (pizzaHistory.length > 3) {
            pizzaHistory = pizzaHistory.slice(0, 3);
          }
          
          localStorage.setItem('regionalPizzaHistory', JSON.stringify(pizzaHistory));
        }

        // Load pizza configuration from localStorage
        function loadRegionalPizzaConfig() {
          const savedConfig = localStorage.getItem('lastRegionalPizzaConfig');
          if (savedConfig) {
            return JSON.parse(savedConfig);
          }
          return null;
        }

        // Apply a pizza configuration to the form
        function applyRegionalPizzaConfig(config) {
          // Set city
          cityEl.value = config.city;
          setCityFlavors(config.city, config.size);
          
          // Wait for flavors to load
          setTimeout(() => {
            // Set flavor
            const flavorRadios = document.querySelectorAll('input[name="flavor"]');
            flavorRadios.forEach(radio => {
              if (radio.value === config.flavor) {
                radio.checked = true;
              }
            });
            
            // Set size
            sizeEl.value = config.size;
            setCrustOptions(config.size);
            
            // Wait for crust options to update
            setTimeout(() => {
              // Set crust
              crustEl.value = config.crust;
              
              // Recalculate price
              calculatePrice();
            }, 100);
          }, 100);
        }

        // Load user profile from localStorage
        function loadUserProfile() {
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            userProfile = JSON.parse(savedProfile);
          }
        }

        // Save user profile to localStorage
        function saveUserProfile() {
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }

        
       // Save current regional pizza to profile
async function saveRegionalPizzaToProfile() {
    const pizzaConfig = calculatePrice();

    if (pizzaConfig.city === "None" || pizzaConfig.size === "None") {
        alert("Please select your city and pizza size first!");
        return;
    }

    if (pizzaConfig.flavor === "None") {
        alert("Please select a flavor for your regional pizza!");
        return;
    }

    // Check logged-in user
    const session = Api.getSession();

    if (!session || !session.userId) {
        alert("Please login first to save your pizza to your profile.");
        window.location.href = "login.html";
        return;
    }

    const pizzaName = prompt(
        "Give your pizza a name:",
        `${pizzaConfig.city} ${pizzaConfig.flavor} Pizza`
    );

    if (!pizzaName) return;

    const newPizza = {
        userId: session.userId,
        name: pizzaName,
        type: "regional",
        size: pizzaConfig.size,
        crust: pizzaConfig.crust,
        sauce: [],
        toppings: [],
        city: pizzaConfig.city,
        flavor: pizzaConfig.flavor,
        description: `Regional ${pizzaConfig.city} pizza with ${pizzaConfig.flavor}`,
        price: pizzaConfig.total,
        likes: 0,
        views: 0
    };

    // Save pizza to database
    const result = await Api.savePizzaToDatabase(newPizza);

    if (result.success) {

        // Keep local profile updated for compatibility
        userProfile.pizzas.unshift({
            ...newPizza,
            id: result.data.pizzaId,
            emoji: "🍕",
            comments: [],
            savedBy: [],
            createdAt: new Date().toISOString()
        });

        saveUserProfile();

        alert(`"${pizzaName}" has been saved to your profile!`);

    } else {

        alert(
            `Pizza save failed!\n\n${result.message}`
        );
    }
}

        // Function to populate history window
       async function populateRegionalHistoryWindow() {

  historyContent.innerHTML = `
    <p style="text-align:center;">
      <i class="fas fa-spinner fa-spin"></i> Loading your order history...
    </p>
  `;

  // Check logged-in user
  const session = Api.getSession();

  if (!session || !session.userId) {
    historyContent.innerHTML = `
      <div class="suggestion-card">
        <h3><i class="fas fa-lock"></i> Login Required</h3>
        <p>Please login to view your order history.</p>
        <button onclick="window.location.href='login.html'">
          Login
        </button>
      </div>
    `;
    return;
  }

  // Get orders from database for current user
  const result = await Api.getOrderHistory(session.userId);

  if (!result.success) {
    historyContent.innerHTML = `
      <div class="suggestion-card">
        <h3><i class="fas fa-exclamation-circle"></i> Unable to Load History</h3>
        <p>${result.message || 'Something went wrong while loading your orders.'}</p>
      </div>
    `;
    return;
  }

  const orders = result.data?.orders || [];

  if (orders.length === 0) {
    historyContent.innerHTML = `
      <div class="suggestion-card">
        <h3><i class="fas fa-history"></i> No Order History</h3>
        <p>You have not placed any orders yet.</p>
      </div>
    `;
    return;
  }

  // Display database orders
  orders.forEach(order => {

    const historyCard = document.createElement('div');
    historyCard.className = 'suggestion-card';

    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleString()
      : 'Date not available';

    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const itemsHtml = items.map(item => `
      <div style="margin-bottom:8px;">
        <strong>${item.pizza || 'Pizza'}</strong>
        ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
        ${item.crust ? `<br><small>Crust: ${item.crust}</small>` : ''}
        ${item.city ? `<br><small>City: ${item.city}</small>` : ''}
        ${item.flavor ? `<br><small>Flavor: ${item.flavor}</small>` : ''}
        ${item.toppings?.length
          ? `<br><small>Toppings: ${item.toppings.join(', ')}</small>`
          : ''}
        ${item.sauce?.length
          ? `<br><small>Sauces: ${item.sauce.join(', ')}</small>`
          : ''}
        <br><small>Quantity: ${item.quantity || 1}</small>
      </div>
    `).join('');

    historyCard.innerHTML = `
      <h3>
        <i class="fas fa-receipt"></i>
        Order #${order.order_number}
      </h3>

      <p>
        <strong>Date:</strong> ${orderDate}
      </p>

      <p>
        <strong>Status:</strong> ${order.status || 'Confirmed'}
      </p>

      <div style="margin:15px 0;">
        <strong>Items:</strong>
        <div style="margin-top:8px;">
          ${itemsHtml}
        </div>
      </div>

      <p>
        <strong>Delivery:</strong>
        ${order.delivery_type || 'Pickup'}
      </p>

      <p>
        <strong>Payment:</strong>
        ${order.payment_method || 'Cash'}
      </p>

      ${parseFloat(order.discount_amount || 0) > 0
        ? `
          <p>
            <strong>Discount:</strong>
            ${order.discount_percent}% -
            Rs.${parseFloat(order.discount_amount).toFixed(2)}
          </p>
        `
        : ''
      }

      <div class="price">
        Rs.${parseFloat(order.final_total || 0).toFixed(2)}
      </div>
    `;

    // Order Again button
    const button = document.createElement('button');
    button.textContent = 'Order Again';

    button.addEventListener('click', () => {

      if (!items.length) {
        alert('No pizza items found in this order.');
        return;
      }

      // Add previous order items back to cart
      let existingCart = JSON.parse(
        localStorage.getItem('pizzaCart') || '[]'
      );

      items.forEach(item => {
        existingCart.push({
          ...item,
          id: Date.now() + Math.random()
        });
      });

      localStorage.setItem(
        'pizzaCart',
        JSON.stringify(existingCart)
      );

      alert('Order items have been added to your cart!');

      window.location.href = 'checkout.html';
    });

    historyCard.appendChild(button);
    historyContent.appendChild(historyCard);
  });
}
        // Toggle history window visibility
      async function toggleHistoryWindow() {
          historyWindow.classList.toggle('active');
          
          if (historyWindow.classList.contains('active')) {
            historyToggleBtn.innerHTML = '<i class="fas fa-times"></i> Close History';
            populateRegionalHistoryWindow();
            // Smooth scroll to history window
            setTimeout(() => {
              smoothScrollTo(historyWindow, 400);
            }, 100);
          } else {
            historyToggleBtn.innerHTML = '<i class="fas fa-history"></i> Show Order History';
          }
        }

        // Event Listeners
        sizeEl.addEventListener('change', (e) => {
          setCrustOptions(e.target.value);
          updateFlavorPrices(e.target.value);
        });

        crustEl.addEventListener('change', calculatePrice);

        cityEl.addEventListener('change', (e) => {
          setCityFlavors(e.target.value, sizeEl.value);
        });

        document.addEventListener('change', (e) => {
          if (e.target.matches('input[name="flavor"]')) {
            calculatePrice();
          }
        });

        // Save to Profile button event listener
        saveToProfileBtn.addEventListener('click', saveRegionalPizzaToProfile);

        // History toggle button
        historyToggleBtn.addEventListener('click', toggleHistoryWindow);

        // Confirm button - UPDATED WITH CART AND HISTORY FUNCTIONALITY
        confirmBtn.addEventListener('click', () => {
          const pizza = calculatePrice();
          
          if (pizza.city === "None" || pizza.size === "None") {
            alert("Please select your city and pizza size before confirming!");
            return;
          }
          
          if (pizza.flavor === "None") {
            alert("Please select a flavor for your regional pizza!");
            return;
          }
          
          // Save configuration
          saveRegionalPizzaConfig(pizza);
          
          // Add to cart
          addRegionalPizzaToCart(pizza);

          alert(
            `Your Regional Pizza:\n\nCity: ${pizza.city}\nSize: ${pizza.size}\nCrust: ${pizza.crust}\nFlavor: ${pizza.flavor}\nTotal: Rs.${pizza.total}\n\nAdded to cart! Proceed to checkout to complete your order.`
          );

          // Update history window if it's open
          if (historyWindow.classList.contains('active')) {
            populateRegionalHistoryWindow();
          }
        });

        // Initialize once on page load
        window.addEventListener('DOMContentLoaded', () => {
          setCrustOptions(sizeEl.value);
          setCityFlavors(cityEl.value, sizeEl.value);
          calculatePrice();
          
          // Load user profile
          loadUserProfile();
          
          // Apply saved config if present
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('applyConfig')) {
            const savedConfig = loadRegionalPizzaConfig();
            if (savedConfig) applyRegionalPizzaConfig(savedConfig);
          }

          // Initialize navbar behavior
          initNavbar();
          
          // Update cart display
          updateCartDisplay();
        });

        // Make functions available globally for onclick handlers
        window.applyRegionalPizzaConfig = applyRegionalPizzaConfig;
        window.smoothScrollTo = smoothScrollTo;
        window.goToCheckout = goToCheckout;