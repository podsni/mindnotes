# ⚡ Quick Reference - Google Drive Sync

## 🔑 Your Credentials

```
Client ID: 566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
Status: ✅ Configured in .env.local
```

## 🎯 BEFORE Testing - DO THIS FIRST!

### 1. Add Authorized Origin (MANDATORY)

🔗 https://console.cloud.google.com/apis/credentials

1. Click your Client ID
2. "Authorized JavaScript origins" → **ADD URI**
3. Add: `http://localhost:5173`
4. Click **SAVE**

### 2. Add Test User (MANDATORY if in Testing mode)

🔗 https://console.cloud.google.com/apis/credentials/consent

1. Scroll to "Test users"
2. Click **ADD USERS**
3. Add your Google email
4. Click **SAVE**

## 🚀 Testing Steps

```
1. Open: http://localhost:5173
2. Settings → Google Drive Sync
3. Click "Sign in with Google"
4. Select your account
5. Click "Allow"
6. Click "Backup to Drive"
7. Done! ✅
```

## 🔧 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Access blocked" | Add origin or test user ⬆️ |
| "Invalid client" | Wait 1-2 min after saving |
| Popup blocked | Allow popups in browser |
| No button shown | Check console, refresh |

## 📝 Files Created

```
✅ .env.local                  (your credentials)
✅ src/lib/googleDrive.ts      (Google Drive API)
✅ src/lib/GoogleDriveSync.svelte (UI component)
✅ READY_TO_TEST.md            (full testing guide)
```

## 🎨 Where to Find in App

```
Sidebar → Settings (⚙️) → Scroll down → "Google Drive Sync"
```

## 💻 Commands

```bash
# Start dev server
pnpm dev

# Check for errors
pnpm check

# Build
pnpm build
```

## 🔍 Debug

Open browser console (F12), you should see:
```
Google Drive Config: {
  clientId: "566966287537-cia93usthaok35vcn11c0ecjo24u1tas...",
  hasApiKey: false,
  scope: "https://www.googleapis.com/auth/drive.file"
}
```

## ✅ Success Indicators

- Sign in → Shows your email
- Backup → "Last backup: [timestamp]"
- Google Drive → File `mindnote_backup.json` exists

## 🆘 Need Help?

1. Check `READY_TO_TEST.md` for detailed troubleshooting
2. Check browser console for error messages
3. Verify authorized origins in Google Console
4. Make sure you're added as test user

---

**Current Status**: ✅ Configured, needs testing

**Next Step**: Add authorized origin, then test!
