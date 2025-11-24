const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto'); // Módulo nativo para criptografía

// CONFIGURACIÓN
const PORT = process.env.PORT || 3000;
// Asegúrate de que esta ruta exista en tu proyecto
const DATA_PATH = path.join(__dirname, 'src', 'database', 'data.json');
const PUBLIC_PATH = path.join(__dirname, 'public');

// ALMACÉN DE SESIONES EN MEMORIA (Sustituye a JWT)
const activeSessions = {};

// Cargar base de datos inicial
let data = { users: [], events: [] };
function loadData() {
    try {
        if (fs.existsSync(DATA_PATH)) {
            data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        } else {
            fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
            saveData();
        }
    } catch (error) {
        console.error("Error cargando DB:", error);
    }
}
loadData();

// --- LÓGICA DE SEGURIDAD NATIVA (CRYPTO) ---
function hashPassword(password, salt) {
    const currentSalt = salt || crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, currentSalt, 64);
    return `${currentSalt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return key === derivedKey.toString('hex');
}

// --- SERVIDOR ---
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    console.log(`[${method}] ${pathname}`);

    // RUTAS API
    if (pathname.startsWith('/api/')) {
        try {
            if (pathname === '/api/register' && method === 'POST') return await handleRegister(req, res);
            if (pathname === '/api/login' && method === 'POST') return await handleLogin(req, res);
            
            // Rutas protegidas
            if (pathname === '/api/events') {
                if (method === 'GET') return handleGetEvents(req, res);
                if (method === 'POST') return await handleCreateEvent(req, res);
                if (method === 'DELETE') return await handleDeleteEvent(req, res);
            }
            
            if (pathname === '/api/my-events' && method === 'GET') return handleGetMyEvents(req, res);
            if (pathname === '/api/events/edit' && method === 'POST') return await handleEditEvent(req, res);

            sendJSON(res, 404, { message: 'Endpoint no encontrado' });

        } catch (error) {
            console.error(error);
            sendJSON(res, 500, { message: 'Error interno del servidor' });
        }
        return;
    }

    // SERVIR ARCHIVOS ESTÁTICOS
    serveStaticFile(req, res, pathname);
});

// --- HANDLERS ---

async function handleRegister(req, res) {
    const body = await getBody(req);
    const { name, email, password, role } = body;

    if (!name || !email || !password) return sendJSON(res, 400, { message: 'Faltan datos' });
    
    // Normalizamos el email
    const cleanEmail = email.toLowerCase().trim();
    
    if (data.users.find(u => u.email === cleanEmail)) return sendJSON(res, 400, { message: 'Usuario ya existe' });

    const securePassword = hashPassword(password);

    const newUser = {
        id: crypto.randomUUID(),
        name,
        email: cleanEmail,
        password: securePassword,
        // Guardamos el rol en minúsculas para evitar problemas
        role: role ? role.toLowerCase().trim() : 'user',
        avatar: 'default-avatar.png'
    };

    data.users.push(newUser);
    saveData();
    sendJSON(res, 201, { message: 'Usuario creado' });
}

async function handleLogin(req, res) {
    const body = await getBody(req);
    const { email, password } = body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    
    const user = data.users.find(u => u.email === cleanEmail);

    if (!user || !verifyPassword(password, user.password)) {
        return sendJSON(res, 401, { message: 'Credenciales inválidas' });
    }

    const token = crypto.randomUUID();
    activeSessions[token] = { 
        id: user.id, 
        email: user.email, 
        role: user.role 
    };

    sendJSON(res, 200, { 
        token, 
        user: { name: user.name, email: user.email, role: user.role } 
    });
}

function handleGetEvents(req, res) {
    const user = getAuth(req);
    if (!user) return sendJSON(res, 401, { message: 'No autorizado' });
    sendJSON(res, 200, data.events);
}

function handleGetMyEvents(req, res) {
    const user = getAuth(req);
    if (!user) return sendJSON(res, 401, { message: 'No autorizado' });
    
    // Filtramos eventos por ID de usuario
    const myEvents = data.events.filter(e => e.userId === user.id);
    sendJSON(res, 200, myEvents);
}

async function handleCreateEvent(req, res) {
    const user = getAuth(req);
    if (!user) return sendJSON(res, 401, { message: 'No autorizado' });

    // --- AQUÍ ESTABA EL PROBLEMA ---
    // Agregamos 'organizer' y 'admin' a la lista de permitidos
    const allowedRoles = ['eventcreator', 'superadmin', 'organizer', 'admin'];
    
    if (!allowedRoles.includes(user.role)) {
        console.log(`Bloqueado intento de creación por rol: ${user.role}`);
        return sendJSON(res, 403, { message: 'Tu rol no tiene permiso para crear eventos' });
    }

    const body = await getBody(req);
    const newEvent = {
        id: crypto.randomUUID(),
        ...body,
        userId: user.id, // Vinculamos el evento al usuario creador
        createdAt: new Date().toISOString()
    };
    
    if(!newEvent.image) newEvent.image = 'default-event.jpg';

    data.events.push(newEvent);
    saveData();
    sendJSON(res, 201, newEvent);
}

async function handleDeleteEvent(req, res) {
    const user = getAuth(req);
    if (!user) return sendJSON(res, 401, { message: 'No autorizado' });

    const body = await getBody(req);
    const index = data.events.findIndex(e => e.id === body.id);

    if (index === -1) return sendJSON(res, 404, { message: 'No encontrado' });

    const event = data.events[index];
    
    // Solo el dueño o un superadmin pueden borrar
    if (user.role !== 'superadmin' && event.userId !== user.id) {
        return sendJSON(res, 403, { message: 'No es tu evento' });
    }

    data.events.splice(index, 1);
    saveData();
    sendJSON(res, 200, { message: 'Eliminado' });
}

async function handleEditEvent(req, res) {
    const user = getAuth(req);
    if (!user) return sendJSON(res, 401, { message: 'No autorizado' });

    const body = await getBody(req);
    const index = data.events.findIndex(e => e.id === body.id);
    if (index === -1) return sendJSON(res, 404, { message: 'No encontrado' });

    const event = data.events[index];
    
    // Solo el dueño o un superadmin pueden editar
    if (user.role !== 'superadmin' && event.userId !== user.id) {
        return sendJSON(res, 403, { message: 'No puedes editar esto' });
    }

    // Actualizamos
    data.events[index] = { ...event, ...body };
    saveData();
    sendJSON(res, 200, { message: 'Actualizado' });
}

// --- UTILIDADES ---

function getAuth(req) {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const token = auth.split(' ')[1]; // Bearer TOKEN
    return activeSessions[token] || null;
}

function getBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
    });
}

function sendJSON(res, status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

function saveData() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function serveStaticFile(req, res, pathname) {
    let filePath = pathname === '/' ? 'index.html' : pathname;
    if (filePath.startsWith('/')) filePath = filePath.slice(1);
    
    // Seguridad básica contra Path Traversal
    if (filePath.includes('..')) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    const fullPath = path.join(PUBLIC_PATH, filePath);

    const mimeTypes = {
        '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
        '.png': 'image/png', '.jpg': 'image/jpg', '.json': 'application/json'
    };

    fs.readFile(fullPath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Archivo no encontrado');
        } else {
            const ext = path.extname(fullPath);
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            res.end(content);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Servidor puro corriendo en http://localhost:${PORT}`);
});