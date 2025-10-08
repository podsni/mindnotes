# 🔧 FIX: Google Drive Login Tidak Bisa di Production

## ❌ Problem: Login Tidak Bisa di https://notes.dwx.my.id/

**Error yang mungkin muncul:**
- "Access blocked: This app's request is invalid"
- "Error 400: redirect_uri_mismatch"
- Popup tidak muncul / langsung tertutup
- "Origin not allowed"

## 🎯 ROOT CAUSE

**Google OAuth hanya mengizinkan login dari domain yang terdaftar!**

Saat ini Client ID hanya punya:
- ✅ `http://localhost:5173` (for development)
- ❌ `https://notes.dwx.my.id` (BELUM DITAMBAHKAN!)

---

## ✅ SOLUTION: Tambahkan Domain Production

### Step 1: Buka Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Login dengan akun Google yang sama waktu setup
3. Pilih project: **MindNote** (atau nama project Anda)

### Step 2: Edit OAuth Client ID

1. Cari Client ID: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`
2. Klik pada Client ID tersebut (icon pencil/edit)

### Step 3: Tambahkan Production Domain

Di bagian **"Authorized JavaScript origins"**:

**TAMBAHKAN:**
```
https://notes.dwx.my.id
```

⚠️ **PENTING:**
- ✅ Gunakan `https://` (bukan `http://`)
- ✅ Tanpa trailing slash (jangan `https://notes.dwx.my.id/`)
- ✅ Pastikan domain exact match

**Current List (setelah ditambah):**
```
http://localhost:5173         ← Development
http://localhost:4173         ← Preview (optional)
https://notes.dwx.my.id       ← Production (TAMBAHKAN INI!)
```

### Step 4: Save

1. Click **"SAVE"** button
2. Tunggu 1-5 menit untuk propagasi
3. **PENTING**: Clear browser cache atau buka Incognito mode

---

## 🌐 Environment Variables di Hosting

Pastikan environment variables di hosting platform (Vercel/Netlify/etc) sudah diset:

### Di Hosting Dashboard:

**Add Environment Variable:**
```
VITE_GOOGLE_CLIENT_ID=566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
```

### Contoh untuk Vercel:
1. Project Settings → Environment Variables
2. Add: `VITE_GOOGLE_CLIENT_ID`
3. Value: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`
4. **IMPORTANT**: Redeploy after adding!

### Contoh untuk Netlify:
1. Site Settings → Environment Variables
2. Add: `VITE_GOOGLE_CLIENT_ID`
3. Value: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`
4. **IMPORTANT**: Redeploy after adding!

---

## 🧪 Testing Setelah Fix

### Step 1: Clear Cache
```
Hard Refresh:
- Chrome: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
- Or: Open Incognito/Private window
```

### Step 2: Test Login
1. Buka: https://notes.dwx.my.id/
2. Settings → Google Drive Sync
3. Click "Sign in with Google"
4. ✅ Popup harus muncul
5. ✅ Login berhasil
6. ✅ Email ditampilkan

### Step 3: Test Backup
1. Buat beberapa notes
2. Click "Backup to Drive"
3. ✅ Success message
4. Check Google Drive → File `mindnote_backup.json` muncul

---

## 🔍 Debugging

### Check Browser Console (F12)

**Good (Working):**
```javascript
Google Drive Config: {
  clientId: "566966287537-cia93usthaok35vcn11c0ecjo24u1tas...",
  hasApiKey: false,
  scope: "https://www.googleapis.com/auth/drive.file"
}
```

**Error Examples:**

#### Error 1: "Origin not allowed"
```
Error: origin_mismatch
The redirect URI in the request: https://notes.dwx.my.id does not match...
```
**Fix**: Tambahkan `https://notes.dwx.my.id` ke Authorized origins

#### Error 2: "Client ID not found"
```
Error: idpiframe_initialization_failed
```
**Fix**: 
- Check environment variable di hosting
- Redeploy setelah add environment variable

#### Error 3: Scripts not loading
```
Failed to load https://accounts.google.com/gsi/client
```
**Fix**:
- Check internet connection
- Check Content Security Policy (CSP)
- Check if Google APIs are blocked

---

## 📋 Complete Checklist

### Google Cloud Console:
- [ ] Login ke https://console.cloud.google.com/apis/credentials
- [ ] Find Client ID: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas...`
- [ ] Add origin: `https://notes.dwx.my.id`
- [ ] Click **SAVE**
- [ ] Wait 1-5 minutes

### Hosting Platform (Vercel/Netlify/etc):
- [ ] Add environment variable: `VITE_GOOGLE_CLIENT_ID`
- [ ] Value: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com`
- [ ] **Redeploy** site
- [ ] Wait for deployment complete

### Testing:
- [ ] Open https://notes.dwx.my.id/ in Incognito
- [ ] Try sign in with Google
- [ ] Should work! ✅

---

## 🎯 Quick Fix Summary

**Problem**: Login tidak bisa di production
**Cause**: Domain production belum ditambahkan ke Google OAuth
**Solution**: 
1. Add `https://notes.dwx.my.id` ke Authorized JavaScript origins
2. Save di Google Console
3. Tunggu 1-5 menit
4. Clear cache & test

**Time needed**: 5 minutes

---

## 🚀 Additional: Multiple Domains

Jika punya multiple domains (staging, production, etc):

```
Authorized JavaScript origins:
├── http://localhost:5173           (development)
├── https://notes.dwx.my.id         (production)
├── https://staging.notes.dwx.my.id (staging - optional)
└── https://preview.notes.dwx.my.id (preview - optional)
```

Semua domain yang akan digunakan harus ditambahkan!

---

## 📱 Mobile Testing

OAuth popup works on mobile browsers too, no special config needed!

Test on:
- ✅ Mobile Chrome
- ✅ Mobile Safari
- ✅ Mobile Firefox

---

## 🔐 Security Notes

### HTTPS Required for Production
- ✅ OAuth requires HTTPS in production
- ✅ `https://notes.dwx.my.id` ← Good
- ❌ `http://notes.dwx.my.id` ← Won't work

### Localhost Exception
- `http://localhost:*` allowed (development only)
- No HTTPS required for localhost

---

## 🆘 Still Not Working?

### 1. Check Propagation Time
- Wait 5-10 minutes after saving
- Google Cloud changes take time to propagate

### 2. Clear Everything
```bash
# Clear browser cache completely
- Chrome: Settings → Privacy → Clear browsing data
- Or: Use Incognito mode
```

### 3. Check Network Tab
- F12 → Network tab
- Look for `token` or `oauth` requests
- Check response for error messages

### 4. Verify Environment Variable
In browser console:
```javascript
// Check if Client ID is loaded
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
// Should show: "566966287537-cia93usthaok35vcn11c0ecjo24u1tas..."
```

### 5. Check OAuth Consent Screen
- Status harus "In Production" or "Testing"
- Jika "Testing", add email sebagai Test User

---

## ✅ Expected Result After Fix

```
✅ Login popup muncul
✅ Bisa pilih akun Google
✅ Authorize berhasil
✅ Email ditampilkan
✅ "✓ Connected to Google Drive"
✅ Bisa backup notes
✅ Bisa restore notes
✅ Persistent login works (no re-login after refresh)
```

---

## 📞 Support

Jika masih ada masalah:

1. **Check console logs** (F12)
2. **Screenshot error message**
3. **Verify authorized origins** di Google Console
4. **Check environment variables** di hosting

---

**Status**: Production ready setelah add authorized origin! 🚀

**Next**: Add `https://notes.dwx.my.id` ke Google Cloud Console → Wait 5 min → Test! ✅
