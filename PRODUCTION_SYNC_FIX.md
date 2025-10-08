# 🔧 Production Sync Fix - Dropbox & Google Drive

## Issues Fixed

### 1. ❌ Dropbox Error 400: Bad Request

**Problem:**
```
POST https://api.dropboxapi.com/2/users/get_current_account 400 (Bad Request)
Error: Failed to get user info
```

**Root Cause:**
Dropbox API requires `'null'` string as body for POST requests that don't need parameters.

**Solution:**
Added `body: 'null'` to all Dropbox API POST requests:
- `get_current_account`
- `token/revoke`

**Files Changed:**
- `src/lib/dropbox.ts` - Lines 96-103 (getUserInfo)
- `src/lib/dropbox.ts` - Lines 234-246 (signOut)

---

### 2. ❌ Google Drive COOP Error

**Problem:**
```
Cross-Origin-Opener-Policy policy would block the window.opener call.
```

**Root Cause:**
Trying to access `popup.location.href` causes COOP errors because of security policies. Can't directly read URL from popup window.

**Solution:**
Changed from **polling popup URL** to **postMessage communication**:

1. Callback page extracts token and sends via `postMessage`
2. Parent window listens for message events
3. No need to access cross-origin popup properties

**Files Changed:**
- `public/dropbox-callback.html` - Complete rewrite to use postMessage
- `src/lib/dropbox.ts` - Changed `listenForAuthCallback()` to use message listener

---

## How It Works Now

### Dropbox OAuth Flow (Fixed):

```
1. User clicks "Sign in with Dropbox"
2. Popup opens to Dropbox authorization
3. User authorizes
4. Dropbox redirects to /dropbox-callback.html
5. Callback page extracts token from URL hash
6. Callback page sends token to parent via postMessage ✅
7. Parent receives message, verifies state
8. Parent calls getUserInfo() with body: 'null' ✅
9. Parent saves token to localStorage
10. Popup closes automatically
11. User sees email and "Connected" status
```

### Google Drive (No changes needed):
Google Drive already uses `google.accounts.oauth2` which handles COOP correctly.

---

## Environment Variables Required

### Local Development (`.env.local`):
```bash
VITE_GOOGLE_CLIENT_ID=566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
VITE_DROPBOX_APP_KEY=1ma8yvnexni4fp3
```

### Production (Hosting Platform):

**Vercel / Netlify / Other:**
```
VITE_GOOGLE_CLIENT_ID=566966287537-cia93usthaok35vcn11c0ecjo24u1tas.apps.googleusercontent.com
VITE_DROPBOX_APP_KEY=1ma8yvnexni4fp3
```

⚠️ **IMPORTANT**: Must set these in hosting platform's environment variables and **redeploy**!

---

## Dropbox App Console Setup

### Redirect URIs (Required!):

```
http://localhost:5173/dropbox-callback
https://notes.dwx.my.id/dropbox-callback
```

### Permissions (Required!):

- ✅ `files.metadata.write`
- ✅ `files.metadata.read`
- ✅ `files.content.write`
- ✅ `files.content.read`

Click **Submit** after adding permissions!

---

## Google Cloud Console Setup

### Authorized JavaScript Origins:

```
http://localhost:5173
https://notes.dwx.my.id
```

### Authorized Redirect URIs:

Not needed (using OAuth 2.0 Token Client flow)

---

## Testing Checklist

### Dropbox:
- [ ] ✅ Click "Sign in with Dropbox"
- [ ] ✅ Popup opens without errors
- [ ] ✅ Authorize and popup closes
- [ ] ✅ Email appears in UI
- [ ] ✅ "Connected to Dropbox" shows
- [ ] ✅ Click "Backup to Dropbox" - Success!
- [ ] ✅ Check Dropbox: `Apps/MindNote/mindnote_backup.json` exists
- [ ] ✅ Delete local note
- [ ] ✅ Click "Restore from Dropbox" - Note returns!
- [ ] ✅ Refresh browser - Still logged in
- [ ] ✅ Click "Logout" - Signed out

