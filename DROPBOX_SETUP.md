# 🔵 Dropbox Sync Setup Guide

## Setup Dropbox App

### Step 1: Buat Dropbox App

1. Buka **Dropbox App Console**: https://www.dropbox.com/developers/apps
2. Click **Create app**
3. Pilih:
   - **Choose an API**: Scoped access
   - **Choose the type of access**: App folder (recommended) atau Full Dropbox
   - **Name your app**: `MindNote` (atau nama lain yang Anda suka)
4. Click **Create app**

---

### Step 2: Configure OAuth Settings

Di halaman app settings:

#### **OAuth 2** section:

**Redirect URIs** - Tambahkan:
```
http://localhost:5173/dropbox-callback
https://notes.dwx.my.id/dropbox-callback
```

⚠️ **PENTING**: 
- Sesuaikan domain production dengan domain Anda
- Harus include `/dropbox-callback` di akhir
- Tambahkan semua domain yang akan digunakan (dev, staging, production)

---

### Step 3: Set Permissions

Scroll ke **Permissions** tab:

Aktifkan permissions berikut:
- ✅ `files.metadata.write` - Write file metadata
- ✅ `files.metadata.read` - Read file metadata  
- ✅ `files.content.write` - Write files
- ✅ `files.content.read` - Read files

Click **Submit** untuk save permissions.

---

### Step 4: Copy App Key

Di **Settings** tab, copy **App key** Anda:

```
Example: ab12cd34ef56gh78
```

---

## Configure MindNote

### Step 1: Create Environment File

Buat file `.env.local` di root project:

```bash
# .env.local
VITE_DROPBOX_APP_KEY=ab12cd34ef56gh78
```

⚠️ Replace `ab12cd34ef56gh78` dengan App Key Anda yang sebenarnya!

---

### Step 2: Add to .gitignore

Pastikan `.env.local` sudah ada di `.gitignore`:

```bash
# .gitignore
.env.local
```

---

## Testing (Development)

### Step 1: Start Development Server

```bash
pnpm dev
```

### Step 2: Test Dropbox Sync

1. Buka http://localhost:5173
2. Click hamburger menu (☰)
3. Click **Settings** (⚙️)
4. Scroll ke **Dropbox Sync**
5. Click **Sign in with Dropbox**
6. Popup window akan muncul
7. Login dengan akun Dropbox Anda
8. Click **Allow** untuk authorize
9. Popup akan otomatis tertutup
10. Email Anda akan muncul di UI

### Step 3: Test Backup

1. Buat beberapa notes
2. Click **Backup to Dropbox**
3. Check Dropbox app folder: `Apps/MindNote/mindnote_backup.json`

### Step 4: Test Restore

1. Delete local note
2. Click **Restore from Dropbox**
3. Note akan kembali!

### Step 5: Test Persistent Login

1. Refresh browser
2. Masih login tanpa perlu login ulang ✓

---

## Production Deployment

### Step 1: Set Environment Variable

Konfigurasi di hosting platform Anda:

#### **Vercel:**
```
Settings → Environment Variables
Name:  VITE_DROPBOX_APP_KEY
Value: ab12cd34ef56gh78
```

#### **Netlify:**
```
Site settings → Environment variables
Key:   VITE_DROPBOX_APP_KEY
Value: ab12cd34ef56gh78
```

### Step 2: Add Production Redirect URI

Di Dropbox App Console → OAuth 2 → Redirect URIs:

```
https://notes.dwx.my.id/dropbox-callback
```

⚠️ Sesuaikan dengan domain production Anda!

### Step 3: Deploy

```bash
pnpm build
# Deploy dist/ folder ke hosting
```

### Step 4: Test Production

1. Buka production URL
2. Settings → Dropbox Sync
3. Sign in with Dropbox
4. Test backup & restore

---

## File Structure

```
mindnotexx/
├── .env.local                        # Environment variables (git-ignored)
├── public/
│   └── dropbox-callback.html        # OAuth callback page
└── src/
    └── lib/
        ├── dropbox.ts               # Dropbox API service
        ├── DropboxSync.svelte       # Dropbox UI component
        └── Settings.svelte          # Settings panel (updated)
```

---

## Features

✅ **OAuth 2.0 Authentication**
- Secure token-based authentication
- CSRF protection with state parameter
- Token stored in localStorage

