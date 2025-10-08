# 🎯 STEP-BY-STEP: Fix Google Login di Production

## Problem: Login tidak bisa di https://notes.dwx.my.id/

---

## 🔧 SOLUSI LENGKAP (Ikuti Urutan!)

### ⚡ STEP 1: Buka Google Cloud Console

**Link**: https://console.cloud.google.com/apis/credentials

1. Login dengan akun Google Anda
2. Pilih project yang benar (biasanya "MindNote" atau nama yang Anda buat)

---

### 📝 STEP 2: Cari Client ID Anda

Di halaman "Credentials", cari:

```
OAuth 2.0 Client IDs
├── Name: Web client 1 (or similar)
└── Client ID: 566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
```

**Klik pada Client ID tersebut** (row yang ada Client ID-nya)

---

### ✏️ STEP 3: Edit Authorized JavaScript Origins

Setelah klik, Anda akan melihat halaman "Edit OAuth client ID":

#### Scroll ke bagian "Authorized JavaScript origins"

**Saat ini mungkin hanya ada:**
```
┌─────────────────────────────────────┐
│ Authorized JavaScript origins       │
├─────────────────────────────────────┤
│ http://localhost:5173               │ ← Development only
└─────────────────────────────────────┘
```

#### Klik tombol "+ ADD URI"

**Tambahkan production domain:**
```
┌─────────────────────────────────────┐
│ URIs 1                              │
│ http://localhost:5173               │
├─────────────────────────────────────┤
│ URIs 2                              │
│ https://notes.dwx.my.id        ← ADD THIS!
└─────────────────────────────────────┘
```

⚠️ **PENTING - Copy exact ini:**
```
https://notes.dwx.my.id
```

**Rules:**
- ✅ HARUS pakai `https://` (bukan http)
- ✅ TIDAK ada trailing slash `/` di akhir
- ✅ Exact match dengan domain production Anda

---

### 💾 STEP 4: Save Changes

1. Scroll ke bawah halaman
2. Klik tombol **"SAVE"** (biru, di bawah)
3. Tunggu konfirmasi "Saved successfully"

---

### ⏱️ STEP 5: Tunggu Propagasi (PENTING!)

Google Cloud membutuhkan waktu untuk propagasi:

```
Save → Wait 2-5 minutes → Changes active
```

**Jangan langsung test!** Tunggu dulu 2-5 menit.

---

### 🧹 STEP 6: Clear Browser Cache

**Option 1: Hard Refresh**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Option 2: Incognito Mode (Recommended)**
- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`

**Option 3: Clear Cache Completely**
- Chrome: Settings → Privacy → Clear browsing data
- Pilih "Cached images and files"
- Click "Clear data"

---

### 🧪 STEP 7: Test Login

1. Buka **Incognito window**
2. Go to: **https://notes.dwx.my.id/**
3. Click hamburger menu (☰)
4. Click **Settings** (⚙️)
5. Scroll ke **"Google Drive Sync"**
6. Click **"Sign in with Google"**

**Expected Result:**
```
✅ Popup window muncul
✅ Bisa pilih akun Google
✅ Click "Allow"
✅ Popup tutup
✅ Email Anda muncul di UI
✅ Status: "✓ Connected to Google Drive"
```

---

## 🎊 SUCCESS!

Jika berhasil, Anda akan lihat:

```
┌────────────────────────────────────┐
│ Google Drive Sync                  │
├────────────────────────────────────┤
│ 👤 your-email@gmail.com            │
│    ✓ Connected to Google Drive     │
│                      [🚪 Logout]   │
├────────────────────────────────────┤
│ [⬆️ Backup to Drive] [⬇️ Restore]  │
└────────────────────────────────────┘
```

Sekarang Anda bisa:
- ✅ Backup notes ke Google Drive
- ✅ Restore notes dari Google Drive
- ✅ Login persisten (tidak perlu login ulang setelah refresh)

---

## 🔴 Troubleshooting

### Problem 1: "Access blocked: This app's request is invalid"

**Cause**: Domain belum ditambahkan atau belum propagasi

**Solution**:
1. Double-check domain di Google Console: `https://notes.dwx.my.id`
2. Tunggu 5-10 menit lagi
3. Clear cache dan coba lagi

