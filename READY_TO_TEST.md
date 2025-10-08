# 🎉 Google Drive Sync - SIAP DIGUNAKAN!

## ✅ Status: CONFIGURED & READY

Client ID Anda sudah dikonfigurasi dan aplikasi siap untuk testing!

---

## 🚀 QUICK START (30 Detik)

### 1. Pastikan Server Berjalan

Server development sudah running di: **http://localhost:5173**

Jika belum, jalankan:
```bash
pnpm dev
```

### 2. Konfigurasi di Google Cloud Console

**PENTING**: Sebelum bisa sign in, Anda HARUS menambahkan authorized origins:

1. Buka: https://console.cloud.google.com/apis/credentials
2. Pilih project Anda
3. Klik pada Client ID: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas...`
4. Di bagian **"Authorized JavaScript origins"**, klik **"ADD URI"**
5. Tambahkan: `http://localhost:5173`
6. Klik **"SAVE"**
7. Tunggu 1-2 menit untuk propagasi

### 3. Tambahkan Email sebagai Test User

**WAJIB jika OAuth consent screen dalam mode "Testing"**:

1. Buka: https://console.cloud.google.com/apis/credentials/consent
2. Scroll ke bagian **"Test users"**
3. Klik **"ADD USERS"**
4. Masukkan email Google Anda
5. Klik **"SAVE"**

### 4. Test di Browser

1. Buka: **http://localhost:5173**
2. Buat beberapa notes (untuk testing)
3. Klik icon **Settings** (⚙️) di sidebar kiri
4. Scroll ke bagian **"Google Drive Sync"**
5. Klik **"Sign in with Google"**
6. Pilih akun Google Anda
7. Klik **"Allow"** untuk authorize
8. Klik **"Backup to Drive"**
9. ✅ Check Google Drive → File `mindnote_backup.json` akan muncul!

---

## 📋 Checklist Setup Google Cloud

Pastikan semua ini sudah di-check:

### OAuth Consent Screen
- [ ] App name: Sudah diisi (contoh: "MindNote")
- [ ] User type: **External**
- [ ] Scopes: `https://www.googleapis.com/auth/drive.file` sudah ditambahkan
- [ ] Test users: Email Anda sudah ditambahkan
- [ ] Status: **Testing** (atau **In production** jika sudah verifikasi)

### Credentials
- [x] OAuth 2.0 Client ID: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`
- [ ] Authorized JavaScript origins: `http://localhost:5173` ✅
- [ ] Authorized JavaScript origins: `http://localhost:4173` (optional, untuk preview)

### .env.local (Local Environment)
- [x] File `.env.local` sudah dibuat
- [x] `VITE_GOOGLE_CLIENT_ID` sudah diisi
- [x] File tidak akan ter-commit ke Git (sudah di .gitignore)

---

## 🎯 Cara Menggunakan

### Backup Notes ke Google Drive

1. **Sign in** (pertama kali)
   - Klik "Sign in with Google"
   - Authorize aplikasi

2. **Backup**
   - Klik "Backup to Drive"
   - File `mindnote_backup.json` akan tersimpan di Google Drive root folder
   - Status "Last backup" akan update

3. **Verifikasi**
   - Buka Google Drive Anda
   - Cari file `mindnote_backup.json`
   - Anda bisa download dan lihat isinya (format JSON)

### Restore Notes dari Google Drive

1. Pastikan sudah sign in
2. Klik **"Restore from Drive"**
3. Konfirmasi (akan replace notes yang ada)
4. Notes akan di-restore dari backup

**TIP**: Backup dulu sebelum restore untuk keamanan!

---

## 🔧 Troubleshooting

### 1. Error: "Access blocked: This app's request is invalid"

**Penyebab**: Authorized JavaScript origin belum ditambahkan

**Solusi**:
```
1. https://console.cloud.google.com/apis/credentials
2. Klik Client ID Anda
3. Tambahkan: http://localhost:5173 di "Authorized JavaScript origins"
4. SAVE
5. Tunggu 1-2 menit
6. Refresh browser (Ctrl+Shift+R)
```

### 2. Error: "Access blocked: Authorization Error"

**Penyebab**: Email belum ditambahkan sebagai test user

**Solusi**:
```
1. https://console.cloud.google.com/apis/credentials/consent
2. Test users → ADD USERS
3. Masukkan email Google Anda
4. SAVE
5. Coba sign in lagi
```

### 3. Button "Sign in with Google" Tidak Muncul

**Penyebab**: Scripts Google API belum load

**Solusi**:
- Check browser console (F12) untuk error
- Pastikan internet connection stabil
- Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)

### 4. Popup Blocked

**Penyebab**: Browser memblokir popup OAuth

