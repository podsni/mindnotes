# Google Drive Integration Setup Guide

## Overview
MindNote now supports backing up and syncing your notes with Google Drive! This allows you to:
- 📤 Backup all your notes to Google Drive
- 📥 Restore notes from Google Drive
- 🔄 Keep your notes synced across devices
- 🔐 Secure authentication via Google OAuth 2.0

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "MindNote")
4. Click "Create"

### Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name (e.g., "MindNote")
   - Add your email as developer contact
   - Add the scope: `https://www.googleapis.com/auth/drive.file`
   - Add test users (your email) if in testing mode

4. Back to "Create OAuth client ID":
   - Application type: "Web application"
   - Name: "MindNote Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `http://localhost:4173` (for preview)
     - Add your production domain when deploying
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - `http://localhost:4173` (for preview)
     - Add your production domain when deploying

5. Click "Create"
6. Copy your **Client ID** (looks like `xxxxx.apps.googleusercontent.com`)

### Step 4: Get API Key (Optional but Recommended)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API Key
4. Click "Restrict Key" and:
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Drive API"
   - Click "Save"

### Step 5: Configure MindNote

Open `src/lib/googleDrive.ts` and update the configuration:

```typescript
const CONFIG: GoogleAuthConfig = {
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Replace this
  apiKey: 'YOUR_API_KEY', // Replace this (or leave empty if not using)
  scope: 'https://www.googleapis.com/auth/drive.file',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
}
```

### Step 6: Test the Integration

1. Run the development server:
   ```bash
   pnpm dev
   ```

2. Open MindNote in your browser
3. Click on Settings
4. Scroll to "Google Drive Sync"
5. Click "Sign in with Google"
6. Authorize the app
7. Try backing up and restoring notes!

## Usage

### Backup Notes
1. Sign in with Google (first time only)
2. Click "Backup to Drive"
3. All your notes will be saved to Google Drive as `mindnote_backup.json`

### Restore Notes
1. Make sure you're signed in
2. Click "Restore from Drive"
3. Confirm the action (this will replace your current notes!)
4. Your notes will be restored from the backup

### Sign Out
Click "Sign out" to revoke access to Google Drive.

## Security & Privacy

- **OAuth 2.0**: Secure authentication without storing passwords
- **Limited Scope**: The app only has access to files it creates (`drive.file` scope)
- **Local First**: Your notes are always stored locally in IndexedDB
- **Optional Feature**: Google Drive sync is completely optional

## Troubleshooting

### "Invalid Client" Error
- Make sure your Client ID is correct
- Check that the origin URL matches your authorized origins in Google Console
- Clear browser cache and try again

### "Access Blocked" Error
- If the app is in testing mode, make sure your email is added as a test user
- Check that the OAuth consent screen is properly configured

### "Failed to Sign In"
- Check browser console for detailed errors
- Make sure popup blockers are disabled
- Try in an incognito window to rule out extension conflicts

### No Backup Found
- Make sure you've created a backup first
- Check your Google Drive for `mindnote_backup.json`
- The file might be in the root folder of your Drive

## Production Deployment

When deploying to production:

1. Add your production domain to:
   - Authorized JavaScript origins
   - Authorized redirect URIs

2. Update OAuth consent screen to "In Production" status (requires verification)

3. Consider implementing:
   - Auto-sync intervals
   - Conflict resolution for multiple devices
   - Backup versioning

## API Limits

Google Drive API has the following limits:
- **Queries per day**: 1 billion
- **Queries per 100 seconds per user**: 1,000

For normal usage, these limits are more than sufficient.

## Cost

The Google Drive API is **free** for the quotas mentioned above. There are no charges for typical personal use.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Google Cloud Console logs
3. Make sure all API credentials are correct
4. Verify OAuth consent screen configuration

## Future Enhancements

Planned features:
- ⏰ Automatic scheduled backups
- 🔄 Real-time sync across devices
- 📝 Backup versioning and history
- 🔀 Conflict resolution for simultaneous edits
- 📊 Sync status indicators

---

**Note**: Remember to keep your API credentials secure and never commit them to public repositories!
