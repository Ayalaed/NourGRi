document.addEventListener('DOMContentLoaded', async () => {
    // Referencias
    const eventsContainer = document.getElementById('events-container');
    const searchInput = document.getElementById('search-input');
    
    // Forzamos la clase CSS correcta al contenedor por si acaso no está en el HTML
    if (eventsContainer) eventsContainer.className = 'events-grid';

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    // 1. Verificar Token
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. GESTIÓN DE VISIBILIDAD (BOTONES)
    const createBtn = document.getElementById('create-event-btn');
    const myEventsTab = document.getElementById('my-events-tab');

    // Normalizamos el rol
    const userRole = user.role ? user.role.toLowerCase().trim() : 'user';
    
    console.log('👤 Usuario:', user.name);
    console.log('🔑 Rol:', userRole);

    // Roles permitidos
    const allowedRoles = ['eventcreator', 'superadmin', 'organizer', 'admin'];

    if (allowedRoles.includes(userRole)) {
        console.log('✅ Permiso CONCEDIDO.');
        if(createBtn) {
            createBtn.style.display = 'flex'; 
            createBtn.classList.remove('hidden');
        }
        if(myEventsTab) {
            myEventsTab.style.display = 'block';
            myEventsTab.classList.remove('hidden');
        }
    } else {
        console.log('🔒 Modo lectura.');
        if(createBtn) createBtn.style.display = 'none';
        if(myEventsTab) myEventsTab.style.display = 'none';
    }

    let allEvents = [];

    // --- 3. CARGAR EVENTOS (TU LÓGICA API) ---
    async function fetchEvents() {
        try {
            const response = await fetch('/api/events', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'index.html';
                return;
            }

            if (!response.ok) throw new Error('Error al cargar');
            
            allEvents = await response.json();
            renderEvents(allEvents);

        } catch (error) {
            console.error(error);
            eventsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Error de conexión</h3>
                    <p>No pudimos cargar los eventos. Intenta más tarde.</p>
                </div>`;
        }
    }

    // --- 4. RENDERIZAR (AQUÍ ESTÁ LA MEJORA VISUAL) ---
    function renderEvents(events) {
        eventsContainer.innerHTML = '';

        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon-box">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a7 7 0 0114 0M9 21h6" />
                        </svg>
                    </div>
                    <h3>No se encontraron eventos</h3>
                    <p>Intenta ajustar tu búsqueda.</p>
                </div>
            `;
            return;
        }

        // Generamos el HTML usando las clases CORRECTAS (event-card, card-image, etc.)
        eventsContainer.innerHTML = events.map(event => {
            
            // Lógica para decidir si mostrar IMAGEN o ICONO SVG
            // Nota: Mantengo tu ruta '/assets/images/'
            const imageHTML = event.image 
                ? `<img src="/assets/images/${event.image}" alt="${event.title}" onerror="this.parentElement.innerHTML='<svg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\' /></svg>'">` 
                : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>`;

            return `
            <article class="event-card">
                <div class="card-image">
                    ${imageHTML}
                    <span class="card-category">${event.category || 'Evento'}</span>
                </div>

                <div class="card-content">
                    <div class="card-date">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        ${event.date} • ${event.time || ''}
                    </div>
                    
                    <h3 class="card-title">${event.title}</h3>
                    
                    <p class="card-description">
                        ${event.description || 'Sin descripción disponible.'}
                    </p>

                    <div class="card-footer">
                        <div class="card-location">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            ${event.location}
                        </div>
                        <a href="#" class="btn-view-event">Ver más →</a>
                    </div>
                </div>
            </article>
            `;
        }).join('');
    }

    // --- 5. BÚSQUEDA ---
    if(searchInput){
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allEvents.filter(event => 
                event.title.toLowerCase().includes(query) || 
                event.location.toLowerCase().includes(query)
            );
            renderEvents(filtered);
        });
    }

    // Iniciar carga
    fetchEvents();
});