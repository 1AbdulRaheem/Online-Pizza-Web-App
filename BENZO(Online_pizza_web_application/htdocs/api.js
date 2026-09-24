/* ==========================================================================
   api.js — CENTRAL "BACKEND" LAYER (SIMULATED)
   ========================================================================== */
const Api = (function () {

    // ─── Internal storage helpers ──────────────────────
    const USERS_KEY = 'pizza_users_db';
    const SESSION_KEY = 'pizza_session';
    const PENDING_OTP_KEY = 'pizza_pending_otp';

    function _getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    }
    function _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    function _findUserByEmail(email) {
        return _getUsers().find(u => u.email.toLowerCase() === String(email).toLowerCase());
    }
    function _generateOtp() {
        return String(Math.floor(100000 + Math.random() * 900000));
    }
    function _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

   // ─── Registration ──────────────────────────────────
async function registerUser(name, email, password, phone) {
    try {
        const response = await fetch('backend/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                phone: phone || null
            })
        });

        const result = await response.json();

        return result;

    } catch (error) {
        console.error('Registration error:', error);

        return {
            success: false,
            message: 'Unable to connect to the server.'
        };
    }
}

 // ─── Login ──────────────────────────────────────────
async function loginUser(email, password) {
    try {
        const response = await fetch('backend/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();

        return result;

    } catch (error) {
        console.error('Login error:', error);

        return {
            success: false,
            message: 'Unable to connect to the server.'
        };
    }
}

    // ─── Session management ────────────────────────────
function createSession(userId, userData = {}) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: userId,
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'nonvip',
        loggedInAt: Date.now()
    }));
}

function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
    return !!getSession();
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
}

    // ─── Set user profile (preserves XP/missions) ──
    function setUserProfile(userId, userData = {}) {
    let existing = null;

    try {
        existing = JSON.parse(localStorage.getItem('pizzaUser'));
    } catch (_) {
        existing = null;
    }

    const profile = {
        userId: userId,
        name: userData.name || '',
        email: userData.email || '',
        membership: userData.role === 'vip' ? 'vip' : 'nonvip',

        xp: existing && typeof existing.xp === 'number'
            ? existing.xp
            : 0,

        level: userData.level ||
            (existing && typeof existing.level === 'number'
                ? existing.level
                : 1),

        orderCount: existing && typeof existing.orderCount === 'number'
            ? existing.orderCount
            : 0,

        missions: existing && existing.missions
            ? existing.missions
            : {
                order3: {
                    claimed: false,
                    lastClaimed: null,
                    progress: 0
                },
                risingStar: {
                    target: 3,
                    claimed: false
                }
            }
    };

    localStorage.setItem('pizzaUser', JSON.stringify(profile));

    console.log('✅ setUserProfile: pizzaUser updated', profile);
}

    // ─── OTP ─────────────────────────────────────────────
    async function sendOtp(destination, channel) {
        await _delay(500);
        const code = _generateOtp();
        localStorage.setItem(PENDING_OTP_KEY, JSON.stringify({
            destination,
            channel,
            code,
            expiresAt: Date.now() + 5 * 60 * 1000
        }));
        return { success: true, message: `Code sent via ${channel}`, data: { simulatedCode: code } };
    }

    function verifyOtp(code) {
        const raw = localStorage.getItem(PENDING_OTP_KEY);
        if (!raw) return { success: false, message: 'No verification code was requested.' };

        const pending = JSON.parse(raw);
        if (Date.now() > pending.expiresAt) {
            return { success: false, message: 'Code expired. Please request a new one.' };
        }
        if (String(code) !== String(pending.code)) {
            return { success: false, message: 'Incorrect code.' };
        }

        localStorage.removeItem(PENDING_OTP_KEY);
        return { success: true, message: 'Verified.' };
    }

    // ─── Social Login ───────────────────────────────────
    async function loginWithProvider(provider) {
        await _delay(500);
        const fakeEmail = `demo_${provider}_user@example.com`;
        let user = _findUserByEmail(fakeEmail);
        if (!user) {
            const users = _getUsers();
            user = {
                id: 'u_' + Date.now(),
                name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Demo User`,
                email: fakeEmail,
                phone: null,
                password: null,
                role: 'nonvip',
                level: 1,
                xp: 0,
                emailVerified: true,
                phoneVerified: false,
                provider
            };
            users.push(user);
            _saveUsers(users);
        }
        return { success: true, message: `Signed in with ${provider} (simulated).`, data: { userId: user.id, role: user.role } };
    }

        // ─── Pizza Menu ─────────────────────────────────────
async function getPizzas() {
    try {
        const response = await fetch('backend/pizzas.php');

        const result = await response.json();

        return result;
 
    } catch (error) {
        console.error('Pizza loading error:', error);

        return {
            success: false,
            message: 'Unable to load pizzas.'
        };
    }
}
async function getSavedPizzas(userId) {
    try {
        const response = await fetch(
            `backend/get_saved_pizzas.php?userId=${encodeURIComponent(userId)}`
        );

        const result = await response.json();

        return result;

    } catch (error) {

        console.error('Saved pizzas loading error:', error);

        return {
            success: false,
            message: 'Unable to load saved pizzas.'
        };
    }
}

async function saveOrderToDatabase(order) {
    try {
        const response = await fetch("backend/save_order.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        const result = await response.json();

        return result;

    } catch (error) {

        console.error("Order save error:", error);

        return {
            success: false,
            message: "Unable to save order to database."
        };
    }
}


async function getOrderHistory(userId) {
    try {
        const response = await fetch(
            `backend/get_orders.php?userId=${encodeURIComponent(userId)}`
        );

        const result = await response.json();

        return result;

    } catch (error) {

        console.error("Order history loading error:", error);

        return {
            success: false,
            message: "Unable to load order history."
        };
    }
}
// ─── Save Pizza to Database ─────────────────────────
async function savePizzaToDatabase(pizza) {
    try {
        const response = await fetch('backend/save_pizza.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pizza)
        });

        const result = await response.json();

        return result;

    } catch (error) {
        console.error('Save pizza error:', error);

        return {
            success: false,
            message: 'Unable to save pizza to database.'
        };
    }
}

    // ─── Public API ──────────────────────────────────────
   return {
    registerUser,
    loginUser,
    getPizzas,
    getSavedPizzas,
    savePizzaToDatabase,
     saveOrderToDatabase,
    getOrderHistory,
    createSession,
    getSession,
    isLoggedIn,
    logout,
    sendOtp,
    verifyOtp,
    loginWithProvider,
    setUserProfile
};

})();