
//  CART SYSTEM 
let cart = [];

if (localStorage.getItem('pizzaCart')) {
    cart = JSON.parse(localStorage.getItem('pizzaCart'));
}

function updateCartDisplay() {
    const el = document.getElementById('cartCount');

    if (el) {
        el.textContent = cart.length;
    }
}


//  SIDEBAR MENU TOGGLE 
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

if (menuBtn) {
    menuBtn.addEventListener('click', function () {
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
}

if (overlay) {
    overlay.addEventListener('click', closeSidebar);
}

function closeSidebar() {
    if (sidebar) {
        sidebar.classList.remove('active');
    }

    if (overlay) {
        overlay.classList.remove('active');
    }

    document.body.style.overflow = '';
}

document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
            closeSidebar();
        }
    });
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeSidebar();
    }
});

window.addEventListener('resize', function () {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});


//  POST LOGIN REDIRECT 
function getPostLoginRedirect() {
    const saved = sessionStorage.getItem('pizza_redirect_after_login');

    sessionStorage.removeItem('pizza_redirect_after_login');

    return saved || 'dashboard.html';
}


//  PAGE INITIALIZATION 
window.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');

    if (header) {
        header.classList.remove('hidden');
    }

    updateCartDisplay();

    // If already logged in, go to dashboard
    if (typeof Api !== 'undefined' && Api.isLoggedIn()) {
        window.location.href = getPostLoginRedirect();
    }
});


//  LOGIN + OTP 
const stepLogin = document.getElementById('stepLogin');
const stepOtp = document.getElementById('stepOtp');

const loginForm = document.getElementById('loginForm');
const otpForm = document.getElementById('otpForm');

let pendingLoginUserId = null;
let pendingLoginRole = 'nonvip';
let pendingLoginEmail = '';
let pendingLoginName = '';
let pendingLoginLevel = 1;

let resendTimerInterval = null;


//  PASSWORD TOGGLE 
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {

        const target = document.getElementById(btn.dataset.target);
        const icon = btn.querySelector('i');

        if (!target) {
            return;
        }

        if (target.type === 'password') {

            target.type = 'text';

            if (icon) {
                icon.classList.replace(
                    'fa-eye',
                    'fa-eye-slash'
                );
            }

        } else {

            target.type = 'password';

            if (icon) {
                icon.classList.replace(
                    'fa-eye-slash',
                    'fa-eye'
                );
            }
        }
    });
});


// CLEAR ERRORS 
function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
    });
}


//  LOGIN FORM 
if (loginForm) {

    loginForm.addEventListener('submit', async function (e) {

        e.preventDefault();

        clearFieldErrors();

        const emailElement =
            document.getElementById('loginEmail');

        const passwordElement =
            document.getElementById('loginPassword');

        const email =
            emailElement ? emailElement.value.trim() : '';

        const password =
            passwordElement ? passwordElement.value : '';


        // Validate email
        if (!email) {

            const error =
                document.getElementById('loginEmailError');

            if (error) {
                error.textContent = 'Email is required.';
            }

            return;
        }


        // Validate password
        if (!password) {

            const error =
                document.getElementById('loginPasswordError');

            if (error) {
                error.textContent = 'Password is required.';
            }

            return;
        }


        const submitBtn =
            document.getElementById('loginSubmitBtn');


        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Checking...';
        }


        try {

            // Send login request to PHP
            const result =
                await Api.loginUser(email, password);


            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.innerHTML =
                    '<i class="fas fa-right-to-bracket"></i> Log In';
            }


            // Login failed
            if (!result || !result.success) {

                const formError =
                    document.getElementById('loginFormError');

                if (formError) {
                    formError.textContent =
                        result && result.message
                            ? result.message
                            : 'Incorrect email or password.';
                }

                return;
            }


            // Make sure data exists
            if (!result.data || !result.data.userId) {

                const formError =
                    document.getElementById('loginFormError');

                if (formError) {
                    formError.textContent =
                        'Login response is missing user information.';
                }

                return;
            }


            // Save user information for OTP step
            pendingLoginUserId =
                result.data.userId;

            pendingLoginRole =
                result.data.role || 'nonvip';

            pendingLoginEmail =
                result.data.email || email;

            pendingLoginName =
                result.data.name || '';

            pendingLoginLevel =
                result.data.level || 1;


            console.log(
                'Login successful. User ID:',
                pendingLoginUserId
            );


            // Open login OTP step
            await goToOtpStep(
                email,
                'email'
            );

        } catch (error) {

            console.error(
                'Login process error:',
                error
            );

            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.innerHTML =
                    '<i class="fas fa-right-to-bracket"></i> Log In';
            }

            const formError =
                document.getElementById('loginFormError');

            if (formError) {
                formError.textContent =
                    'Something went wrong. Please try again.';
            }
        }
    });
}


//  GO TO OTP STEP 
async function goToOtpStep(destination, channel) {

    if (!stepLogin || !stepOtp) {
        console.error(
            'OTP elements were not found on the page.'
        );
        return;
    }

    stepLogin.style.display = 'none';
    stepOtp.style.display = 'block';

    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });


    const subtitleMap = {
        email:
            'We sent a 6-digit code to ' + destination + '.',

        whatsapp:
            'We sent a 6-digit code to ' + destination + ' on WhatsApp.',

        sms:
            'We sent a 6-digit code to ' + destination + ' via SMS.'
    };


    const otpSubtitle =
        document.getElementById('otpSubtitle');

    if (otpSubtitle) {
        otpSubtitle.textContent =
            subtitleMap[channel] ||
            subtitleMap.email;
    }


    await requestOtp(
        destination,
        channel
    );


    startResendTimer();


    const firstOtp =
        document.querySelector(
            '.otp-digit[data-index="0"]'
        );

    if (firstOtp) {
        firstOtp.focus();
    }
}


