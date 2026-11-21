import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export const baseUrl = 'http://127.0.0.1:8080';

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
// 2. HELPER FUNCTIONS: DAPATKAN TOKEN & HEADER AUTHORIZATION
// ====================================================================

// Helper untuk pasang Bearer Token ke header
export function getHeaders(token) {
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };
}

// Helper untuk Login dan mengambil Bearer Token
export function login(username = 'super', password = 'super123') {
    const url = `${baseUrl}/api/login`;
    const payload = JSON.stringify({
        username: username,
        password: password,
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    if (res.status === 200) {
        const body = res.json();
        if (body && body.data && body.data.token) {
            return body.data.token;
        }
    }

    console.error('Login gagal! Pastikan api-server sudah running di port 8080.');
    return null;
}

// ====================================================================
// 3. SKENARIO UTAMA: TESTING ENDPOINT LOGIN
// ====================================================================
export function login_scenario() {
    const token = login('super', 'super123');

    check(token, {
        'Login berhasil dan token diterima': (t) => t !== null && t.length > 0,
    });
}

export default function () {
    login_scenario();
    sleep(1); // Jeda 1 detik antar iterasi
}

// ====================================================================
// 4. SIMPAN LAPORAN HASIL TEST KE FOLDER logs/
// ====================================================================
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'logs/login.log': textSummary(data, { indent: ' ', enableColors: false }),
    };
}
