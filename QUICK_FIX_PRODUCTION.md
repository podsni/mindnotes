# ⚡ QUICK FIX: Login Tidak Bisa di Production

## 🔴 Problem
Login Google Drive tidak bisa di **https://notes.dwx.my.id/**

## ✅ Solution (5 Menit)

### Step 1: Buka Google Cloud Console
🔗 https://console.cloud.google.com/apis/credentials

### Step 2: Edit OAuth Client ID
1. Find: `566966287537-cia93usthaok35vcn11c0ecjo24u1tas...`
2. Click untuk edit

### Step 3: Tambahkan Domain Production
Di **"Authorized JavaScript origins"**, tambahkan:

```
https://notes.dwx.my.id
```

⚠️ **PENTING:**
- Pakai `https://` (bukan `http://`)
- Tanpa trailing slash `/`
- Exact match: `https://notes.dwx.my.id`

### Step 4: Save & Wait
1. Click **SAVE**
2. **Tunggu 2-5 menit** (untuk propagasi)
3. Clear browser cache atau buka **Incognito mode**

### Step 5: Test
1. Buka: https://notes.dwx.my.id/
2. Settings → Google Drive Sync
3. Click "Sign in with Google"
4. ✅ **Should work now!**

---

## 📸 Visual Guide

### Before (Error):
```
Authorized JavaScript origins:
├── http://localhost:5173  ✅
└── (production missing)   ❌ ← Error!
```

### After (Fixed):
```
Authorized JavaScript origins:
├── http://localhost:5173      ✅
└── https://notes.dwx.my.id    ✅ ← Add this!
```

---

## 🔍 Quick Debug

Open browser console (F12) di https://notes.dwx.my.id/:

**If you see this error:**
```
Error: origin_mismatch
The redirect URI does not match...
```
**→ Domain belum ditambahkan, follow steps above!**

**If you see this:**
```
Google Drive Config: {
  clientId: "566966287537-..."
}
```
**→ Config loaded correctly!**

---

## ✅ After Fix Checklist

- [ ] Added `https://notes.dwx.my.id` to authorized origins
- [ ] Clicked SAVE in Google Console
- [ ] Waited 2-5 minutes
- [ ] Cleared browser cache / Used Incognito
- [ ] Tested login at https://notes.dwx.my.id/
- [ ] ✅ Login works!

---

## 🆘 Still Not Working?

### 1. Wait Longer
Google Cloud changes dapat memakan waktu hingga 10 menit.

### 2. Clear Cache Completely
- Chrome: `Ctrl + Shift + Delete` → Clear all
- Or: Try different browser

### 3. Check Environment Variable
Di hosting platform (Vercel/Netlify/etc):
```
VITE_GOOGLE_CLIENT_ID = 566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
```
**Don't forget to REDEPLOY after adding!**

---

## 📞 Need More Help?

Read full guide: `PRODUCTION_LOGIN_FIX.md`

---

**Time to Fix**: 5 minutes + 2-5 minutes waiting

**Status**: Once fixed, login will work permanently! 🚀
