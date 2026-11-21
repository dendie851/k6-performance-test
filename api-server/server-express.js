/**
 * Mock API Server - Express.js Version
 * To use this version:
 * 1. npm install express cors
 * 2. node server-express.js
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Pre-load datasets
const defaultReferences = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'references.json'), 'utf8')
);
const defaultNews = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'news.json'), 'utf8')
);

let references = [...defaultReferences];
let news = [...defaultNews];
let nextRefId = references.length + 1;
let nextNewsId = news.length + 1;

const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJzdWIiOiIxIiwidXNlcm5hbWUiOiJzdXBlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.mock-signature-k6-qa';

// Auth Middleware
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            code: 401,
            status: 'error',
            message: 'Unauthorized: Missing or invalid Bearer token format',
        });
    }
    const token = authHeader.substring(7).trim();
    if (!token || token.length < 5) {
        return res.status(401).json({
            code: 401,
            status: 'error',
            message: 'Unauthorized: Invalid token string',
        });
    }
    req.user = { username: 'super', role: 'admin' };
    next();
}

// Health Check
app.get(['/', '/health'], (req, res) => {
    res.json({
        status: 'ok',
        service: 'k6-mock-api-server-express',
        uptime: process.uptime(),
        referencesCount: references.length,
        newsCount: news.length,
    });
});

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================
app.post(['/api/login', '/api/v1/login'], (req, res) => {
    const { username, password } = req.body || {};
    const isValid = (username === 'super' && password === 'super123') ||
                    (username === 'admin' && password === 'admin123');

    if (!isValid) {
        return res.status(401).json({
            code: 401,
            status: 'error',
            message: 'Invalid username or password',
        });
    }

    res.json({
        code: 200,
        status: 'success',
        message: 'Login successful',
        data: {
            token: MOCK_JWT_TOKEN,
            user: { id: 1, username, name: 'Super Administrator', role: 'admin' },
        },
    });
});

// ==========================================
// 2. REFERENCE MODULE (CRUD)
// ==========================================
app.get(['/api/references/check-code', '/api/v1/references/check-code'], authMiddleware, (req, res) => {
    const code = (req.query.code || '').trim().toLowerCase();
    const exists = references.some((item) => item.code.toLowerCase() === code);
    res.json({
        code: 200,
        status: 'success',
        data: { code: req.query.code || '', available: !exists },
    });
});

app.get(['/api/references', '/api/v1/references'], authMiddleware, (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    res.json({
        code: 200,
        status: 'success',
        data: references.slice(startIndex, startIndex + limit),
        meta: { total: references.length, page, limit },
    });
});

app.get(['/api/references/:id', '/api/v1/references/:id'], authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = references.find((r) => r.id === id);
    if (!item) {
        return res.status(404).json({ code: 404, status: 'error', message: `Reference id ${id} not found` });
    }
    res.json({ code: 200, status: 'success', data: item });
});

app.post(['/api/references', '/api/v1/references'], authMiddleware, (req, res) => {
    const { code, name, category, description } = req.body || {};
    if (!code || !name) {
        return res.status(400).json({
            code: 400,
            status: 'error',
            message: 'Missing required fields: code and name are mandatory',
        });
    }
    const newItem = {
        id: nextRefId++,
        code,
        name,
        category: category || 'GENERAL',
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    references.push(newItem);
    res.status(201).json({
        code: 201,
        status: 'success',
        message: 'Reference created successfully',
        data: newItem,
    });
});

app.put(['/api/references/:id', '/api/v1/references/:id'], authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = references.findIndex((r) => r.id === id);
    if (index === -1) {
        return res.status(404).json({ code: 404, status: 'error', message: `Reference id ${id} not found` });
    }
    references[index] = { ...references[index], ...req.body, id, updatedAt: new Date().toISOString() };
    res.json({ code: 200, status: 'success', message: 'Reference updated successfully', data: references[index] });
});

app.delete(['/api/references/:id', '/api/v1/references/:id'], authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = references.findIndex((r) => r.id === id);
    if (index === -1) {
        return res.status(404).json({ code: 404, status: 'error', message: `Reference id ${id} not found` });
    }
    const deleted = references.splice(index, 1)[0];
    res.json({ code: 200, status: 'success', message: 'Reference deleted successfully', data: { id: deleted.id } });
});

// ==========================================
// 3. NEWS MODULE (CRUD)
// ==========================================
app.get(['/api/news', '/api/v1/news'], authMiddleware, (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    res.json({
        code: 200,
        status: 'success',
        data: news.slice(startIndex, startIndex + limit),
        meta: { total: news.length, page, limit },
    });
});

app.get(['/api/news/:id', '/api/v1/news/:id'], authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = news.find((n) => n.id === id);
    if (!item) {
        return res.status(404).json({ code: 404, status: 'error', message: `News id ${id} not found` });
    }
    res.json({ code: 200, status: 'success', data: item });
});

app.post(['/api/news', '/api/v1/news'], authMiddleware, (req, res) => {
    const { title, content, author, category, status } = req.body || {};
    if (!title || !content) {
        return res.status(400).json({
            code: 400,
            status: 'error',
            message: 'Missing required fields: title and content are mandatory',
        });
    }
    const newItem = {
        id: nextNewsId++,
        title,
        content,
        author: author || 'Super Administrator',
        category: category || 'GENERAL',
        status: status || 'PUBLISHED',
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    news.push(newItem);
    res.status(201).json({
        code: 201,
        status: 'success',
        message: 'News created successfully',
        data: newItem,
    });
});

app.put(['/api/news/:id', '/api/v1/news/:id'], authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = news.findIndex((n) => n.id === id);
    if (index === -1) {
        return res.status(404).json({ code: 404, status: 'error', message: `News id ${id} not found` });
    }
    news[index] = { ...news[index], ...req.body, id, updatedAt: new Date().toISOString() };
    res.json({ code: 200, status: 'success', message: 'News updated successfully', data: news[index] });
});

app.delete(['/api/news/:id', '/api/v1/news/:id'], authMiddleware, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = news.findIndex((n) => n.id === id);
    if (index === -1) {
        return res.status(404).json({ code: 404, status: 'error', message: `News id ${id} not found` });
    }
    const deleted = news.splice(index, 1)[0];
    res.json({ code: 200, status: 'success', message: 'News deleted successfully', data: { id: deleted.id } });
});

app.listen(PORT, () => {
    console.log(`[Express Mock Server] Listening on http://127.0.0.1:${PORT}`);
});

