// Complete BetaAuth class replacement for 3-tier paywall system
// Replace the existing BetaAuth class (lines 799-964) with this code

class TierAuth {
    constructor() {
        this.storageKey = 'hvac-jack-5-access';
        this.usageKey = 'hvac-jack-5-usage';
        this.stripePaymentLink = 'https://buy.stripe.com/5kQ28sclL7bCbCSekE';

        // 80 LARK Labs Student Access Codes - 12 months pro access
        this.validStudentCodes = [
            'LARK0001', 'LARK0002', 'LARK0003', 'LARK0004', 'LARK0005',
            'LARK0006', 'LARK0007', 'LARK0008', 'LARK0009', 'LARK0010',
            'LARK0011', 'LARK0012', 'LARK0013', 'LARK0014', 'LARK0015',
            'LARK0016', 'LARK0017', 'LARK0018', 'LARK0019', 'LARK0020',
            'LARK0021', 'LARK0022', 'LARK0023', 'LARK0024', 'LARK0025',
            'LARK0026', 'LARK0027', 'LARK0028', 'LARK0029', 'LARK0030',
            'LARK0031', 'LARK0032', 'LARK0033', 'LARK0034', 'LARK0035',
            'LARK0036', 'LARK0037', 'LARK0038', 'LARK0039', 'LARK0040',
            'LARK0041', 'LARK0042', 'LARK0043', 'LARK0044', 'LARK0045',
            'LARK0046', 'LARK0047', 'LARK0048', 'LARK0049', 'LARK0050',
            'LARK0051', 'LARK0052', 'LARK0053', 'LARK0054', 'LARK0055',
            'LARK0056', 'LARK0057', 'LARK0058', 'LARK0059', 'LARK0060',
            'LARK0061', 'LARK0062', 'LARK0063', 'LARK0064', 'LARK0065',
            'LARK0066', 'LARK0067', 'LARK0068', 'LARK0069', 'LARK0070',
            'LARK0071', 'LARK0072', 'LARK0073', 'LARK0074', 'LARK0075',
            'LARK0076', 'LARK0077', 'LARK0078', 'LARK0079', 'LARK0080'
        ];

        this.init();
    }

    init() {
        // Check for Stripe success redirect
        this.checkStripeSuccess();

        // Check if already authenticated
        if (this.isAuthenticated()) {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tier selection buttons
        document.getElementById('btn-free-tier').addEventListener('click', () => {
            this.activateFreeTier();
        });

        document.getElementById('btn-pro-tier').addEventListener('click', () => {
            this.redirectToStripe();
        });

        document.getElementById('btn-student-tier').addEventListener('click', () => {
            this.showStudentCodeEntry();
        });

        // Student code form
        const studentForm = document.getElementById('student-form');
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('student-passkey').value;
            this.validateStudentCode(code);
        });

