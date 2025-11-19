(function() {
    TUÁ.mainApp = {};

    function renderProductGrid(containerId, products) {
        var container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        
        products.forEach(function(product) {
            var cardNode = TUÁ.createProductCard(product);
            container.appendChild(cardNode);
        });
    }

    function initializeBuyerView() {
        TUÁ.renderHeroCarousel('hero-carousel-container', TUÁ.heroSlidesData);
        TUÁ.renderProductCarousel('featured-products-container', TUÁ.featuredProducts, 'featured-carousel');
        TUÁ.mainApp.renderBuyerProducts();
        TUÁ.renderProductCarousel('offers-carousel-container', TUÁ.offersProducts, 'offers-carousel');

        setInterval(function() { 
            TUÁ.advanceHeroSlide(1); 
        }, 5000);
    }
    
    TUÁ.mainApp.renderBuyerProducts = function() {
        renderProductGrid('product-grid-container', TUÁ.productsData);
        TUÁ.renderProductCarousel('featured-products-container', TUÁ.featuredProducts, 'featured-carousel');
        TUÁ.renderProductCarousel('offers-carousel-container', TUÁ.offersProducts, 'offers-carousel');
    };

    function attachEventListeners() {
        document.getElementById('close-login-btn').onclick = TUÁ.modalUtils.closeLoginModal;
        document.getElementById('close-cart-btn').onclick = TUÁ.modalUtils.closeCartModal;
        document.getElementById('cancel-add-btn').onclick = TUÁ.modalUtils.closeConfirmModal;
        document.getElementById('close-success-btn').onclick = TUÁ.modalUtils.closeSuccessModal;
        document.getElementById('close-product-detail-btn').onclick = TUÁ.modalUtils.closeProductDetailModal;
        document.getElementById('continue-shopping-btn').onclick = TUÁ.modalUtils.closeCartModal;

        document.getElementById('login-form').onsubmit = function(e) {
            e.preventDefault();
            var email = document.getElementById('login-email').value;
            var password = document.getElementById('login-password').value;

            if (TUÁ.auth.login(email, password)) {
                TUÁ.modalUtils.closeLoginModal();
            } else {
                document.getElementById('login-error').style.display = 'block';
            }
        };
    }

    document.addEventListener('DOMContentLoaded', function() {
        TUÁ.auth.init();
        TUÁ.cart.load();
        initializeBuyerView(); 
        attachEventListeners();
        
        window.addEventListener('resize', TUÁ.resetProductCarousels);
        
        console.log('✅ Aplicación inicializada.');
    });
})();