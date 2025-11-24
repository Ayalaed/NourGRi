document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // 1. LEER USUARIO DEL LOCALSTORAGE (Más seguro que atob manual)
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 2. VERIFICACIÓN DE SEGURIDAD (Solo Superadmin)
    if (!token || !user || user.role !== 'superadmin') {
        alert('⛔ ACCESO DENEGADO ⛔\nEsta zona es exclusiva para Administradores.');
        window.location.href = 'events.html';
        return;
    }

    const container = document.getElementById('manage-events-container');
    const editPopup = document.getElementById('edit-popup');
    const editForm = document.getElementById('edit-event-form');
    const cancelEditButton = document.getElementById('cancel-edit');
    const backToEventsButton = document.getElementById('back-to-events-button');

    // --- CARGAR EVENTOS ---
    async function loadEvents() {
        try {
            const response = await fetch('/api/events', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Error al cargar eventos');

            const events = await response.json();
            renderEvents(events);

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p class="empty-message">Error conectando con el servidor.</p>';
        }
    }

    // --- RENDERIZAR (DISEÑO MODERNO) ---
    function renderEvents(events) {
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay eventos registrados.</p>';
            return;
        }

        container.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="card-image">
                     <img src="/assets/images/${event.image || 'default-event.jpg'}" 
                          alt="${event.title}"
                          onerror="this.src='https://placehold.co/600x400?text=Evento'">
                     <span class="category-tag">ADMIN MODE</span>
                </div>
                <div class="card-content">
                    <h3>${event.title}</h3>
                    <div class="card-info">
                        <span>📅 ${event.date}</span>
                        <span>📍 ${event.location}</span>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="openEdit('${event.id}')" 
                                style="background: #f39c12; border:none; color:white; flex:1; padding:10px; border-radius:5px; cursor:pointer;">
                            ✏️ Editar
                        </button>
                        <button onclick="deleteEvent('${event.id}')" 
                                style="background: #e74c3c; border:none; color:white; flex:1; padding:10px; border-radius:5px; cursor:pointer;">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Guardamos los eventos en memoria para poder editarlos fácil luego
        window.currentEventsList = events; 
    }

    // --- ABRIR POPUP DE EDICIÓN ---
    window.openEdit = (id) => {
        // Buscamos el evento en la lista cargada para llenar el formulario
        const event = window.currentEventsList.find(e => e.id === id);
        if(!event) return;

        document.getElementById('edit-id').value = event.id;
        document.getElementById('edit-title').value = event.title;
        document.getElementById('edit-date').value = event.date;
        document.getElementById('edit-location').value = event.location;
        document.getElementById('edit-description').value = event.description;
        
        // Si tienes campo de hora en el HTML del popup, descomenta esto:
        // if(document.getElementById('edit-hour')) document.getElementById('edit-hour').value = event.time;

        editPopup.classList.remove('hidden');
    };

    // --- CERRAR POPUP ---
    cancelEditButton.addEventListener('click', () => {
        editPopup.classList.add('hidden');
    });

    // --- GUARDAR CAMBIOS (EDITAR) ---
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const title = document.getElementById('edit-title').value;
        const date = document.getElementById('edit-date').value;
        const location = document.getElementById('edit-location').value;
        const description = document.getElementById('edit-description').value;

        try {
            const response = await fetch('/api/events/edit', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, title, date, location, description }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            alert('✅ Evento actualizado correctamente');
            editPopup.classList.add('hidden');
            loadEvents(); // Recargar la lista para ver cambios

        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // --- ELIMINAR EVENTO ---
    window.deleteEvent = async (id) => {
        if (!confirm('¿Estás SEGURO de eliminar este evento permanentemente?')) return;

        try {
            // NOTA: El nuevo servidor usa DELETE en /api/events pasando el ID en el body
            const response = await fetch('/api/events', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error('No se pudo eliminar');

            alert('🗑️ Evento eliminado');
            loadEvents(); // Recargar lista

        } catch (error) {
            console.error(error);
            alert('Error al eliminar el evento');
        }
    };

    // Botón volver
    if(backToEventsButton) {
        backToEventsButton.addEventListener('click', () => {
            window.location.href = 'events.html';
        });
    }

    // INICIAR
    loadEvents();
});