        // Back button
        document.getElementById('btn-back-to-tiers').addEventListener('click', () => {
            this.showTierSelection();
        });
    }

    async checkStripeSuccess() {
        const urlParams = new URLSearchParams(window.location.search);
        const stripeSuccess = urlParams.get('stripe_success');
        const sessionId = urlParams.get('session_id');

        if (stripeSuccess === 'true' && sessionId) {
            console.log('🚀 Stripe payment detected, verifying session...');

            try {
                const response = await fetch('/api/verify-stripe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId })
                });

                const data = await response.json();

                if (data.success && data.accessGranted) {
                    this.setAuthenticated('pro', data.expirationDate, data.limits);

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);

                    console.log('✅ Pro access activated via Stripe!');
                } else {
                    console.error('❌ Stripe verification failed:', data.error);
                }
            } catch (error) {
                console.error('❌ Stripe verification error:', error);
            }
        }
    }

    showTierSelection() {
        document.getElementById('tier-selection-view').style.display = 'block';
        document.getElementById('student-code-view').style.display = 'none';
    }

    showStudentCodeEntry() {
        document.getElementById('tier-selection-view').style.display = 'none';
        document.getElementById('student-code-view').style.display = 'block';
        setTimeout(() => {
            document.getElementById('student-passkey').focus();
        }, 300);
    }

    activateFreeTier() {
        const limits = {
            photoAnalysis: 10,
            textQueries: 15
        };

        this.setAuthenticated('free', null, limits);
        this.initializeUsageTracking();
        this.hideOverlay();
        console.log('✅ Free tier activated (10 photos, 15 text queries)');
    }

    redirectToStripe() {
        console.log('🚀 Redirecting to Stripe checkout...');
        window.location.href = this.stripePaymentLink;
    }

    async validateStudentCode(enteredCode) {
        const errorElement = document.getElementById('student-error');
        const code = enteredCode.toUpperCase().trim();

        if (!this.validStudentCodes.includes(code)) {
            errorElement.classList.add('show');
            document.getElementById('student-passkey').value = '';
            console.log('❌ Invalid student code attempted:', code);

            setTimeout(() => {
                errorElement.classList.remove('show');
            }, 3000);
            return;
        }

        // Valid student code
        try {
            const response = await fetch('/api/validate-student-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessCode: code })
            });

            const data = await response.json();

            if (data.success && data.accessGranted) {
                this.setAuthenticated('student', data.expirationDate, data.limits);
                errorElement.classList.remove('show');
                this.hideOverlay();
                console.log('✅ Student access granted (12 months pro access):', code);
            } else {
                errorElement.classList.add('show');
                console.error('❌ Student code validation failed:', data.error);
            }
        } catch (error) {
            console.error('❌ Student code validation error:', error);
            errorElement.textContent = 'Validation error. Please try again.';
            errorElement.classList.add('show');
        }
    }

    setAuthenticated(tier, expirationDate, limits) {
        const authData = {
            authenticated: true,
            tier: tier, // 'free', 'pro', or 'student'
            activatedDate: new Date().toISOString(),
            expirationDate: expirationDate,
            limits: limits
        };

        localStorage.setItem(this.storageKey, JSON.stringify(authData));
        sessionStorage.setItem(this.storageKey, JSON.stringify(authData));
    }

    initializeUsageTracking() {
        const usageData = {
            photoAnalysis: 0,
            textQueries: 0,
            resetDate: new Date().toISOString()
        };

        localStorage.setItem(this.usageKey, JSON.stringify(usageData));
    }

    isAuthenticated() {
        try {
            let authData = JSON.parse(sessionStorage.getItem(this.storageKey));
            if (!authData) {
                authData = JSON.parse(localStorage.getItem(this.storageKey));
                if (authData) {
                    sessionStorage.setItem(this.storageKey, JSON.stringify(authData));
                }
            }

            if (authData && authData.authenticated) {
                // Check expiration for pro and student tiers
                if (authData.tier === 'pro' || authData.tier === 'student') {
                    if (authData.expirationDate) {
                        const expiryTime = new Date(authData.expirationDate).getTime();
                        if (new Date().getTime() >= expiryTime) {
                            // Expired
                            this.clearAuthentication();
                            console.log('⏱️ Access expired');
                            return false;
                        }
                    }
                }

                console.log(`🔓 Access active: ${authData.tier} tier`);
                return true;
            }
        } catch (error) {
            this.clearAuthentication();
        }
        return false;
    }

    canUseFeature(featureType) {
        const authData = JSON.parse(localStorage.getItem(this.storageKey));
        if (!authData || !authData.authenticated) return false;

        // Pro and student tiers have unlimited access
        if (authData.tier === 'pro' || authData.tier === 'student') {
            return true;
        }

        // Free tier - check usage limits
        if (authData.tier === 'free') {
            const usageData = JSON.parse(localStorage.getItem(this.usageKey)) || {
                photoAnalysis: 0,
                textQueries: 0
            };

            if (featureType === 'photo') {
                return usageData.photoAnalysis < authData.limits.photoAnalysis;
            } else if (featureType === 'text') {
                return usageData.textQueries < authData.limits.textQueries;
            }
        }

        return false;
    }

    incrementUsage(featureType) {
        const authData = JSON.parse(localStorage.getItem(this.storageKey));
        if (!authData || authData.tier !== 'free') return;

        const usageData = JSON.parse(localStorage.getItem(this.usageKey)) || {
            photoAnalysis: 0,
            textQueries: 0
        };

        if (featureType === 'photo') {
            usageData.photoAnalysis++;
        } else if (featureType === 'text') {
            usageData.textQueries++;
        }

        localStorage.setItem(this.usageKey, JSON.stringify(usageData));
        console.log(`📊 Usage updated: ${usageData.photoAnalysis} photos, ${usageData.textQueries} text queries`);
    }

    getRemainingUsage() {
        const authData = JSON.parse(localStorage.getItem(this.storageKey));
        if (!authData || authData.tier !== 'free') {
            return { photos: '∞', text: '∞' };
        }

        const usageData = JSON.parse(localStorage.getItem(this.usageKey)) || {
            photoAnalysis: 0,
            textQueries: 0
        };

        return {
            photos: authData.limits.photoAnalysis - usageData.photoAnalysis,
            text: authData.limits.textQueries - usageData.textQueries
        };
    }

    clearAuthentication() {
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.usageKey);
    }

    showOverlay() {
        document.getElementById('beta-overlay').style.display = 'flex';
    }

    hideOverlay() {
        const overlay = document.getElementById('beta-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}
