// Firebase is already initialized in index.html's auth guard.
// Just get the database with the full config (databaseURL needed for RTDB).
// Re-init safely with the full config if needed.
const _fullConfig = {
    apiKey: "AIzaSyCniS3tFAjmpfHS1KKJhmeOkaK5qpOBcj8",
    authDomain: "calculator-d8599.firebaseapp.com",
    databaseURL: "https://calculator-d8599-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "calculator-d8599",
    storageBucket: "calculator-d8599.firebasestorage.app",
    messagingSenderId: "601020159556",
    appId: "1:601020159556:web:c3ff07b584325e5d5d4e11"
};
if (!firebase.apps.length) {
    firebase.initializeApp(_fullConfig);
} else {
    // Update the existing app's database to use the full databaseURL
    firebase.app().options.databaseURL = _fullConfig.databaseURL;
}

const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const backBtn = document.getElementById('backBtn');
    const inputView = document.getElementById('inputView');
    const resultView = document.getElementById('resultView');
    const heroGraphic = document.getElementById('heroGraphic');
    const errorMessage = document.getElementById('errorMessage');
    const calculatorCard = document.querySelector('.calculator-card');

    // 🔄 Autofill last used name & designation from localStorage
    const savedName = localStorage.getItem('calc_internName');
    const savedDesignation = localStorage.getItem('calc_designation');

    if (savedName || savedDesignation) {
        const nameField = document.getElementById('internName');
        const designationField = document.getElementById('designation');

        if (savedName) {
            nameField.value = savedName;
            nameField.classList.add('autofilled');
        }
        if (savedDesignation) {
            designationField.value = savedDesignation;
            designationField.classList.add('autofilled');
        }

        // Show autofill badge
        const badge = document.createElement('div');
        badge.className = 'autofill-badge';
        badge.innerHTML = '✨ Last session data restored';
        document.querySelector('.view-header').appendChild(badge);
        setTimeout(() => badge.classList.add('autofill-badge--hide'), 3000);
        setTimeout(() => badge.remove(), 3600);
    }

    calculateBtn.addEventListener('click', () => {
        // Get Inputs
        const name = document.getElementById('internName').value.trim();
        const designation = document.getElementById('designation').value.trim();
        const monthInput = document.getElementById('monthSelection').value;
        const month = parseInt(monthInput);
        const prevRevenue = parseFloat(document.getElementById('prevMonthRevenue').value) || 0;
        const currRevenue = parseFloat(document.getElementById('currMonthRevenue').value) || 0;

        // Validation
        if (!name || !designation || !monthInput) {
            errorMessage.textContent = 'Please fill in all mandatory fields.';
            errorMessage.style.animation = 'shake 0.4s ease';
            setTimeout(() => errorMessage.style.animation = '', 400);
            return;
        }
        errorMessage.textContent = '';

        // Salary Logic
        const BASE_SALARY = 8000;
        let requiredRevenue = 0;

        if (month >= 1 && month <= 3) {
            requiredRevenue = 40000;
        } else if (month >= 4 && month <= 5) {
            requiredRevenue = 60000;
        } else if (month === 6) {
            requiredRevenue = 80000;
        }

        let paidBaseSalary = 0;
        let incentive = 0;
        const resRevenueLabel = document.getElementById('resRevenueLabel');

        // ── New Salary Rules ──────────────────────────────────────────────────
        // Stipend eligibility is STRICTLY based on Current Month Revenue only.
        // Previous month revenue ALWAYS generates an unconditional 10% incentive.
        // ──────────────────────────────────────────────────────────────────────

        let currentMonthIncentive = 0;

        if (currRevenue === 0) {
            paidBaseSalary = 0;
            currentMonthIncentive = 0;
        } else if (currRevenue < requiredRevenue) {
            paidBaseSalary = 0;
            currentMonthIncentive = currRevenue * 0.10;
        } else if (currRevenue === requiredRevenue) {
            paidBaseSalary = BASE_SALARY;
            currentMonthIncentive = 0;
        } else {
            paidBaseSalary = BASE_SALARY;
            currentMonthIncentive = (currRevenue - requiredRevenue) * 0.10;
        }

        let previousMonthIncentive = prevRevenue * 0.10;
        incentive = currentMonthIncentive + previousMonthIncentive;
        const finalSalary = paidBaseSalary + incentive;

        // Determine revenue label and amount to display
        if (prevRevenue > 0 && currRevenue > 0) {
            resRevenueLabel.textContent = "Total Generated";
        } else if (currRevenue > 0) {
            resRevenueLabel.textContent = "Current Month Revenue";
        } else {
            resRevenueLabel.textContent = "Previous Month Revenue";
        }

        const displayRevenue = prevRevenue + currRevenue;

        // Populate Results
        document.getElementById('resName').textContent = name;
        document.getElementById('resDesignation').textContent = designation;
        document.getElementById('resMonth').textContent = `Month ${month}`;
        document.getElementById('resTotalGenerated').textContent = formatCurrency(displayRevenue);
        document.getElementById('resRequired').textContent = formatCurrency(requiredRevenue);
        document.getElementById('resBaseSalary').textContent = formatCurrency(paidBaseSalary);
        document.getElementById('resIncentive').textContent = formatCurrency(incentive);

        const finalSalaryEl = document.getElementById('resFinalSalary');
        finalSalaryEl.textContent = formatCurrency(finalSalary);

        // Status Feedback
        const statusIcon = document.getElementById('statusIcon');
        const statusTitle = document.getElementById('statusTitle');
        const statusBadge = document.getElementById('salaryStatusBadge');
        const resExplanation = document.getElementById('resExplanation');
        const resExplanationText = document.getElementById('resExplanationText');

        // Reset explanation
        resExplanation.className = 'status-explanation';
        resExplanationText.textContent = '';

        if (currRevenue === 0 && prevRevenue === 0) {
            statusIcon.textContent = 'ℹ️';
            statusTitle.textContent = 'STIPEND STATUS: VOID';
            statusTitle.style.color = '#fbbf24';
            statusTitle.style.textShadow = 'none';
            statusBadge.textContent = 'CONTACT : HR (hr@fortumars.com)';
            statusBadge.className = 'final-status-badge status-partial';
            finalSalaryEl.style.color = '#fbbf24';
            document.getElementById('resTotalGenerated').style.color = '#fbbf24';
            document.getElementById('currMonthRevenue').parentElement.style.color = '#fbbf24';
            resExplanationText.textContent = "You haven't generated any revenue this month. Unfortunately, this means you aren't eligible for a stipend right now. Keep pushing for next month!";
            resExplanation.classList.add('gold-text');
            calculatorCard.classList.add('partial-success-glow');
        } else if (currRevenue === 0) {
            statusIcon.textContent = 'ℹ️';
            statusTitle.textContent = 'STIPEND STATUS: INELIGIBLE';
            statusTitle.style.color = '#fbbf24';
            statusTitle.style.textShadow = 'none';
            statusBadge.textContent = 'CONTACT : HR (hr@fortumars.com)';
            statusBadge.className = 'final-status-badge status-partial';
            finalSalaryEl.style.color = '#fbbf24';
            document.getElementById('resTotalGenerated').style.color = '#fbbf24';
            document.getElementById('currMonthRevenue').parentElement.style.color = '#fbbf24';
            resExplanationText.textContent = "You didn't hit the revenue target this month, but you've earned a 10% bonus on your pending revenue from last month!";
            resExplanation.classList.add('gold-text');
            calculatorCard.classList.add('partial-success-glow');
        } else if (currRevenue < requiredRevenue) {
            statusIcon.textContent = 'ℹ️';
            statusTitle.textContent = 'STIPEND STATUS: MILESTONE NOT ACHIEVED';
            statusTitle.style.color = '#fbbf24';
            statusTitle.style.textShadow = 'none';
            statusBadge.textContent = 'CONTACT : HR (hr@fortumars.com)';
            statusBadge.className = 'final-status-badge status-partial';
            finalSalaryEl.style.color = '#fbbf24';
            document.getElementById('resTotalGenerated').style.color = '#fbbf24';
            document.getElementById('resRequired').parentElement.style.color = '#fbbf24';
            resExplanationText.textContent = `Your revenue (${formatCurrency(currRevenue)}) is below the current month's milestone of ${formatCurrency(requiredRevenue)}. While the base stipend isn't eligible, you still earned a 10% incentive on all the revenue you generated!`;
            resExplanation.classList.add('gold-text');
            calculatorCard.classList.add('partial-success-glow');
        } else {
            statusIcon.textContent = '✅';
            statusTitle.textContent = 'STIPEND STATUS: MILESTONE EXCEEDED';
            statusTitle.style.color = '#34d399';
            statusTitle.style.textShadow = 'none';
            if (currRevenue === requiredRevenue && prevRevenue === 0) {
                statusBadge.textContent = 'CONTACT : HR (hr@fortumars.com)';
                resExplanationText.textContent = `Great job! You hit the current month's milestone of ${formatCurrency(requiredRevenue)} exactly. You've earned your full base stipend!`;
            } else if (currRevenue === requiredRevenue && prevRevenue > 0) {
                statusBadge.textContent = 'CONTACT : HR (hr@fortumars.com)';
                resExplanationText.textContent = `Success! You reached the current month's milestone of ${formatCurrency(requiredRevenue)}. You'll receive your base stipend plus a 10% bonus on your pending revenue!`;
            } else {
                statusBadge.textContent = 'CONTACT : HR (hr@fortumars.com)';
                resExplanationText.textContent = `Amazing work! You went above and beyond the current month me milestone of ${formatCurrency(requiredRevenue)}. You've earned your full base stipend plus a 10% incentive on the extra revenue earned above your target!`;
            }
            statusBadge.className = 'final-status-badge status-met';
            finalSalaryEl.style.color = '#34d399';
            document.getElementById('resTotalGenerated').style.color = '#34d399';
        }

        // Transition to Result View
        inputView.classList.add('hidden');
        heroGraphic.style.display = 'none';

        // Hide FAQ section when viewing results
        const faqSection = document.getElementById('faqSection');
        if (faqSection) faqSection.style.display = 'none';

        resultView.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger Mind Blowing Animations
        const failureOverlay = document.getElementById('failureOverlay');
        const strikeLine = document.getElementById('strikeLine');

        // Remove previous animation classes
        calculatorCard.classList.remove('success-anim', 'glitch-anim', 'desaturate-anim', 'partial-success-glow');
        failureOverlay.classList.remove('active');
        if (strikeLine) strikeLine.classList.remove('active');

        if (currRevenue >= requiredRevenue) {
            // SUCCESS: Current month milestone REACHED — full paper + emoji blast
            calculatorCard.classList.add('success-anim');
            triggerPaperConfetti();
            triggerEmojiBlast('success');
        } else if (incentive > 0) {
            // PARTIAL: Only incentive earned — NO paper confetti, emoji blast only
            calculatorCard.classList.add('success-anim');
            calculatorCard.classList.add('partial-success-glow');
            triggerEmojiBlast('partial');
        } else {
            // ABSOLUTE FAILURE: No revenue at all
            calculatorCard.classList.add('glitch-anim');
            setTimeout(() => {
                calculatorCard.classList.remove('glitch-anim');
                calculatorCard.classList.add('desaturate-anim');
                if (strikeLine) strikeLine.classList.add('active');
            }, 400);
            failureOverlay.classList.add('active');
            triggerEmojiBlast('failure');
        }

        // 💾 Save to localStorage for autofill on next session
        localStorage.setItem('calc_internName', name);
        localStorage.setItem('calc_designation', designation);

        // 🚀 Sync required fields to Firebase Realtime Database
        const currentUser = firebase.auth().currentUser;
        saveReportToFirebase({
            uid: currentUser ? currentUser.uid : 'unknown',
            internName: name,
            designation: designation,
            pendingRevenue: prevRevenue,
            currentRevenue: currRevenue,
            timestamp: new Date().toISOString()
        });
    });

    function saveReportToFirebase(data) {
        console.log("Attempting Firebase write:", data);
        database.ref('reports').push(data)
            .then(() => {
                console.log("✅ Report saved to Firebase successfully!");
            })
            .catch((error) => {
                console.error("❌ Firebase write failed:", error.code, error.message);
            });
    }

    // Paper confetti — only for current month milestone achieved
    function triggerPaperConfetti() {
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fc8', '#c77dff', '#ffb347'];
        const blastOrigins = [
            { x: 0.1, y: 0.3 },
            { x: 0.35, y: 0.15 },
            { x: 0.5, y: 0.5 },
            { x: 0.65, y: 0.15 },
            { x: 0.9, y: 0.3 }
        ];
        blastOrigins.forEach((origin, i) => {
            setTimeout(() => {
                confetti({
                    particleCount: 120,
                    spread: 90,
                    origin,
                    startVelocity: 55,
                    ticks: 300,
                    gravity: 1.1,
                    scalar: 1.3,
                    colors: colors,
                    zIndex: 2000
                });
            }, i * 150);
        });
    }

    // Google Meet-style emoji blast — emojis float up and pop
    function triggerEmojiBlast(type) {
        const successEmojis = ['🥳', '🎉', '🎊', '🚀', '✨', '🙌', '💫', '⭐'];
        const partialEmojis = ['💪', '👊', '💡'];
        const failureEmojis = ['😤', '🙈', '😶', '⚠️', '🫥', '😑'];
        const emojis = type === 'success' ? successEmojis : type === 'partial' ? partialEmojis : failureEmojis;

        const successQuotes = [
            'You crushed it!', 'Milestone smashed!', 'Outstanding!',
            'Top performer!', 'Absolutely killing it!', 'Legend!',
            'Target achieved!', 'You are on fire!'
        ];
        const partialQuotes = [
            'Keep pushing!', 'You got this!', 'Better next month!',
            'Rise & grind!', 'Stay hungry!', 'Level up!'
        ];
        const failureQuotes = [
            'Wake up!', 'Zero is not an option!', 'Start now!',
            'No excuses!', 'Time to get serious!', 'The grind starts today!'
        ];
        const quotes = type === 'success' ? successQuotes : type === 'partial' ? partialQuotes : failureQuotes;

        // Spawn emojis
        const totalWaves = 18;
        for (let i = 0; i < totalWaves; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'emoji-meet-particle';
                el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                el.style.left = `${5 + Math.random() * 90}%`;
                const size = 2.2 + Math.random() * 1.8;
                el.style.fontSize = `${size}rem`;
                const dur = 1.8 + Math.random() * 1.0;
                el.style.animationDuration = `${dur}s`;
                document.body.appendChild(el);
                setTimeout(() => el.remove(), (dur + 0.5) * 1000);
            }, i * 120);
        }

        // Spawn motivational quote particles — staggered between emojis
        const totalQuotes = 8;
        for (let i = 0; i < totalQuotes; i++) {
            setTimeout(() => {
                const el = document.createElement('div');
                el.className = 'quote-meet-particle';
                el.textContent = quotes[Math.floor(Math.random() * quotes.length)];
                el.style.left = `${8 + Math.random() * 80}%`;
                const dur = 2.0 + Math.random() * 1.2;
                el.style.animationDuration = `${dur}s`;
                // Success = green glow, partial = amber glow
                const isSuccess = type === 'success';
                const isFailure = type === 'failure';
                el.style.borderColor = isSuccess ? 'rgba(52,211,153,0.6)' : isFailure ? 'rgba(239,68,68,0.6)' : 'rgba(251,191,36,0.6)';
                el.style.color = isSuccess ? '#34d399' : isFailure ? '#f87171' : '#fbbf24';
                el.style.boxShadow = isSuccess
                    ? '0 0 14px rgba(52,211,153,0.4)'
                    : isFailure
                        ? '0 0 14px rgba(239,68,68,0.4)'
                        : '0 0 14px rgba(251,191,36,0.4)';
                document.body.appendChild(el);
                setTimeout(() => el.remove(), (dur + 0.5) * 1000);
            }, 200 + i * 250);
        }
    }

    // View Guidelines Modal Logic
    const viewGuidelinesBtn = document.getElementById('viewGuidelinesBtn');
    const guidelinesModal = document.getElementById('guidelinesModal');
    const closeModal = document.getElementById('closeModal');
    const modalOkBtn = document.getElementById('modalOkBtn');

    viewGuidelinesBtn.addEventListener('click', () => {
        guidelinesModal.classList.remove('hidden');
    });

    [closeModal, modalOkBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            guidelinesModal.classList.add('hidden');
        });
    });

    // Top 10 FAQs Scroll Logic
    const viewFaqBtn = document.getElementById('viewFaqBtn');
    const faqSection = document.getElementById('faqSection');

    if (viewFaqBtn && faqSection) {
        viewFaqBtn.addEventListener('click', () => {
            faqSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Theme Switcher Logic
    const themeBtns = document.querySelectorAll('.theme-btn');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('calculator-theme') || 'classic';
    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('calculator-theme', theme);

        // Update active button state
        themeBtns.forEach(btn => {
            if (btn.getAttribute('data-theme') === theme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Close modal on outside click
    guidelinesModal.addEventListener('click', (e) => {
        if (e.target === guidelinesModal) {
            guidelinesModal.classList.add('hidden');
        }
    });



    backBtn.addEventListener('click', () => {
        resultView.classList.add('hidden');
        heroGraphic.style.display = 'block';
        inputView.classList.remove('hidden');

        // Restore FAQ section visibility
        const faqSection = document.getElementById('faqSection');
        if (faqSection) faqSection.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reset Effects
        document.getElementById('failureOverlay').classList.remove('active');
        calculatorCard.classList.remove('success-anim', 'glitch-anim', 'desaturate-anim', 'partial-success-glow');
        const strikeLine = document.getElementById('strikeLine');
        if (strikeLine) strikeLine.classList.remove('active');
    });

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items (optional: remove this loop to allow multiple open simultaneously)
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                // Set max-height exactly to the scrollHeight so the transition is fluid
                answer.style.maxHeight = answer.scrollHeight + 40 + "px";
            }
        });
    });

    function formatCurrency(amount) {
        return '₹' + amount.toLocaleString('en-IN');
    }
});
