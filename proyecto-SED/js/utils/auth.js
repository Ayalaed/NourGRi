(function() {
    var users = [
        { email: 'vendedor@tua.com', password: '123', role: 'seller' },
        { email: 'admin@tua.com', password: '123', role: 'admin' }
    ];

    var currentUser = null;

    TUÁ.auth = {
        init: function() {
            var stored = localStorage.getItem('tuaCurrentUser');
            if (stored) {
                currentUser = JSON.parse(stored);
                this.updateUI();
            }
        },

        login: function(email, password) {
            var user = users.find(function(u) {
                return u.email === email && u.password === password;
            });

            if (user) {
                currentUser = user;
                localStorage.setItem('tuaCurrentUser', JSON.stringify(user));
                this.updateUI();
                return true;
            }
            return false;
        },

        logout: function() {
            currentUser = null;
            localStorage.removeItem('tuaCurrentUser');
            this.updateUI();
        },

        getCurrentUser: function() {
            return currentUser;
        },

        isLoggedIn: function() {
            return currentUser !== null;
        },

        updateUI: function() {
            var buyerView = document.getElementById('buyer-view');
            var sellerView = document.getElementById('seller-view');
            var adminView = document.getElementById('admin-view');
            var headerActions = document.getElementById('header-actions');

            buyerView.classList.remove('active');
            sellerView.classList.remove('active');
            adminView.classList.remove('active');

            if (!currentUser) {
                buyerView.classList.add('active');
                headerActions.innerHTML = '<a href="#" id="login-link">Ingresar</a><div class="header__cart-icon" id="cart-icon-btn"><a href="#">🛒 Carrito</a><span class="header__cart-badge" id="cart-badge">0</span></div>';
                document.getElementById('login-link').onclick = TUÁ.modalUtils.openLoginModal;
                document.getElementById('cart-icon-btn').onclick = TUÁ.modalUtils.openCartModal;
            } else if (currentUser.role === 'seller') {
                sellerView.classList.add('active');
                headerActions.innerHTML = '<span>Vendedor: ' + currentUser.email + '</span><a href="#" id="logout-link">Cerrar Sesión</a>';
                document.getElementById('logout-link').onclick = function() { TUÁ.auth.logout(); };
                if (TUÁ.dashboard) TUÁ.dashboard.renderSellerDashboard();
            } else if (currentUser.role === 'admin') {
                adminView.classList.add('active');
                headerActions.innerHTML = '<span>Admin: ' + currentUser.email + '</span><a href="#" id="logout-link">Cerrar Sesión</a>';
                document.getElementById('logout-link').onclick = function() { TUÁ.auth.logout(); };
                if (TUÁ.dashboard) TUÁ.dashboard.renderAdminDashboard();
            }
        }
    };
})();