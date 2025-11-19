(function() {
    var carouselStates = {};

    TUÁ.renderProductCarousel = function(containerId, products, carouselId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        carouselStates[carouselId] = { currentIndex: 0, products: products };

        var wrapper = document.createElement('div');
        wrapper.className = 'product-carousel';

        var header = document.createElement('div');
        header.className = 'product-carousel__header';

        var title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = 'Productos Destacados';
        header.appendChild(title);

        var controls = document.createElement('div');
        controls.className = 'product-carousel__controls';

        var prevBtn = document.createElement('button');
        prevBtn.className = 'product-carousel__btn';
        prevBtn.textContent = '‹';
        prevBtn.onclick = function() { TUÁ.moveProductCarousel(carouselId, -1); };

        var nextBtn = document.createElement('button');
        nextBtn.className = 'product-carousel__btn';
        nextBtn.textContent = '›';
        nextBtn.onclick = function() { TUÁ.moveProductCarousel(carouselId, 1); };

        controls.appendChild(prevBtn);
        controls.appendChild(nextBtn);
        header.appendChild(controls);

        var track = document.createElement('div');
        track.className = 'product-carousel__track';
        track.id = carouselId + '-track';

        products.forEach(function(product) {
            var cardNode = TUÁ.createProductCard(product);
            track.appendChild(cardNode);
        });

        wrapper.appendChild(header);
        wrapper.appendChild(track);

        container.innerHTML = '';
        container.appendChild(wrapper);

        updateCarouselPosition(carouselId);
    };

    TUÁ.moveProductCarousel = function(carouselId, direction) {
        var state = carouselStates[carouselId];
        if (!state) return;

        var visibleCards = getVisibleCards();
        var maxIndex = Math.max(0, state.products.length - visibleCards);

        state.currentIndex = Math.max(0, Math.min(maxIndex, state.currentIndex + direction));
        updateCarouselPosition(carouselId);
    };

    function updateCarouselPosition(carouselId) {
        var state = carouselStates[carouselId];
        if (!state) return;

        var track = document.getElementById(carouselId + '-track');
        if (!track) return;

        var cardWidth = 250;
        var gap = 20;
        var offset = -(state.currentIndex * (cardWidth + gap));

        track.style.transform = 'translateX(' + offset + 'px)';
    }

    function getVisibleCards() {
        var width = window.innerWidth;
        if (width >= 1200) return 4;
        if (width >= 768) return 3;
        if (width >= 480) return 2;
        return 1;
    }

    TUÁ.resetProductCarousels = function() {
        for (var carouselId in carouselStates) {
            updateCarouselPosition(carouselId);
        }
    };
})();