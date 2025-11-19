(function() {
    TUÁ.modalUtils = {
        openLoginModal: function() {
            document.getElementById('login-modal').classList.add('active');
        },

        closeLoginModal: function() {
            document.getElementById('login-modal').classList.remove('active');
            document.getElementById('login-error').style.display = 'none';
        },

        openCartModal: function() {
            var modal = document.getElementById('cart-modal');
            var container = document.getElementById('cart-items-container');
            var items = TUÁ.cart.getItems();

            if (items.length === 0) {
                container.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
            } else {
                var html = '';
                items.forEach(function(item) {
                    html += '<div class="cart-item" data-id="' + item.id + '">';
                    html += '<div class="cart-item__info">';
                    html += '<div class="cart-item__name">' + item.brand + ' - ' + item.name + '</div>';
                    html += '<div class="cart-item__price">Q' + item.price.toFixed(2) + '</div>';
                    html += '</div>';
                    html += '<div class="cart-item__controls">';
                    html += '<input type="number" class="cart-item__quantity" value="' + item.quantity + '" min="1" onchange="TUÁ.cart.updateQuantity(' + item.id + ', this.value)">';
                    html += '<button class="cart-item__remove" onclick="TUÁ.cart.remove(' + item.id + '); TUÁ.modalUtils.openCartModal();">🗑️</button>';
                    html += '</div>';
                    html += '</div>';
                });
                html += '<div class="cart-total">Total: Q' + TUÁ.cart.getTotal().toFixed(2) + '</div>';
                container.innerHTML = html;
            }

            modal.classList.add('active');
        },

        closeCartModal: function() {
            document.getElementById('cart-modal').classList.remove('active');
        },

        openConfirmModal: function(productId) {
            var product = TUÁ.productsData.concat(TUÁ.featuredProducts, TUÁ.offersProducts)
                .find(function(p) { return p.id === productId; });

            if (!product) return;

            var container = document.getElementById('confirm-product-details');
            container.innerHTML = '<h3>¿Agregar al carrito?</h3><p>' + product.brand + ' - ' + product.name + '</p><p class="confirm-price">Q' + product.price.toFixed(2) + '</p>';

            document.getElementById('confirm-add-btn').onclick = function() {
                TUÁ.cart.add(productId);
                TUÁ.modalUtils.closeConfirmModal();
                TUÁ.modalUtils.openSuccessModal();
            };

            document.getElementById('confirm-modal').classList.add('active');
        },

        closeConfirmModal: function() {
            document.getElementById('confirm-modal').classList.remove('active');
        },

        openSuccessModal: function() {
            document.getElementById('success-modal').classList.add('active');
            setTimeout(function() {
                TUÁ.modalUtils.closeSuccessModal();
            }, 2000);
        },

        closeSuccessModal: function() {
            document.getElementById('success-modal').classList.remove('active');
        },

        openProductDetailModal: function(productId) {
            var product = TUÁ.productsData.concat(TUÁ.featuredProducts, TUÁ.offersProducts)
                .find(function(p) { return p.id === productId; });

            if (!product) return;

            var body = document.getElementById('product-detail-body');
            var html = '<div class="product-detail">';
            html += '<div class="product-detail__image" style="background: ' + product.gradient + ';">' + product.imageText + '</div>';
            html += '<div class="product-detail__info">';
            html += '<h3>' + product.brand + '</h3>';
            html += '<h2>' + product.name + '</h2>';
            html += '<p class="product-detail__price">Q' + product.price.toFixed(2) + '</p>';
            html += '<p class="product-detail__stock">✓ ' + product.stock + '</p>';
            html += '<button class="btn btn--primary" onclick="TUÁ.modalUtils.closeProductDetailModal(); TUÁ.modalUtils.openConfirmModal(' + product.id + ');">🛒 Agregar al Carrito</button>';
            html += '</div></div>';
            body.innerHTML = html;

            document.getElementById('product-detail-modal').classList.add('active');
        },

        closeProductDetailModal: function() {
            document.getElementById('product-detail-modal').classList.remove('active');
        }
    };
})();