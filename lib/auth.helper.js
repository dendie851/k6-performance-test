import http from 'k6/http';

export const baseUrl = 'http://127.0.0.1:8080';

export function getHeaders(token) {
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };
}

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

    console.error(`Login gagal! Status: ${res.status}. Pastikan api-server sudah running di port 8080.`);
    return null;
}

