# Docker Deployment

Setup ini menyiapkan 3 service:

- `web`: frontend React yang dibuild dengan Vite lalu disajikan oleh Nginx
- `backend`: Django API yang jalan lewat Gunicorn
- `db`: PostgreSQL untuk data aplikasi

## Langkah cepat

1. Salin `.env.example` menjadi `.env`.
2. Isi minimal `POSTGRES_PASSWORD`, `DJANGO_SECRET_KEY`, dan konfigurasi email jika ingin notifikasi SMTP aktif.
3. Jalankan:

```bash
docker compose up --build -d
```

4. Akses aplikasi di `http://localhost` atau port yang kamu set di `WEB_PORT`.

## Endpoint penting

- Frontend: `http://localhost`
- Admin Django: `http://localhost/admin/`
- API Django: `http://localhost/api/`

## Catatan

- File upload disimpan di `../backend/media`.
- Static files hasil `collectstatic` disimpan di `../backend/staticfiles`.
- Saat container backend start, migration dan `collectstatic` dijalankan otomatis.
- Untuk production, pastikan `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `FRONTEND_BASE_URL`, dan kredensial email diisi sesuai domain aslimu.
