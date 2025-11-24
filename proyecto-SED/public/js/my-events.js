document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    
    // 1. Seguridad Básica
    if (!token) { window.location.href = 'index.html'; return; }

    // 2. Validación de Roles (MEJORADA)
    // Normalizamos a minúsculas para evitar errores (Ej: 'Admin' vs 'admin')
    const userRole = user.role ? user.role.toLowerCase().trim() : 'user';
    const allowedRoles = ['eventcreator', 'superadmin', 'organizer', 'admin'];

    // Si el usuario NO tiene permiso, lo redirigimos silenciosamente
    if (!allowedRoles.includes(userRole)) {
        console.warn('Acceso denegado. Redirigiendo a inicio.');
        window.location.href = 'events.html';
        return;
    }

    // --- VARIABLES DEL DOM ---
    const container = document.getElementById('my-events-container');
    // Forzamos una clase para asegurar estilo, por si acaso
    if(container) container.className = 'my-events-list-container';

    const editPopup = document.getElementById('edit-popup');
    const editForm = document.getElementById('edit-event-form');
    const cancelEditButton = document.getElementById('cancel-edit');
    const searchInput = document.getElementById('search-input');
    let myEventsList = [];

    // 3. Cargar Eventos
    async function loadMyEvents() {
        try {
            const response = await fetch('/api/my-events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al cargar');
            
            myEventsList = await response.json();
            renderEvents(myEventsList);

        } catch (error) { 
            console.error(error);
            // Si falla la API, no mostramos alerta fea, mostramos error visual
            container.innerHTML = `<p style="text-align:center; padding:2rem; color:red;">No se pudieron cargar tus eventos.</p>`;
        }
    }

    // 4. RENDERIZAR (DISEÑO LIMPIO)
    function renderEvents(events) {
        container.innerHTML = '';

        // ESTADO VACÍO (Si no hay eventos, mostramos esto en vez de alerta)
        if (events.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; padding: 4rem 1rem;">
                    <div class="empty-icon-box" style="margin: 0 auto 1.5rem auto;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 20v-6M6 20V10M18 20V4"/>
                        </svg>
                    </div>
                    <h3 style="font-weight:700; font-size: 1.25rem; margin-bottom: 0.5rem;">No has publicado eventos</h3>
                    <p style="color:#71717a; margin-bottom:2rem; font-size:0.95rem;">Tus creaciones aparecerán aquí para que las gestiones.</p>
                    <button class="btn-create-modern" onclick="window.location.href='create-event.html'" style="margin: 0 auto;">
                        Publicar mi primer evento
                    </button>
                </div>`;
            return;
        }

        // LISTA DE EVENTOS (SI HAY DATOS)
        container.innerHTML = events.map(event => `
            <div class="list-card" style="display: flex; background: white; border: 1px solid #e4e4e7; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; align-items: center; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                
                <div class="list-info" style="flex: 1;">
                    <div class="list-header" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                        <span class="list-date" style="font-size: 0.85rem; font-weight: 600; color: #3f3f46;">${event.date}</span>
                        <span class="status-pill" style="background: #dcfce7; color: #166534; font-size: 0.7rem; padding: 0.15rem 0.6rem; border-radius: 1rem; font-weight: 600; text-transform: uppercase;">Activo</span>
                    </div>
                    
                    <div class="list-title" style="font-size: 1.1rem; font-weight: 700; color: #18181b; margin-bottom: 0.5rem;">${event.title}</div>
                    
                    <div class="list-details" style="display: flex; gap: 1.5rem; color: #71717a; font-size: 0.85rem;">
                        <span style="display: flex; align-items: center; gap: 0.25rem;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${event.time || '--:--'}
                        </span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${event.location}
                        </span>
                    </div>
                </div>

                <div class="list-actions" style="display: flex; gap: 0.5rem;">
                    <button onclick="openEdit('${event.id}')" title="Editar" style="padding: 0.5rem; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 0.5rem; color: #3f3f46; cursor: pointer; transition: all 0.2s;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    
                    <button onclick="deleteEvent('${event.id}')" title="Borrar" style="padding: 0.5rem; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 0.5rem; color: #ef4444; cursor: pointer; transition: all 0.2s;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // --- LÓGICA DE EDICIÓN ---
    window.openEdit = (id) => {
        const event = myEventsList.find(e => e.id == id); // Usamos == por si id es string/number
        if(!event) return;
        
        document.getElementById('edit-id').value = event.id;
        document.getElementById('edit-title').value = event.title;
        document.getElementById('edit-date').value = event.date;
        document.getElementById('edit-location').value = event.location;
        document.getElementById('edit-description').value = event.description;
        
        editPopup.classList.remove('hidden');
    };

    if(cancelEditButton) {
        cancelEditButton.addEventListener('click', () => editPopup.classList.add('hidden'));
    }

    if(editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const title = document.getElementById('edit-title').value;
            const date = document.getElementById('edit-date').value;
            const location = document.getElementById('edit-location').value;
            const description = document.getElementById('edit-description').value;

            try {
                const res = await fetch('/api/events/edit', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, title, date, location, description }),
                });
                if(!res.ok) throw new Error();
                
                editPopup.classList.add('hidden');
                loadMyEvents(); // Recargar lista
            } catch (error) { alert('Error al guardar cambios'); }
        });
    }

    // --- LÓGICA DE BORRADO ---
    window.deleteEvent = async (id) => {
        if (!confirm('¿Seguro que deseas borrar este evento?')) return;
        try {
            const res = await fetch('/api/events', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if(!res.ok) throw new Error();
            loadMyEvents();
        } catch (error) { console.error(error); }
    };

    // Búsqueda local
    if(searchInput){
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = myEventsList.filter(ev => ev.title.toLowerCase().includes(term));
            renderEvents(filtered);
        });
    }

    // INICIAR
    loadMyEvents();
});