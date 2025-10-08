# Quick Start: Menggunakan Google Drive Backup

## Langkah Cepat (5 Menit Setup)

### 1. Buat Google Cloud Project

1. Buka https://console.cloud.google.com/
2. Klik "New Project" atau pilih "Select a project" > "New Project"
3. Beri nama project (contoh: `MindNote-Backup`)
4. Klik "Create"

### 2. Aktifkan Google Drive API

1. Di dashboard project, buka menu "APIs & Services" > "Library"
2. Cari "Google Drive API"
3. Klik hasil pencarian, lalu klik tombol "Enable"

### 3. Buat OAuth Credentials

#### A. Konfigurasi OAuth Consent Screen (Jika Pertama Kali)

1. Buka "APIs & Services" > "OAuth consent screen"
2. Pilih **"External"** (untuk penggunaan pribadi)
3. Klik "Create"
4. Isi form:
   - **App name**: MindNote
   - **User support email**: Email Anda
   - **Developer contact**: Email Anda
5. Klik "Save and Continue"
6. Di halaman "Scopes", klik "Add or Remove Scopes"
7. Cari dan centang: `https://www.googleapis.com/auth/drive.file`
8. Klik "Update" lalu "Save and Continue"
9. Di halaman "Test users", klik "Add Users"
10. Tambahkan email Google Anda
11. Klik "Save and Continue"

#### B. Buat OAuth Client ID

1. Buka "APIs & Services" > "Credentials"
2. Klik "Create Credentials" > "OAuth client ID"
3. Application type: **"Web application"**
4. Name: `MindNote Web Client`
5. Authorized JavaScript origins, klik "Add URI":
   - `http://localhost:5173`
   - `http://localhost:4173`
6. Klik "Create"
7. **COPY Client ID** (format: `xxxxx-xxxxx.apps.googleusercontent.com`)
8. Simpan, nanti akan kita gunakan

### 4. (Opsional) Buat API Key

1. Di "Credentials", klik "Create Credentials" > "API key"
2. **COPY API Key**
3. Klik "Edit API key" (icon pensil)
4. Di "API restrictions", pilih "Restrict key"
5. Centang **"Google Drive API"**
6. Klik "Save"

### 5. Konfigurasi MindNote

1. Buka folder project MindNote
2. Copy file `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Edit `.env.local`:
   ```env
   VITE_GOOGLE_CLIENT_ID=paste_client_id_anda_disini
   VITE_GOOGLE_API_KEY=paste_api_key_anda_disini
   ```

4. Save file

### 6. Jalankan MindNote

```bash
# Install dependencies (jika belum)
pnpm install

# Jalankan development server
pnpm dev
```

### 7. Test Backup & Restore

1. Buka http://localhost:5173
2. Buat beberapa notes
3. Klik icon Settings (⚙️)
4. Scroll ke "Google Drive Sync"
5. Klik **"Sign in with Google"**
6. Login dengan akun Google yang sudah ditambahkan sebagai test user
7. Klik **"Backup to Drive"**
8. Check Google Drive Anda, akan ada file `mindnote_backup.json`

✅ Selesai! Notes Anda sudah tersimpan di Google Drive.

## Cara Restore Notes

1. Klik Settings > Google Drive Sync
2. Pastikan sudah sign in
3. Klik **"Restore from Drive"**
4. Konfirmasi (akan replace notes yang ada)
5. Notes akan di-restore dari Google Drive

## Tips

- 💡 **Sign in sekali saja**: Token tersimpan di localStorage
- 🔄 **Backup berkala**: Klik "Backup to Drive" setelah menulis banyak notes
- 🔐 **Aman**: Hanya MindNote yang bisa akses file backup
- 📱 **Multi-device**: Install di device lain, sign in, lalu restore

## Troubleshooting

### "Access Blocked" saat Sign In
**Solusi**: Pastikan email Anda sudah ditambahkan di "Test users" di OAuth consent screen.

### "Invalid Client"
**Solusi**: 
- Check Client ID sudah benar di `.env.local`
- Pastikan `http://localhost:5173` ada di Authorized JavaScript origins

### Popup Blocked
**Solusi**: Allow popups untuk localhost di browser settings.

### "No backup found"
**Solusi**: Klik "Backup to Drive" dulu sebelum restore.

## Production Deployment

Jika ingin deploy ke production:

1. Tambahkan domain production ke Authorized JavaScript origins:
   ```
   https://yourdomain.com
   ```

2. Update OAuth consent screen ke "In Production" (butuh verifikasi Google)

3. Update `.env.local` atau set environment variables di hosting platform

## Keamanan

- ✅ OAuth 2.0 (tidak ada password disimpan)
- ✅ Limited scope (`drive.file` - hanya file yang dibuat app)
- ✅ Token di localStorage (tetap aman di client-side)
- ✅ Tidak ada server backend (pure client-side)

## Support

Jika ada masalah:
1. Check browser console (F12) untuk error
2. Review Google Cloud Console > APIs & Services > Credentials
3. Pastikan test user sudah ditambahkan
4. Coba sign out dan sign in lagi

---

**Happy Note-Taking! 📝**