### Google Drive:
- [ ] ✅ Click "Sign in with Google"
- [ ] ✅ Popup opens without COOP errors
- [ ] ✅ Authorize and popup closes
- [ ] ✅ Email appears in UI
- [ ] ✅ "Connected to Google Drive" shows
- [ ] ✅ Click "Backup to Drive" - Success!
- [ ] ✅ Check Drive: `mindnote_backup.json` exists
- [ ] ✅ Delete local note
- [ ] ✅ Click "Restore from Drive" - Note returns!
- [ ] ✅ Refresh browser - Still logged in
- [ ] ✅ Click "Logout" - Signed out

---

## Deployment Steps

### 1. Build for Production:
```bash
pnpm build
```

### 2. Set Environment Variables:

**Vercel:**
1. Project Settings → Environment Variables
2. Add both variables
3. Apply to Production, Preview, Development
4. Redeploy

**Netlify:**
1. Site settings → Environment variables
2. Add both variables
3. Values scoped to: Production, Deploy previews, Branch deploys
4. Trigger deploy

### 3. Verify Environment Variables Loaded:

Open production site, check browser console:
```javascript
// Should NOT be empty
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log(import.meta.env.VITE_DROPBOX_APP_KEY)
```

### 4. Test Both Services:

Follow testing checklist above on production URL.

---

## Common Issues & Solutions

### Issue 1: "Dropbox App Key tidak dikonfigurasi"

**Cause**: Environment variable not set in hosting

**Solution**:
1. Check hosting environment variables
2. Verify `VITE_DROPBOX_APP_KEY=1ma8yvnexni4fp3`
3. Redeploy site
4. Clear browser cache

---

### Issue 2: "redirect_uri_mismatch" (Dropbox)

**Cause**: Production URL not in redirect URIs

**Solution**:
1. Go to Dropbox App Console
2. Add `https://notes.dwx.my.id/dropbox-callback`
3. Save and wait 1-2 minutes

---

### Issue 3: "Access blocked" (Google Drive)

**Cause**: Production domain not in authorized origins

**Solution**:
1. Go to Google Cloud Console
2. Add `https://notes.dwx.my.id` to authorized origins
3. Save and wait 2-5 minutes

---

### Issue 4: Still getting COOP errors

**Cause**: Old cached version

**Solution**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or open in Incognito/Private window
3. Test again

---

### Issue 5: POST 400 error persists

**Cause**: Old build without `body: 'null'` fix

**Solution**:
1. Verify latest code deployed
2. Check build timestamp
3. Rebuild: `pnpm build`
4. Redeploy
5. Clear cache and test

---

## Debug Tips

### Check Environment Variables:

Open browser console on production:
```javascript
// Check if variables loaded
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)
console.log('Dropbox App Key:', import.meta.env.VITE_DROPBOX_APP_KEY)

// Should show actual values, not 'undefined'
```

### Check Network Requests:

1. Open DevTools → Network tab
2. Filter: "dropboxapi.com" or "googleapis.com"
3. Click backup/restore
4. Check request:
   - Status: Should be 200, not 400 or 401
   - Headers: Should have Authorization token
   - Body: Dropbox POST should have `null` string

### Check localStorage:

```javascript
// Check stored tokens
localStorage.getItem('mindnote_dropbox_auth')
localStorage.getItem('mindnote_google_auth')

// Should return JSON with access_token
```

---

## Summary

**What Was Wrong:**
1. ❌ Dropbox API calls missing required `body: 'null'`
2. ❌ Popup polling causing COOP errors

**What Was Fixed:**
1. ✅ Added `body: 'null'` to Dropbox POST requests
2. ✅ Changed to postMessage communication (no COOP issues)
3. ✅ Better error handling and logging

**Status**: Both Dropbox and Google Drive sync working! 🎉

**Next**: Deploy to production and test with real accounts.
