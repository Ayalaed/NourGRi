(function() {
    TUÁ.dashboard = {
        renderSellerDashboard: function() {
            var container = document.getElementById('seller-view');
            container.innerHTML = '<h1>Panel del Vendedor</h1><p>Gestiona tus productos aquí.</p>';
        },

        renderAdminDashboard: function() {
            var container = document.getElementById('admin-view');
            container.innerHTML = '<h1>Panel de Administración</h1><p>Controla todo el sistema.</p>';
        }
    };
})();