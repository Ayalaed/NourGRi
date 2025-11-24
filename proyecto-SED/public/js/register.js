document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Capturar datos del formulario
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            // 2. Validaciones básicas
            if (!name || !email || !password || !role) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            if (password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres.');
                return;
            }

            // 3. Enviar al Servidor
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });

                const data = await response.json();

                if (response.ok) {
                    // Éxito
                    alert('✅ ¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
                    window.location.href = 'index.html'; // Redirigir al Login
                } else {
                    // Error del servidor (ej: "Usuario ya existe")
                    alert('Error: ' + (data.message || 'No se pudo registrar.'));
                }

            } catch (error) {
                console.error('Error de red:', error);
                alert('Hubo un problema de conexión con el servidor.');
            }
        });
    }
});