# Mock API Server for k6 Performance Testing

Server mock API berbasis Node.js untuk keperluan benchmarking dan performance testing menggunakan k6. Server ini dirancang untuk throughput tinggi dengan *in-memory data store* dan validasi Bearer Token authentication.

---

## Modul Endpoint

### 1. Authentication
- `POST /api/login` & `POST /api/v1/login`
  - **Body**: `{ "username": "super", "password": "super123" }`
  - **Response 200**: Mengembalikan `bearer token` (JWT mock).
  - **Response 401**: Kredensial tidak valid.

### 2. Reference Module (Protected - Bearer Token)
- `GET /api/references`: Menampilkan daftar referensi (mendukung `?page=1&limit=20`).
- `GET /api/references/:id`: Menampilkan detail referensi berdasarkan ID.
- `GET /api/references/check-code?code=...`: Memeriksa ketersediaan kode referensi.
- `POST /api/references`: Menambah referensi baru (Input).
- `PUT /api/references/:id`: Memperbarui referensi yang ada (Update).
- `DELETE /api/references/:id`: Menghapus referensi (Delete).

### 3. News Module (Protected - Bearer Token)
- `GET /api/news`: Menampilkan daftar berita (mendukung `?page=1&limit=20`).
- `GET /api/news/:id`: Menampilkan detail artikel berita berdasarkan ID.
- `POST /api/news`: Menambah berita baru (Input).
- `PUT /api/news/:id`: Memperbarui data berita (Update).
- `DELETE /api/news/:id`: Menghapus data berita (Delete).

---

## Cara Menjalankan Server

### Opsi A: Menggunakan Native Node.js (Zero Dependencies - Disarankan)
Versi ini tidak memerlukan `npm install`, langsung dapat dijalankan di terminal:

```bash
cd api-server
node server.js
```
atau menggunakan npm:
```bash
npm start
```
Server akan aktif di `http://127.0.0.1:8080`.

### Opsi B: Menggunakan Express.js
Jika ingin menggunakan versi Express.js:
```bash
cd api-server
npm install express cors
node server-express.js
```

