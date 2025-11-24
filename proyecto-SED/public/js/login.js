document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validaciones básicas de entrada
    if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
    }

    try {
        // CAMBIO IMPORTANTE 1: 
        // Usamos la ruta relativa '/api/login'. 
        // Esto evita problemas de puertos (3000 vs 3001) y CORS.
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        // Analizar la respuesta
        const data = await response.json();

        if (response.ok) {
            // CAMBIO IMPORTANTE 2:
            // Guardamos el token Y los datos del usuario (para saber su rol o avatar después)
            localStorage.setItem('token', data.token);
            
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            alert('Inicio de sesión exitoso');
            window.location.href = '/events.html'; // Redirigir a la página de eventos
        } else {
            // Mostrar mensaje de error del servidor
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        // Manejar errores de red u otros problemas inesperados
        console.error('Error al intentar iniciar sesión:', error);
        alert('Error de conexión con el servidor.');
    }
});