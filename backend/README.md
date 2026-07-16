# DuMMY Backend - Node.js & Supabase

Backend ini dirancang untuk mendukung frontend React Anda dengan data real-time dari Supabase.

## Persiapan

1. **Supabase Setup**:
   - Buat proyek baru di [Supabase](https://supabase.com/).
   - Buka **SQL Editor** di dashboard Supabase.
   - Salin isi dari file `schema.sql` dan jalankan (Run). Ini akan membuat tabel yang diperlukan.

2. **Konfigurasi Environment**:
   - Buka file `.env` di folder ini.
   - Isi `SUPABASE_URL` dan `SUPABASE_KEY` dengan nilai dari dashboard Supabase Anda (Settings > API).

3. **Install Dependensi**:
   ```bash
   npm install
   ```

4. **Jalankan Backend**:
   ```bash
   npm start
   ```

## Deploy Sementara ke Railway

Jika ingin deploy backend ini saja ke Railway:

1. Buat service baru dari repo ini.
2. Set **Root Directory** service ke `dummy/backend`.
3. Railway akan menjalankan `npm start` memakai file [railway.json](C:\Users\MyBook Hype AMD\OneDrive\Derill\dummy_magang\dummy\backend\railway.json).
4. Tambahkan environment variables dari [.env.example](C:\Users\MyBook Hype AMD\OneDrive\Derill\dummy_magang\dummy\backend\.env.example).

Catatan penting:
- Endpoint health check tersedia di `/ping`.
- Jika `SUPABASE_URL`, `SUPABASE_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` belum diisi, backend tetap bisa menerima data ESP8266 dengan fallback ke `local-data.json`.
- Karena filesystem Railway bersifat sementara, data fallback lokal akan hilang saat service restart atau redeploy. Untuk data persisten, nanti sebaiknya pakai Supabase atau database lain.

## API Endpoints

- `GET /api/summary`: Mengambil data sensor terbaru.
- `GET /api/sensor-logs`: Mengambil daftar log sensor terbaru.
- `GET /api/alerts`: Mengambil daftar peringatan (alerts).
- `GET /api/nodes`: Mengambil daftar node hardware.
- `GET /ping`: Health check untuk ESP8266.
- `POST /api/sensor`: Endpoint ingest data dari `SoilMonitoringESP8266`.
- `POST /api/login`: Endpoint untuk autentikasi (menggunakan Supabase Auth).

## Format Payload ESP8266

Backend ini menerima payload seperti berikut:

```json
{
  "kelembaban": 47,
  "status": "Lembab",
  "adc": 730,
  "node_name": "SoilMonitoringESP8266",
  "location": "Field Sector A"
}
```

Catatan:
- `kelembaban` akan disimpan sebagai `moisture`.
- Jika `ph` dan `temperature` tidak dikirim dari device, backend akan memakai default `6.8` dan `24.0`.
- Backend juga akan meng-update tabel `nodes` dan membuat alert otomatis saat kelembaban terlalu rendah atau terlalu tinggi.

## Konfigurasi ESP8266

Salinan firmware yang sudah disesuaikan ada di folder [SoilMonitoringESP8266](C:\Users\MyBook Hype AMD\OneDrive\Derill\dummy_magang\dummy\SoilMonitoringESP8266).

Sebelum upload firmware:
- Ubah `ssid` dan `password` di `src/main.cpp`.
- Ubah `serverBaseUrl` ke IP laptop/PC yang menjalankan backend, misalnya `http://192.168.1.10:3000`.
- Pastikan laptop dan ESP8266 ada di jaringan WiFi yang sama.

## Cara Menghubungkan Frontend ke Backend

Di komponen React Anda, gunakan `fetch` atau `axios` untuk memanggil API ini. Contoh pada `DashboardPage.jsx`:

```javascript
useEffect(() => {
  fetch('http://localhost:3000/api/summary')
    .then(res => res.json())
    .then(data => setSummary(data));
}, []);
```
