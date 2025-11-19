(function() {
    // Datos de productos
    var productsData = [
        {
            id: 1,
            brand: 'Armaf',
            name: 'Club de Nuit Intense',
            price: 699.00,
            stock: 'En stock',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            imageText: 'FRAGANCIA 1NUEVO',
            badge: 'NUEVO'
        },
        {
            id: 2,
            brand: 'Lattafa',
            name: 'Raghba Wood Intense',
            price: 599.00,
            stock: 'En stock',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            imageText: 'FRAGANCIA 2',
            badge: null
        }
        // Agrega más productos aquí
    ];

    var featuredProducts = [
        {
            id: 101,
            brand: 'Creed',
            name: 'Aventus',
            price: 1299.00,
            stock: 'En stock',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            imageText: 'DESTACADO 1',
            badge: 'DESTACADO'
        }
        // Más productos destacados
    ];

    var offersProducts = [
        {
            id: 201,
            brand: 'Tom Ford',
            name: 'Black Orchid',
            price: 899.00,
            stock: 'Últimas unidades',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            imageText: 'OFERTA',
            badge: '-30%'
        }
        // Más ofertas
    ];

    var heroSlidesData = [
        {
            title: 'Nuevas Fragancias 2024',
            subtitle: 'Descubre las últimas tendencias en perfumería',
            bgColor: '#667eea'
        },
        {
            title: 'Ofertas Especiales',
            subtitle: 'Hasta 40% de descuento en productos seleccionados',
            bgColor: '#f093fb'
        },
        {
            title: 'Colección Premium',
            subtitle: 'Fragancias exclusivas de diseñador',
            bgColor: '#4facfe'
        }
    ];

    // Exponer datos globalmente
    TUÁ.productsData = productsData;
    TUÁ.featuredProducts = featuredProducts;
    TUÁ.offersProducts = offersProducts;
    TUÁ.heroSlidesData = heroSlidesData;
})();