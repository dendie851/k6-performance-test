import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// Import helper autentikasi dari lib
import { baseUrl, getHeaders, login } from '../lib/auth_helper.js';

// ====================================================================
// 1. VARIABEL PENGATURAN TEST (MUDAH DIUBAH UNTUK LATIHAN)
// ====================================================================
const VUS = 60;           // Jumlah Virtual Users (pemakai simulasi)
const DURATION = '60s';   // Lama durasi pengujian

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
// 3. FUNGSI MANDIRI UNTUK SETIAP ENDPOINT REFERENCE
// ====================================================================

// Endpoint 1: GET /api/references (View List)
export function getReferencesList(headers) {
    const res = http.get(`${baseUrl}/api/references?page=1&limit=20`, headers);
    check(res, {
        'GET references list - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 2: GET /api/references/check-code (View Check Code)
export function checkReferenceCode(headers, code = 'REF_CURR_IDR') {
    const res = http.get(`${baseUrl}/api/references/check-code?code=${code}`, headers);
    check(res, {
        'GET check-code - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 3: GET /api/references/:id (View Detail)
export function getReferenceDetail(headers, id = 1) {
    const res = http.get(`${baseUrl}/api/references/${id}`, headers);
    check(res, {
        'GET reference detail - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 4: POST /api/references (Input / Create)
export function createReference(headers) {
    const postPayload = JSON.stringify({
        code: `REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: 'Reference Training Baru',
        category: 'TRAINING',
        description: 'Dibuat saat latihan k6',
    });
    const res = http.post(`${baseUrl}/api/references`, postPayload, headers);
    check(res, {
        'POST reference - status 201/200': (r) => r.status === 201 || r.status === 200,
    });
    return res;
}

// Endpoint 5: PUT /api/references/:id (Update)
export function updateReference(headers, id = 1) {
    const putPayload = JSON.stringify({
        name: 'Reference Training Diperbarui',
        description: 'Update deskripsi saat latihan k6',
    });
    const res = http.put(`${baseUrl}/api/references/${id}`, putPayload, headers);
    check(res, {
        'PUT reference - status 200': (r) => r.status === 200,
    });
    return res;
}

// Endpoint 6: DELETE /api/references/:id (Delete)
export function deleteReference(headers, id = 5) {
    const res = http.del(`${baseUrl}/api/references/${id}`, null, headers);
    check(res, {
        'DELETE reference - status 200/204': (r) => r.status === 200 || r.status === 204,
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
    getReferencesList(headers);
    //getReferenceDetail(headers, 1);
    //checkReferenceCode(headers, 'REF_CURR_IDR');
    //createReference(headers);
    //updateReference(headers, 1);
    //deleteReference(headers, 5);
}



export function reference_scenario(data) {
    // Siapkan header yang berisi Authorization: Bearer <token>
    const headers = getHeaders(data.token);

    // Panggil setiap fungsi endpoint (peserta latihan bisa mengaktifkan/menonaktifkan fungsi ini)
    getReferencesList(headers);
    //getReferenceDetail(headers, 1);
    //checkReferenceCode(headers, 'REF_CURR_IDR');
    //createReference(headers);
    //updateReference(headers, 1);
    //deleteReference(headers, 5);
}



// ====================================================================
// 5. SIMPAN LAPORAN HASIL TEST KE FOLDER logs/
// ====================================================================
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'logs/reference.log': textSummary(data, { indent: ' ', enableColors: false }),
    };
}