//  REQUEST OTP 
async function requestOtp(destination, channel) {

    try {

        const result =
            await Api.sendOtp(
                destination,
                channel
            );


        const banner =
            document.getElementById('otpDemoText');


        if (!banner) {
            return;
        }


        if (
            result &&
            result.success &&
            result.data &&
            result.data.simulatedCode
        ) {

            banner.textContent =
                'Demo mode: your code is ' +
                result.data.simulatedCode;

        } else {

            banner.textContent =
                'Demo mode: OTP delivery is simulated.';
        }

    } catch (error) {

        console.error(
            'OTP request error:',
            error
        );

        const banner =
            document.getElementById('otpDemoText');

        if (banner) {
            banner.textContent =
                'Unable to request OTP. Please try again.';
        }
    }
}


//  RESEND TIMER
function startResendTimer() {

    let seconds = 30;

    const resendLink =
        document.getElementById('resendOtpLink');

    const timerEl =
        document.getElementById('resendTimer');


    if (!resendLink || !timerEl) {
        return;
    }


    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';


    clearInterval(resendTimerInterval);


    resendTimerInterval =
        setInterval(() => {

            seconds--;

            timerEl.textContent =
                seconds > 0
                    ? ' (' + seconds + 's)'
                    : '';


            if (seconds <= 0) {

                clearInterval(
                    resendTimerInterval
                );

                resendLink.style.pointerEvents =
                    'auto';

                resendLink.style.opacity =
                    '1';
            }

        }, 1000);
}


//  RESEND OTP 
const resendOtpLink =
    document.getElementById('resendOtpLink');

if (resendOtpLink) {

    resendOtpLink.addEventListener(
        'click',
        async function (e) {

            e.preventDefault();


            if (
                this.style.pointerEvents === 'none'
            ) {
                return;
            }


            const emailElement =
                document.getElementById('loginEmail');


            const email =
                emailElement
                    ? emailElement.value.trim()
                    : '';


            if (!email) {
                return;
            }


            await requestOtp(
                email,
                'email'
            );


            startResendTimer();
        }
    );
}


//  BACK TO LOGIN
const backToLoginLink =
    document.getElementById('backToLoginLink');

if (backToLoginLink) {

    backToLoginLink.addEventListener(
        'click',
        function (e) {

            e.preventDefault();

            clearInterval(
                resendTimerInterval
            );


            if (stepOtp) {
                stepOtp.style.display = 'none';
            }

            if (stepLogin) {
                stepLogin.style.display = 'block';
            }


            window.scrollTo({
                top: 0,
                behavior: 'auto'
            });
        }
    );
}


//  OTP INPUTS 
document
    .querySelectorAll('.otp-digit')
    .forEach((input, idx, all) => {

        input.addEventListener(
            'input',
            () => {

                input.value =
                    input.value.replace(
                        /[^0-9]/g,
                        ''
                    );


                if (
                    input.value &&
                    idx < all.length - 1
                ) {

                    all[idx + 1].focus();
                }
            }
        );


        input.addEventListener(
            'keydown',
            (e) => {

                if (
                    e.key === 'Backspace' &&
                    !input.value &&
                    idx > 0
                ) {

                    all[idx - 1].focus();
                }
            }
        );
    });


//  LOGIN OTP VERIFICATION 
if (otpForm) {

    otpForm.addEventListener(
        'submit',
        function (e) {

            e.preventDefault();


            const digits =
                Array
                    .from(
                        document.querySelectorAll(
                            '.otp-digit'
                        )
                    )
                    .map(input => input.value)
                    .join('');


            const errorEl =
                document.getElementById(
                    'otpFormError'
                );


            if (errorEl) {
                errorEl.textContent = '';
            }


            // Check 6 digits
            if (digits.length < 6) {

                if (errorEl) {

                    errorEl.textContent =
                        'Please enter all 6 digits.';
                }

                return;
            }


            // Verify OTP
            const result =
                Api.verifyOtp(digits);


            if (!result || !result.success) {

                if (errorEl) {

                    errorEl.textContent =
                        result && result.message
                            ? result.message
                            : 'Incorrect code.';
                }

                return;
            }


            
            const userData = {

                name:
                    pendingLoginName,

                email:
                    pendingLoginEmail,

                role:
                    pendingLoginRole,

                level:
                    pendingLoginLevel
            };


            console.log(
                'Login OTP verified successfully.'
            );

            console.log(
                'User ID:',
                pendingLoginUserId
            );

            console.log(
                'User data:',
                userData
            );


            // Create login session
            Api.createSession(
                pendingLoginUserId,
                userData
            );


            // Create/update user profile
            Api.setUserProfile(
                pendingLoginUserId,
                userData
            );


            console.log(
                'Session created. Redirecting to dashboard...'
            );


            
            window.location.href =
                getPostLoginRedirect();
        }
    );
}


// FORGOT PASSWORD
const forgotPasswordLink =
    document.getElementById(
        'forgotPasswordLink'
    );

if (forgotPasswordLink) {

    forgotPasswordLink.addEventListener(
        'click',
        function (e) {

            e.preventDefault();

            alert(
                'Password reset will be available once the backend is connected.'
            );
        }
    );
}