**Solusi**:
- Allow popups untuk localhost:5173 di browser settings
- Atau klik icon popup blocked di address bar

### 5. "Failed to initialize Google Drive"

**Penyebab**: Environment variable tidak terbaca

**Solusi**:
```bash
# 1. Check file .env.local ada
ls -la .env.local

# 2. Restart dev server
pnpm dev

# 3. Hard refresh browser
```

### 6. "No backup found"

**Penyebab**: Belum pernah backup

**Solusi**:
- Klik "Backup to Drive" terlebih dahulu
- Tunggu sampai status "Last backup" update

---

## 🔍 Debug Mode

Buka browser console (F12) untuk melihat debug info:

```javascript
// Saat app load, akan muncul:
Google Drive Config: {
  clientId: "566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com",
  hasApiKey: false,
  scope: "https://www.googleapis.com/auth/drive.file"
}
```

Jika Client ID muncul dengan benar, berarti environment variable sudah terbaca!

---

## 📱 Testing Workflow

### Skenario 1: Backup Basic

1. ✅ Buat 3-5 notes dengan content berbeda
2. ✅ Sign in dengan Google
3. ✅ Klik "Backup to Drive"
4. ✅ Check Google Drive → File `mindnote_backup.json` ada
5. ✅ Last backup timestamp update

### Skenario 2: Restore

1. ✅ Hapus 1-2 notes di MindNote
2. ✅ Klik "Restore from Drive"
3. ✅ Konfirmasi
4. ✅ Notes yang dihapus kembali

### Skenario 3: Multi-device Sync

1. ✅ Backup di device 1
2. ✅ Buka MindNote di device 2 (atau browser lain)
3. ✅ Sign in dengan Google yang sama
4. ✅ Klik "Restore from Drive"
5. ✅ Notes muncul di device 2

---

## 🎨 UI Features

### Status Indicators

- **Last backup**: Timestamp backup terakhir
- **Last sync**: Timestamp restore terakhir
- **User email**: Email yang sedang sign in

### Success Messages

- ✅ "Successfully signed in to Google Drive!"
- ✅ "Successfully backed up X notes to Google Drive!"
- ✅ "Successfully restored X notes from Google Drive!"

### Error Messages

- ❌ "Failed to sign in. Please try again."
- ❌ "Backup failed. Please try again."
- ❌ "Restore failed. Please try again."
- ❌ "No backup found on Google Drive"

---

## 🔐 Security Notes

✅ **OAuth 2.0**: Secure authentication, no password stored
✅ **Limited Scope**: Only access files created by MindNote
✅ **Client-side Only**: No backend server, fully client-side
✅ **Token Storage**: Stored in browser localStorage
✅ **Credentials Safe**: `.env.local` not committed to Git

---

## 📊 API Usage

### Google Drive API Limits

- **Queries per day**: 1 billion (lebih dari cukup!)
- **Queries per 100 seconds per user**: 1,000
- **Cost**: FREE untuk personal use

### Estimasi Usage

- Backup 1x: ~3-4 API calls
- Restore 1x: ~2-3 API calls
- Jika backup 10x per hari: ~40 calls (masih jauh dari limit)

---

## 🚀 Next Steps

Setelah testing berhasil:

1. **Backup Rutin**: Biasakan backup setelah menulis banyak notes
2. **Multi-device**: Install di device lain dan sync
3. **Production**: Jika mau deploy:
   - Tambahkan domain production ke authorized origins
   - Set environment variable di hosting platform
   - Update OAuth consent screen ke "In Production"

---

## 📖 Documentation

- **Setup lengkap**: `GOOGLE_DRIVE_SETUP.md`
- **Quick start**: `QUICK_START_GDRIVE.md`
- **Project info**: `README.md`

---

## 💡 Tips

- 🔄 Backup sebelum restore untuk safety
- 📅 Backup berkala (misalnya setiap akhir hari)
- 🔍 Check Google Drive untuk verify backup
- 📱 Gunakan email yang sama di semua device untuk sync
- 🎯 Sign out jika ganti akun

---

## ✅ Checklist Pre-Testing

Sebelum test, pastikan:

- [x] Vite dev server running (`pnpm dev`)
- [ ] Google Cloud Console: Authorized origins ditambahkan
- [ ] Google Cloud Console: Test user ditambahkan
- [ ] Browser: Popups allowed untuk localhost
- [ ] Browser: JavaScript enabled
- [ ] Internet: Connection stable

---

**Status**: ✅ Ready to test!

**Next**: Buka http://localhost:5173 dan mulai testing!

**Support**: Check browser console (F12) jika ada error.

---

Selamat mencoba! 🎉
