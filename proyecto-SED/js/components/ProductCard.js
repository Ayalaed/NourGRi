(function() {
    TUÁ.createProductCard = function(data) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', data.id);

        // Imagen
        var imageDiv = document.createElement('div');
        imageDiv.className = 'product-card__image';
        imageDiv.style.background = data.gradient;
        var imageText = document.createElement('span');
        imageText.textContent = data.imageText;
        imageDiv.appendChild(imageText);

        if (data.badge) {
            var badge = document.createElement('div');
            badge.className = 'product-card__badge';
            badge.textContent = data.badge;
            imageDiv.appendChild(badge);
        }

        // Info
        var infoDiv = document.createElement('div');
        infoDiv.className = 'product-card__info';
        
        var brand = document.createElement('div');
        brand.className = 'product-card__brand';
        brand.textContent = data.brand;
        infoDiv.appendChild(brand);

        var name = document.createElement('div');
        name.className = 'product-card__name';
        name.textContent = data.name;
        infoDiv.appendChild(name);

        var price = document.createElement('div');
        price.className = 'product-card__price';
        price.textContent = 'Q' + data.price.toFixed(2);
        infoDiv.appendChild(price);

        var stock = document.createElement('div');
        stock.className = 'product-card__stock';
        stock.textContent = '✓ ' + data.stock;
        infoDiv.appendChild(stock);

        // Acciones
        var actions = document.createElement('div');
        actions.className = 'product-card__actions';

        var detailsBtn = document.createElement('button');
        detailsBtn.className = 'product-card__btn product-card__btn--secondary';
        detailsBtn.textContent = '👁️ Ver';
        detailsBtn.onclick = function() {
            if (TUÁ.modalUtils && TUÁ.modalUtils.openProductDetailModal) {
                TUÁ.modalUtils.openProductDetailModal(data.id);
            }
        };

        var addBtn = document.createElement('button');
        addBtn.className = 'product-card__btn product-card__btn--primary';
        addBtn.textContent = '🛒 Agregar';
        addBtn.onclick = function() {
            if (TUÁ.modalUtils && TUÁ.modalUtils.openConfirmModal) {
                TUÁ.modalUtils.openConfirmModal(data.id);
            }
        };

        actions.appendChild(detailsBtn);
        actions.appendChild(addBtn);

        // Ensamblar
        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        card.appendChild(actions);

        return card;
    };
})();