/**
 * Mock API Server for k6 Performance Testing
 * Built with native Node.js http module (Zero External Dependencies)
 * Supports high concurrency, in-memory CRUD, and Bearer token auth.
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Pre-load initial mock datasets
const defaultReferences = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'references.json'), 'utf8')
);
const defaultNews = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'news.json'), 'utf8')
);

// In-memory data stores for high-throughput testing
let references = [...defaultReferences];
let news = [...defaultNews];
let nextRefId = references.length + 1;
let nextNewsId = news.length + 1;

// Standard mock token format
const VALID_TOKEN_PREFIX = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ';
const MOCK_JWT_TOKEN = `${VALID_TOKEN_PREFIX}zdWIiOiIxIiwidXNlcm5hbWUiOiJzdXBlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.mock-signature-k6-qa`;

/**
 * Utility: Send JSON response
 */
function sendJSON(res, statusCode, data) {
    const payload = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    res.end(payload);
}

/**
 * Middleware: Verify Bearer Token
 */
function authenticate(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJSON(res, 401, {
            code: 401,
            status: 'error',
            message: 'Unauthorized: Missing or invalid Bearer token format',
        });
        return null;
    }

    const token = authHeader.substring(7).trim();
    if (!token || token.length < 5) {
        sendJSON(res, 401, {
            code: 401,
            status: 'error',
            message: 'Unauthorized: Invalid token string',
        });
        return null;
    }

    // Token is valid
    return { username: 'super', role: 'admin', token };
}

/**
 * Helper: Parse JSON Body
 */
function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                resolve(null); // Invalid JSON
            }
        });
    });
}

