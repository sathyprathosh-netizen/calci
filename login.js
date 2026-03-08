// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCniS3tFAjmpfHS1KKJhmeOkaK5qpOBcj8",
    authDomain: "calculator-d8599.firebaseapp.com",
    databaseURL: "https://calculator-d8599-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "calculator-d8599",
    storageBucket: "calculator-d8599.firebasestorage.app",
    messagingSenderId: "601020159556",
    appId: "1:601020159556:web:c3ff07b584325e5d5d4e11"
};

// Initialize Firebase (only once)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();

// ─── Always show login — sign out any active session first ───────────────────
// This ensures users always see the login form, every time.
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
    return auth.signOut();
}).catch(() => { });

// ─── Tab Switching ─────────────────────────────────────────────────────────────
const signinTab = document.getElementById('signinTab');
const signupTab = document.getElementById('signupTab');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const loginCard = document.querySelector('.login-card');

signinTab.addEventListener('click', () => {
    signinTab.classList.add('active');
    signupTab.classList.remove('active');
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    clearErrors();
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    signinTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
    clearErrors();
});

function clearErrors() {
    document.getElementById('signinError').textContent = '';
    document.getElementById('signupError').textContent = '';
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
signinForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;
    const errorEl = document.getElementById('signinError');

    errorEl.style.color = '#a5b4fc';
    errorEl.textContent = 'Signing in...';

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            sessionStorage.setItem('isStaffAuth', 'true'); // Required for instant load
            errorEl.style.color = '#10b981';
            errorEl.textContent = '✅ Access granted. Redirecting...';
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
        })
        .catch((error) => {
            errorEl.style.color = '#f87171';
            errorEl.textContent = getFriendlyError(error.code);
            loginCard.classList.add('shake-anim');
            setTimeout(() => loginCard.classList.remove('shake-anim'), 500);
        });
});

// ─── Sign Up ──────────────────────────────────────────────────────────────────
signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorEl = document.getElementById('signupError');

    errorEl.style.color = '#a5b4fc';
    errorEl.textContent = 'Creating account...';

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Save user profile to Realtime Database
            return database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                role: 'staff',
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            sessionStorage.setItem('isStaffAuth', 'true'); // Required for instant load
            errorEl.style.color = '#10b981';
            errorEl.textContent = '✅ Account created! Redirecting...';
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
        })
        .catch((error) => {
            errorEl.style.color = '#f87171';
            errorEl.textContent = getFriendlyError(error.code);
            loginCard.classList.add('shake-anim');
            setTimeout(() => loginCard.classList.remove('shake-anim'), 500);
        });
});

// ─── 3D Card Animation ────────────────────────────────────────────────────────
const splitCard = document.querySelector('.split-login-card');
const leftContent = document.querySelector('.login-left-content');
const rightSide = document.querySelector('.login-side-right');

document.addEventListener('mousemove', (e) => {
    if (!splitCard) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Calculate rotation (max 5 degrees for subtlety)
    const rotateY = ((clientX / innerWidth) - 0.5) * 10;
    const rotateX = ((clientY / innerHeight) - 0.5) * -10;

    splitCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Inner parallax effect
    if (leftContent) {
        const moveX = ((clientX / innerWidth) - 0.5) * 20;
        const moveY = ((clientY / innerHeight) - 0.5) * 20;
        leftContent.style.transform = `translateZ(50px) translateX(${moveX}px) translateY(${moveY}px)`;
    }

    if (rightSide) {
        const moveX = ((clientX / innerWidth) - 0.5) * -10;
        const moveY = ((clientY / innerHeight) - 0.5) * -10;
        rightSide.style.transform = `translateZ(20px) translateX(${moveX}px) translateY(${moveY}px)`;
    }
});

// Reset transform when mouse leaves
document.addEventListener('mouseleave', () => {
    if (!splitCard) return;
    splitCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    if (leftContent) leftContent.style.transform = `translateZ(0px) translateX(0) translateY(0)`;
    if (rightSide) rightSide.style.transform = `translateZ(0px) translateX(0) translateY(0)`;
});

// ─── Friendly Error Messages ──────────────────────────────────────────────────
function getFriendlyError(code) {
    const messages = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/invalid-credential': 'Invalid email or password. Please try again.',
        'auth/network-request-failed': 'Network error. Check your internet connection.',
    };
    return messages[code] || 'Something went wrong. Please try again.';
}
