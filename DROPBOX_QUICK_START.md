# 🚀 Quick Start: Dropbox Sync

## Setup Cepat (5 Menit)

### 1️⃣ Buat Dropbox App

1. Buka: https://www.dropbox.com/developers/apps
2. Click **Create app**
3. Pilih:
   - API: **Scoped access**
   - Access: **App folder** (recommended)
   - Name: **MindNote**
4. Click **Create app**

---

### 2️⃣ Konfigurasi OAuth

Di halaman app settings:

**OAuth 2 → Redirect URIs**, tambahkan:
```
http://localhost:5173/dropbox-callback
https://notes.dwx.my.id/dropbox-callback
```

Click **Add** untuk masing-masing.

---

### 3️⃣ Set Permissions

Click tab **Permissions**:

Centang:
- ✅ `files.metadata.write`
- ✅ `files.metadata.read`
- ✅ `files.content.write`
- ✅ `files.content.read`

Click **Submit**.

---

### 4️⃣ Copy App Key

Di tab **Settings**, copy **App key** Anda.

Contoh: `ab12cd34ef56gh78`

---

### 5️⃣ Update .env.local

Edit file `.env.local`:

```bash
# Tambahkan ini di bawah Google Client ID
VITE_DROPBOX_APP_KEY=ab12cd34ef56gh78
```

⚠️ Replace dengan App Key Anda!

---

### 6️⃣ Restart Dev Server

```bash
# Stop server (Ctrl+C)
pnpm dev
```

---

### 7️⃣ Test!

1. Buka http://localhost:5173
2. Menu (☰) → Settings (⚙️)
3. Scroll ke **Dropbox Sync**
4. Click **Sign in with Dropbox**
5. Login & Allow
6. Done! ✅

---

## Cara Pakai

### Backup Notes
1. Buat beberapa notes
2. Settings → Dropbox Sync
3. Click **Backup to Dropbox**
4. ✓ Berhasil!

Check di Dropbox: `Apps/MindNote/mindnote_backup.json`

### Restore Notes
1. Settings → Dropbox Sync
2. Click **Restore from Dropbox**
3. Confirm
4. ✓ Notes kembali!

### Logout
1. Click **Logout** button
2. Confirm
3. ✓ Signed out

---

## Production Setup

### Di Dropbox App Console:
Tambahkan production redirect URI:
```
https://notes.dwx.my.id/dropbox-callback
```

### Di Hosting Platform:

**Vercel:**
```
Environment Variables
VITE_DROPBOX_APP_KEY = your_app_key
```

**Netlify:**
```
Environment variables
VITE_DROPBOX_APP_KEY = your_app_key
```

Deploy ulang, done! 🎉

---

## Troubleshooting Cepat

### "Dropbox App Key tidak dikonfigurasi"
- Check `.env.local` ada `VITE_DROPBOX_APP_KEY`
- Restart: `pnpm dev`

### "redirect_uri_mismatch"
- Tambahkan redirect URI di Dropbox Console
- Must exact: `http://localhost:5173/dropbox-callback`

### Popup blocked
- Allow popups di browser
- Click popup icon di address bar

---

## Checklist Setup

- [ ] ✅ Buat Dropbox app
- [ ] ✅ Set redirect URIs
- [ ] ✅ Set permissions
- [ ] ✅ Copy App Key
- [ ] ✅ Update `.env.local`
- [ ] ✅ Restart server
- [ ] ✅ Test login
- [ ] ✅ Test backup
- [ ] ✅ Test restore

---

**Total waktu**: ~5 menit

**Lihat detail lengkap**: Baca `DROPBOX_SETUP.md`

**Need help?** https://www.dropbox.com/developers/documentation
