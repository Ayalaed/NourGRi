(function() {
    var cartItems = [];

    TUÁ.cart = {
        add: function(productId) {
            var product = TUÁ.productsData.concat(TUÁ.featuredProducts, TUÁ.offersProducts)
                .find(function(p) { return p.id === productId; });

            if (!product) return;

            var existing = cartItems.find(function(item) { return item.id === productId; });

            if (existing) {
                existing.quantity++;
            } else {
                cartItems.push({
                    id: product.id,
                    brand: product.brand,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }

            this.updateBadge();
            this.save();
        },

        remove: function(productId) {
            cartItems = cartItems.filter(function(item) { return item.id !== productId; });
            this.updateBadge();
            this.save();
        },

        updateQuantity: function(productId, quantity) {
            var item = cartItems.find(function(i) { return i.id === productId; });
            if (item) {
                item.quantity = Math.max(1, quantity);
                this.save();
            }
        },

        getItems: function() {
            return cartItems;
        },

        getTotal: function() {
            return cartItems.reduce(function(sum, item) {
                return sum + (item.price * item.quantity);
            }, 0);
        },

        clear: function() {
            cartItems = [];
            this.updateBadge();
            this.save();
        },

        updateBadge: function() {
            var badge = document.getElementById('cart-badge');
            if (badge) {
                var total = cartItems.reduce(function(sum, item) { return sum + item.quantity; }, 0);
                badge.textContent = total;
            }
        },

        save: function() {
            localStorage.setItem('tuaCart', JSON.stringify(cartItems));
        },

        load: function() {
            var stored = localStorage.getItem('tuaCart');
            if (stored) {
                cartItems = JSON.parse(stored);
                this.updateBadge();
            }
        }
    };
})();