// Request Handler
const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Normalize path: strip trailing slash and normalize /api/v1 to /api
    if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }
    const normalizedPath = pathname.replace(/^\/api\/v1\//, '/api/');

    // Health check
    if (normalizedPath === '' || normalizedPath === '/' || normalizedPath === '/health') {
        return sendJSON(res, 200, {
            status: 'ok',
            service: 'k6-mock-api-server',
            uptime: process.uptime(),
            referencesCount: references.length,
            newsCount: news.length,
        });
    }

    // ==========================================
    // 1. AUTHENTICATION MODULE
    // ==========================================
    if (normalizedPath === '/api/login' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body) {
            return sendJSON(res, 400, { code: 400, status: 'error', message: 'Invalid JSON body' });
        }

        const { username, password } = body;
        // Accept either "super" / "super123" or standard valid credentials
        const isValid = (username === 'super' && password === 'super123') ||
                        (username === 'admin' && password === 'admin123');

        if (!isValid) {
            return sendJSON(res, 401, {
                code: 401,
                status: 'error',
                message: 'Invalid username or password',
            });
        }

        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            message: 'Login successful',
            data: {
                token: MOCK_JWT_TOKEN,
                user: {
                    id: 1,
                    username: username,
                    name: 'Super Administrator',
                    role: 'admin',
                },
            },
        });
    }

    // ==========================================
    // 2. REFERENCE MODULE (CRUD)
    // ==========================================
    // Check code availability: GET /api/references/check-code
    if (normalizedPath === '/api/references/check-code' && req.method === 'GET') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const code = (query.code || '').trim().toLowerCase();
        const exists = references.some((item) => item.code.toLowerCase() === code);
        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            data: {
                code: query.code || '',
                available: !exists,
            },
        });
    }

    // List References: GET /api/references
    if (normalizedPath === '/api/references' && req.method === 'GET') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;
        const items = references.slice(startIndex, startIndex + limit);

        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            data: items,
            meta: {
                total: references.length,
                page,
                limit,
            },
        });
    }

    // Detail Reference by ID: GET /api/references/:id
    const refMatch = normalizedPath.match(/^\/api\/references\/(\d+)$/);
    if (refMatch && req.method === 'GET') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const id = parseInt(refMatch[1], 10);
        const item = references.find((r) => r.id === id);
        if (!item) {
            return sendJSON(res, 404, { code: 404, status: 'error', message: `Reference id ${id} not found` });
        }
        return sendJSON(res, 200, { code: 200, status: 'success', data: item });
    }

    // Create Reference: POST /api/references
    if (normalizedPath === '/api/references' && req.method === 'POST') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const body = await parseBody(req);
        if (!body || !body.code || !body.name) {
            return sendJSON(res, 400, {
                code: 400,
                status: 'error',
                message: 'Missing required fields: code and name are mandatory',
            });
        }

        const newId = nextRefId++;
        const newItem = {
            id: newId,
            code: body.code,
            name: body.name,
            category: body.category || 'GENERAL',
            description: body.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        references.push(newItem);

        return sendJSON(res, 201, {
            code: 201,
            status: 'success',
            message: 'Reference created successfully',
            data: newItem,
        });
    }

    // Update Reference: PUT or PATCH /api/references/:id
    if (refMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
        const auth = authenticate(req, res);
        if (!auth) return;

        const id = parseInt(refMatch[1], 10);
        const index = references.findIndex((r) => r.id === id);
        if (index === -1) {
            return sendJSON(res, 404, { code: 404, status: 'error', message: `Reference id ${id} not found` });
        }

        const body = await parseBody(req);
        if (!body) {
            return sendJSON(res, 400, { code: 400, status: 'error', message: 'Invalid JSON body' });
        }

        references[index] = {
            ...references[index],
            ...body,
            id, // preserve ID
            updatedAt: new Date().toISOString(),
        };

        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            message: 'Reference updated successfully',
            data: references[index],
        });
    }

    // Delete Reference: DELETE /api/references/:id
    if (refMatch && req.method === 'DELETE') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const id = parseInt(refMatch[1], 10);
        const index = references.findIndex((r) => r.id === id);
        if (index === -1) {
            return sendJSON(res, 404, { code: 404, status: 'error', message: `Reference id ${id} not found` });
        }

        const deleted = references.splice(index, 1)[0];
        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            message: 'Reference deleted successfully',
            data: { id: deleted.id, code: deleted.code },
        });
    }

    // ==========================================
    // 3. NEWS MODULE (CRUD)
    // ==========================================
    // List News: GET /api/news
    if (normalizedPath === '/api/news' && req.method === 'GET') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;
        const items = news.slice(startIndex, startIndex + limit);

        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            data: items,
            meta: {
                total: news.length,
                page,
                limit,
            },
        });
    }

    // Detail News by ID: GET /api/news/:id
    const newsMatch = normalizedPath.match(/^\/api\/news\/(\d+)$/);
    if (newsMatch && req.method === 'GET') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const id = parseInt(newsMatch[1], 10);
        const item = news.find((n) => n.id === id);
        if (!item) {
            return sendJSON(res, 404, { code: 404, status: 'error', message: `News id ${id} not found` });
        }
        return sendJSON(res, 200, { code: 200, status: 'success', data: item });
    }

    // Create News: POST /api/news
    if (normalizedPath === '/api/news' && req.method === 'POST') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const body = await parseBody(req);
        if (!body || !body.title || !body.content) {
            return sendJSON(res, 400, {
                code: 400,
                status: 'error',
                message: 'Missing required fields: title and content are mandatory',
            });
        }

        const newId = nextNewsId++;
        const newItem = {
            id: newId,
            title: body.title,
            content: body.content,
            author: body.author || 'Super Administrator',
            category: body.category || 'GENERAL',
            status: body.status || 'PUBLISHED',
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        news.push(newItem);

        return sendJSON(res, 201, {
            code: 201,
            status: 'success',
            message: 'News created successfully',
            data: newItem,
        });
    }

    // Update News: PUT or PATCH /api/news/:id
    if (newsMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
        const auth = authenticate(req, res);
        if (!auth) return;

        const id = parseInt(newsMatch[1], 10);
        const index = news.findIndex((n) => n.id === id);
        if (index === -1) {
            return sendJSON(res, 404, { code: 404, status: 'error', message: `News id ${id} not found` });
        }

        const body = await parseBody(req);
        if (!body) {
            return sendJSON(res, 400, { code: 400, status: 'error', message: 'Invalid JSON body' });
        }

        news[index] = {
            ...news[index],
            ...body,
            id, // preserve ID
            updatedAt: new Date().toISOString(),
        };

        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            message: 'News updated successfully',
            data: news[index],
        });
    }

    // Delete News: DELETE /api/news/:id
    if (newsMatch && req.method === 'DELETE') {
        const auth = authenticate(req, res);
        if (!auth) return;

        const id = parseInt(newsMatch[1], 10);
        const index = news.findIndex((n) => n.id === id);
        if (index === -1) {
            return sendJSON(res, 404, { code: 404, status: 'error', message: `News id ${id} not found` });
        }

        const deleted = news.splice(index, 1)[0];
        return sendJSON(res, 200, {
            code: 200,
            status: 'success',
            message: 'News deleted successfully',
            data: { id: deleted.id, title: deleted.title },
        });
    }

    // Fallback: 404 Not Found
    return sendJSON(res, 404, {
        code: 404,
        status: 'error',
        message: `Endpoint ${req.method} ${pathname} not found`,
    });
});

server.listen(PORT, HOST, () => {
    console.log(`[k6-mock-api-server] Running on http://${HOST === '0.0.0.0' ? '127.0.0.1' : HOST}:${PORT}`);
    console.log(`[k6-mock-api-server] Login endpoint: POST http://127.0.0.1:${PORT}/api/login`);
    console.log(`[k6-mock-api-server] References endpoint: http://127.0.0.1:${PORT}/api/references`);
    console.log(`[k6-mock-api-server] News endpoint: http://127.0.0.1:${PORT}/api/news`);
});

