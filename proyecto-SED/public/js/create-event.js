document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    
    // 1. Verificar sesión
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. BLOQUEO DE SEGURIDAD (ROBUSTO)
    // Normalizamos el rol (minúsculas y sin espacios) para evitar errores
    const userRole = user.role ? user.role.toLowerCase().trim() : 'user';
    
    // Lista de roles permitidos para crear eventos
    // IMPORTANTE: 'organizer' debe estar aquí para que funcione tu usuario
    const allowedRoles = ['eventcreator', 'superadmin', 'organizer', 'admin'];

    // Si el rol del usuario NO está en la lista permitida, lo sacamos.
    if (!allowedRoles.includes(userRole)) {
        alert('⛔ ACCESO DENEGADO ⛔\n\nTu cuenta es de "Usuario" (Solo lectura).\nPara publicar eventos, necesitas permisos de Organizador o Creador.');
        window.location.href = 'events.html'; // Volver al dashboard
        return;
    }

    // 3. LÓGICA DEL FORMULARIO
    const form = document.getElementById('create-event-form');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener datos del formulario
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const category = document.getElementById('category').value;
            const capacity = document.getElementById('capacity').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('hour').value;
            const location = document.getElementById('location').value;
            const contact = document.getElementById('contact').value;

            // Validaciones básicas
            if (!title || !date || !time || !location || !description || !contact) {
                alert('Por favor completa los campos obligatorios');
                return;
            }

            // Asignar imagen por defecto según categoría (ya que quitamos el upload)
            let randomImage = 'default-event.jpg';
            if (category === 'Tecnología') randomImage = 'coding-session.jpg';
            if (category === 'Negocios') randomImage = 'meeting.jpg';

            // Construir el objeto del evento
            const newEvent = {
                title,
                // Concatenamos info extra en la descripción
                description: `${description}\n\n📞 ${contact}\n👥 Capacidad: ${capacity || 'Ilimitada'}`,
                category,
                date,
                time,
                location,
                image: randomImage
            };

            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newEvent)
                });

                if (response.ok) {
                    alert('¡Evento creado exitosamente!');
                    window.location.href = 'my-events.html';
                } else {
                    const errorData = await response.json();
                    alert('Error: ' + (errorData.message || 'No se pudo crear'));
                }

            } catch (error) {
                console.error(error);
                alert('Error de conexión.');
            }
        });
    }
});