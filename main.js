import { login, baseUrl } from './lib/auth_helper.js';
import { sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// Import skenario pengujian dari folder scripts/
import { login_scenario } from './scripts/login.js';
import { reference_scenario } from './scripts/reference.js';
import { news_scenario } from './scripts/news.js';

// ====================================================================
// 1. VARIABEL KONFIGURASI TEST (MUDAH DIUBAH UNTUK LATIHAN)
// ====================================================================
const VUS = 10;           // Jumlah Virtual Users per modul skenario
const DURATION = '30s';   // Durasi pengujian

export const options = {
    scenarios: {
        // Skenario 1: Testing Modul Login
        auth_login: {
            executor: 'constant-vus',
            vus: VUS,
            duration: DURATION,
            exec: 'run_login',
        },
        // Skenario 2: Testing Modul Reference (CRUD: List, Detail, Create, Update, Delete)
        reference_module: {
            executor: 'constant-vus',
            vus: VUS,
            duration: DURATION,
            exec: 'run_references',
        },
        // Skenario 3: Testing Modul News (CRUD: List, Detail, Create, Update, Delete)
        news_module: {
            executor: 'constant-vus',
            vus: VUS,
            duration: DURATION,
            exec: 'run_news',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.01'],     // Error rate harus di bawah 1%
        http_req_duration: ['p(90)<5000'],  // 90% respon request harus di bawah 5 detik (5000ms)
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
// 3. FUNGSI EKSEKUSI TIAP SKENARIO
// ====================================================================

// Eksekusi skenario Login
export function run_login() {
    login_scenario();
    sleep(1);
}

// Eksekusi skenario Reference (menggunakan Bearer Token dari setup)
export function run_references(data) {
    reference_scenario(data.token);
    sleep(1);
}

// Eksekusi skenario News (menggunakan Bearer Token dari setup)
export function run_news(data) {
    news_scenario(data.token);
    sleep(1);
}

// Fallback default function jika skenario dijalankan sekuensial
export default function (data) {
    run_login();
    run_references(data);
    run_news(data);
}

// ====================================================================
// 4. SIMPAN LAPORAN HASIL TEST GABUNGAN KE FOLDER logs/
// ====================================================================
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'logs/main.log': textSummary(data, { indent: ' ', enableColors: false }),
    };
}
