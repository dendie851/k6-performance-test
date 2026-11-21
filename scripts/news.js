import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// Import helper autentikasi dari lib
import { baseUrl, getHeaders, login } from '../lib/auth_helper.js';

// ====================================================================
// 1. VARIABEL PENGATURAN TEST (MUDAH DIUBAH UNTUK LATIHAN)
// ====================================================================
const VUS = 10;           // Jumlah Virtual Users (pemakai simulasi)
const DURATION = '30s';   // Lama durasi pengujian

export const options = {
    vus: VUS,
    duration: DURATION,
    thresholds: {
        http_req_failed: ['rate<0.01'],     // Error rate harus di bawah 1%
        http_req_duration: ['p(90)<5000'],  // 90% respon harus di bawah 5 detik (5000ms)
    },
};

// ====================================================================
// 2. SETUP: LOGIN SATU KALI & DAPATKAN BEARER TOKEN
// ====================================================================
export function setup() {
    const token = login();
    return { token: token };
}

// ====================================================================
// 3. FUNGSI MANDIRI UNTUK SETIAP ENDPOINT NEWS
// ====================================================================

// Endpoint 1: GET /api/news (View List)
export function getNewsList(headers) {
    const res = http.get(`${baseUrl}/api/news?page=1&limit=20`, headers);
    check(res, {
        'GET news list - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 2: GET /api/news/:id (View Detail)
export function getNewsDetail(headers, id = 1) {
    const res = http.get(`${baseUrl}/api/news/${id}`, headers);
    check(res, {
        'GET news detail - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 3: POST /api/news (Input / Create)
export function createNews(headers) {
    const postPayload = JSON.stringify({
        title: `Berita Latihan k6 #${Date.now()}`,
        content: 'Isi artikel berita pengujian performa oleh peserta training.',
        author: 'Peserta Training',
        category: 'TRAINING',
        status: 'PUBLISHED',
    });
    const res = http.post(`${baseUrl}/api/news`, postPayload, headers);
    check(res, {
        'POST news - status 201/200': (r) => r.status === 201 || r.status === 200,
    });
    return res;
}

// Endpoint 4: PUT /api/news/:id (Update)
export function updateNews(headers, id = 1) {
    const putPayload = JSON.stringify({
        title: 'Berita Training Telah Diperbarui',
        content: 'Konten artikel berita setelah berhasil diperbarui.',
    });
    const res = http.put(`${baseUrl}/api/news/${id}`, putPayload, headers);
    check(res, {
        'PUT news - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 5: DELETE /api/news/:id (Delete)
export function deleteNews(headers, id = 3) {
    const res = http.del(`${baseUrl}/api/news/${id}`, null, headers);
    check(res, {
        'DELETE news - status 200/204': (r) => r.status === 200 || r.status === 204,
    });
    return res;
}

// ====================================================================
// 4. SKENARIO UTAMA: MEMANGGIL SETIAP FUNGSI ENDPOINT
// ====================================================================
export default function (data) {
    // Siapkan header yang berisi Authorization: Bearer <token>
    const headers = getHeaders(data.token);

    // Panggil setiap fungsi endpoint (peserta latihan bisa mengaktifkan/menonaktifkan fungsi ini)
    getNewsList(headers);
    getNewsDetail(headers, 1);
    createNews(headers);
    updateNews(headers, 1);
    deleteNews(headers, 3);

    sleep(1); // Jeda 1 detik antar iterasi
}

// Alias fungsi skenario untuk kompatibilitas runner
export function news_scenario(token) {
    const headers = getHeaders(token);
    getNewsList(headers);
    //getNewsDetail(headers, 1);
    //createNews(headers);
    //updateNews(headers, 1);
    //deleteNews(headers, 3);
}

// ====================================================================
// 5. SIMPAN LAPORAN HASIL TEST KE FOLDER logs/
// ====================================================================
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'logs/news.log': textSummary(data, { indent: ' ', enableColors: false }),
    };
}