✅ **Backup to Dropbox**
- Saves all notes as JSON to `mindnote_backup.json`
- Includes timestamps and version info
- Auto-overwrites existing backup

✅ **Restore from Dropbox**
- Downloads backup file
- Replaces all local notes
- Preserves original timestamps

✅ **Persistent Login**
- Token survives browser refresh
- Auto-reconnect on app load
- No need to login repeatedly

✅ **Clear Logout**
- Revokes access token
- Clears local storage
- Confirmation dialog

✅ **User Status Display**
- Shows user email
- Connection status indicator
- Last backup timestamp

✅ **Error Handling**
- Network error detection
- Invalid token handling
- User-friendly error messages

---

## Security Notes

### Token Storage
- Access token disimpan di localStorage
- Token tidak expire (long-lived)
- Revoke token saat logout

### Permissions
- App folder mode: Hanya akses folder `Apps/MindNote/`
- Full Dropbox mode: Akses semua file (tidak recommended)

### Best Practices
- ✅ Jangan commit `.env.local` ke git
- ✅ Gunakan App folder mode
- ✅ Minimal permissions yang dibutuhkan
- ✅ HTTPS untuk production

---

## Troubleshooting

### Problem 1: "Dropbox App Key tidak dikonfigurasi"

**Solution:**
1. Check `.env.local` exists
2. Verify `VITE_DROPBOX_APP_KEY=...` ada
3. Restart dev server: `pnpm dev`

---

### Problem 2: "redirect_uri_mismatch"

**Solution:**
1. Check Dropbox App Console → OAuth 2 → Redirect URIs
2. Must include: `http://localhost:5173/dropbox-callback`
3. Exact match (case-sensitive, no trailing slash)

---

### Problem 3: Popup blocked

**Solution:**
1. Allow popups for `localhost:5173`
2. Check browser address bar for popup icon
3. Click and select "Always allow"

---

### Problem 4: "No backup found"

**Cause:** Belum pernah backup

**Solution:**
1. Click "Backup to Dropbox" dulu
2. Baru bisa restore

---

### Problem 5: Token tidak persist

**Solution:**
1. Check browser localStorage
2. Key: `mindnote_dropbox_auth`
3. If missing, login ulang

---

## API Reference

### `dropboxService`

```typescript
// Sign in
dropboxService.signIn()

// Reconnect with stored token
await dropboxService.reconnect()

// Sign out
await dropboxService.signOut()

// Backup notes
await dropboxService.backupToDropbox(notes)

// Restore notes
const notes = await dropboxService.restoreFromDropbox()

// Check backup exists
const exists = await dropboxService.hasBackupFile()

// Get backup metadata
const metadata = await dropboxService.getBackupMetadata()

// Check status
dropboxService.isSignedIn  // boolean
dropboxService.userEmail   // string | null
dropboxService.hasAppKey   // boolean
```

---

## Backup File Format

```json
{
  "notes": [
    {
      "id": "uuid",
      "title": "Note Title",
      "content": "Note content...",
      "createdAt": "2025-10-08T10:30:00.000Z",
      "updatedAt": "2025-10-08T11:45:00.000Z",
      "pinned": false
    }
  ],
  "timestamp": "2025-10-08T12:00:00.000Z",
  "version": "1.0"
}
```

---

## Comparison: Dropbox vs Google Drive

| Feature | Dropbox | Google Drive |
|---------|---------|--------------|
| Setup Complexity | Easy | Medium |
| OAuth Flow | Popup | Popup |
| Token Type | Long-lived | Expires (needs refresh) |
| Storage Location | App folder or Full | App data folder |
| API Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| File Visibility | Visible in Dropbox | Hidden in Drive |
| Free Storage | 2 GB | 15 GB |

---

## Next Steps

Setelah setup berhasil:

1. ✅ Test backup/restore dengan real notes
2. ✅ Test persistent login (refresh browser)
3. ✅ Test logout dan login ulang
4. ✅ Deploy ke production
5. ✅ Test di production domain

---

**Status**: Dropbox integration complete! 🎉

**Files created:**
- ✅ `src/lib/dropbox.ts` - Dropbox API service
- ✅ `src/lib/DropboxSync.svelte` - UI component
- ✅ `public/dropbox-callback.html` - OAuth callback page
- ✅ `.env.local` - Environment variables
- ✅ `DROPBOX_SETUP.md` - This guide

**Need help?** Check Dropbox API docs: https://www.dropbox.com/developers/documentation
