(function() {
    var currentSlideIndex = 0;
    var slidesData = [];

    TUÁ.renderHeroCarousel = function(containerId, slides) {
        slidesData = slides;
        var container = document.getElementById(containerId);
        if (!container) return;

        var carouselDiv = document.createElement('div');
        carouselDiv.className = 'hero-carousel';
        carouselDiv.id = 'hero-carousel';

        slides.forEach(function(slide, index) {
            var slideDiv = document.createElement('div');
            slideDiv.className = 'hero-carousel__slide';
            if (index === 0) slideDiv.classList.add('active');
            slideDiv.style.backgroundColor = slide.bgColor;

            var content = document.createElement('div');
            content.className = 'hero-carousel__content';

            var title = document.createElement('h1');
            title.className = 'hero-carousel__title';
            title.textContent = slide.title;

            var subtitle = document.createElement('p');
            subtitle.className = 'hero-carousel__subtitle';
            subtitle.textContent = slide.subtitle;

            content.appendChild(title);
            content.appendChild(subtitle);
            slideDiv.appendChild(content);
            carouselDiv.appendChild(slideDiv);
        });

        // Controles
        var prevBtn = document.createElement('button');
        prevBtn.className = 'hero-carousel__control hero-carousel__control--prev';
        prevBtn.textContent = '‹';
        prevBtn.onclick = function() { TUÁ.advanceHeroSlide(-1); };

        var nextBtn = document.createElement('button');
        nextBtn.className = 'hero-carousel__control hero-carousel__control--next';
        nextBtn.textContent = '›';
        nextBtn.onclick = function() { TUÁ.advanceHeroSlide(1); };

        carouselDiv.appendChild(prevBtn);
        carouselDiv.appendChild(nextBtn);

        // Indicadores
        var indicators = document.createElement('div');
        indicators.className = 'hero-carousel__indicators';
        indicators.id = 'hero-indicators';

        slides.forEach(function(slide, index) {
            var dot = document.createElement('span');
            dot.className = 'hero-carousel__indicator';
            if (index === 0) dot.classList.add('active');
            dot.onclick = function() { TUÁ.goToHeroSlide(index); };
            indicators.appendChild(dot);
        });

        carouselDiv.appendChild(indicators);
        container.innerHTML = '';
        container.appendChild(carouselDiv);
    };

    TUÁ.advanceHeroSlide = function(direction) {
        var slides = document.querySelectorAll('.hero-carousel__slide');
        var indicators = document.querySelectorAll('.hero-carousel__indicator');

        if (slides.length === 0) return;

        slides[currentSlideIndex].classList.remove('active');
        indicators[currentSlideIndex].classList.remove('active');

        currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;

        slides[currentSlideIndex].classList.add('active');
        indicators[currentSlideIndex].classList.add('active');
    };

    TUÁ.goToHeroSlide = function(index) {
        var slides = document.querySelectorAll('.hero-carousel__slide');
        var indicators = document.querySelectorAll('.hero-carousel__indicator');

        if (slides.length === 0) return;

        slides[currentSlideIndex].classList.remove('active');
        indicators[currentSlideIndex].classList.remove('active');

        currentSlideIndex = index;

        slides[currentSlideIndex].classList.add('active');
        indicators[currentSlideIndex].classList.add('active');
    };
})();