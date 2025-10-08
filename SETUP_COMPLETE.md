# ✅ Konfigurasi Google Drive - SUDAH SETUP

## Credentials yang Digunakan

✅ **Client ID**: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`

✅ **Status**: Credentials sudah dikonfigurasi di `.env.local`

## ⚠️ Langkah Penting: Verifikasi di Google Cloud Console

Sebelum menggunakan, pastikan konfigurasi berikut sudah benar di [Google Cloud Console](https://console.cloud.google.com/):

### 1. Authorized JavaScript Origins

Buka: **APIs & Services** > **Credentials** > Klik Client ID Anda

Pastikan sudah ada:
- ✅ `http://localhost:5173` (Vite dev server)
- ✅ `http://localhost:4173` (Vite preview)

Jika belum, tambahkan dengan klik "ADD URI" di bagian **Authorized JavaScript origins**.

### 2. Authorized Redirect URIs (TIDAK DIPERLUKAN untuk OAuth Token Client)

Untuk aplikasi client-side dengan Google Identity Services (yang kita gunakan), redirect URIs **tidak diperlukan**. Yang penting hanya JavaScript origins.

### 3. OAuth Consent Screen

Pastikan sudah dikonfigurasi:
- ✅ App name: MindNote (atau nama lain)
- ✅ User type: **External**
- ✅ Scope: `https://www.googleapis.com/auth/drive.file`
- ✅ Test users: Email Google Anda sudah ditambahkan

**PENTING**: Jika status masih "Testing", Anda harus menambahkan email sebagai **Test Users**!

## 🚀 Cara Test

```bash
# 1. Install dependencies (jika belum)
pnpm install

# 2. Jalankan dev server
pnpm dev

# 3. Buka browser
# http://localhost:5173
```

### Langkah Testing:

1. Buat beberapa notes di MindNote
2. Klik icon **Settings** (⚙️) di sidebar
3. Scroll ke bagian **"Google Drive Sync"**
4. Klik **"Sign in with Google"**
5. Login dengan akun Google yang sudah ditambahkan sebagai test user
6. Klik **"Backup to Drive"**
7. Check Google Drive Anda → Akan ada file `mindnote_backup.json`

## 🔧 Troubleshooting

### Error: "Access blocked: This app's request is invalid"

**Penyebab**: JavaScript origin tidak terdaftar atau salah

**Solusi**:
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Anda
3. Buka **APIs & Services** > **Credentials**
4. Klik Client ID Anda
5. Tambahkan `http://localhost:5173` di **Authorized JavaScript origins**
6. Klik **Save**
7. Tunggu 5-10 menit untuk propagasi (kadang instant)
8. Refresh browser dan coba lagi

### Error: "Access blocked: Authorization Error"

**Penyebab**: Email Anda belum ditambahkan sebagai test user

**Solusi**:
1. Buka **APIs & Services** > **OAuth consent screen**
2. Scroll ke **Test users**
3. Klik **ADD USERS**
4. Masukkan email Google Anda
5. Klik **Save**
6. Coba sign in lagi

### Error: "Failed to initialize Google Drive"

**Penyebab**: Client ID salah atau environment variable tidak terbaca

**Solusi**:
1. Pastikan file `.env.local` ada di root project
2. Pastikan format: `VITE_GOOGLE_CLIENT_ID=566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`
3. Restart dev server (`pnpm dev`)
4. Hard refresh browser (Ctrl+Shift+R atau Cmd+Shift+R)

### Popup Blocked

**Solusi**: Allow popups untuk localhost:5173 di browser settings

## 📝 Catatan Keamanan

- ✅ `.env.local` sudah di-ignore oleh Git (tidak akan ter-commit)
- ✅ Client Secret tidak digunakan untuk client-side OAuth flow
- ✅ Token disimpan di localStorage browser (aman untuk SPA)
- ✅ Scope terbatas: hanya file yang dibuat app (`drive.file`)

## 🎯 Next Steps Setelah Testing Berhasil

1. **Backup secara berkala**: Klik "Backup to Drive" setelah menulis banyak notes
2. **Test restore**: Hapus beberapa notes, lalu klik "Restore from Drive"
3. **Multi-device**: Install di device lain, sign in, restore notes
4. **Production**: Tambahkan domain production ke authorized origins

## 📱 Untuk Deploy Production

Ketika deploy ke hosting (Vercel, Netlify, etc):

1. Tambahkan production URL ke Google Cloud Console:
   ```
   https://yourdomain.com
   ```

2. Set environment variable di hosting platform:
   ```
   VITE_GOOGLE_CLIENT_ID=566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
   ```

3. Update OAuth consent screen ke "In Production" (butuh verifikasi Google)

---

**Status**: ✅ Ready to test!

**Support**: Jika ada error, check browser console (F12) untuk detail error message.