---

### Problem 2: "Error 400: redirect_uri_mismatch"

**Cause**: Typo di domain atau format salah

**Solution**:
1. Check exact spelling: `notes.dwx.my.id`
2. Must use `https://` (not `http://`)
3. No trailing slash: ❌ `https://notes.dwx.my.id/`
4. Correct: ✅ `https://notes.dwx.my.id`

---

### Problem 3: Popup tidak muncul sama sekali

**Cause**: Popup blocked by browser atau environment variable missing

**Solution**:
1. Check if popups allowed for `notes.dwx.my.id`
2. Look for popup blocked icon in address bar
3. Check browser console (F12) for errors
4. Verify environment variable di hosting platform

---

### Problem 4: "Client ID not found"

**Cause**: Environment variable tidak di-set di hosting

**Solution**:

#### If using Vercel:
1. Go to project → Settings → Environment Variables
2. Add new variable:
   ```
   Name:  VITE_GOOGLE_CLIENT_ID
   Value: 566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
   ```
3. **REDEPLOY** project (important!)

#### If using Netlify:
1. Site settings → Environment variables
2. Add new variable:
   ```
   Key:   VITE_GOOGLE_CLIENT_ID
   Value: 566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
   ```
3. **REDEPLOY** site (important!)

---

## 📋 Final Checklist

**Google Cloud Console:**
- [ ] ✅ Opened https://console.cloud.google.com/apis/credentials
- [ ] ✅ Found Client ID: `566966287537-...`
- [ ] ✅ Clicked edit
- [ ] ✅ Added: `https://notes.dwx.my.id`
- [ ] ✅ Clicked SAVE
- [ ] ✅ Waited 2-5 minutes

**Testing:**
- [ ] ✅ Cleared cache / Used Incognito
- [ ] ✅ Opened https://notes.dwx.my.id/
- [ ] ✅ Tried sign in
- [ ] ✅ Login successful!

**Bonus (if using hosting):**
- [ ] ✅ Environment variable set
- [ ] ✅ Redeployed site

---

## 🎯 Summary

**What was wrong:**
- Google OAuth tidak mengizinkan login dari domain yang tidak terdaftar
- `https://notes.dwx.my.id` belum ditambahkan ke authorized origins

**What we fixed:**
- ✅ Added `https://notes.dwx.my.id` to authorized origins
- ✅ Saved changes
- ✅ Waited for propagation
- ✅ Tested and it works!

**Time taken:**
- Setup: 2 minutes
- Waiting: 2-5 minutes
- Total: ~5-10 minutes

---

## 🚀 Next Steps

Now that login works:

1. **Test Backup:**
   - Create some notes
   - Click "Backup to Drive"
   - Check Google Drive for `mindnote_backup.json`

2. **Test Restore:**
   - Delete a note
   - Click "Restore from Drive"
   - Note should come back!

3. **Test Persistent Login:**
   - Close browser
   - Open again
   - Go to https://notes.dwx.my.id/
   - Should still be logged in!

---

## 💡 Pro Tips

**For Multiple Environments:**

If you have staging/preview domains, add them all:

```
Authorized JavaScript origins:
├── http://localhost:5173              (dev)
├── https://notes.dwx.my.id            (production)
├── https://staging.notes.dwx.my.id    (staging)
└── https://preview.notes.dwx.my.id    (preview)
```

**For Different Domains:**

If you plan to use different domains (e.g., `notes.example.com`), add each one to authorized origins.

---

**Status**: Production login should work now! 🎉

**Need help?** Check browser console (F12) for error messages.
