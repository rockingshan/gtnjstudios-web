# GTNJ Studios Website - Deployment Guide

This guide will walk you through setting up and deploying the GTNJ Studios website to Firebase Hosting.

## Project Overview

This project includes:
- **Landing Page** (`index.html`) - Modern, AI-focused company website
- **Privacy Policy** (`privacy.html`) - Comprehensive privacy policy
- **Account Deletion** (`delete-account.html`) - Account deletion request form with CAPTCHA
- **Admin Dashboard** (`admin.html`) - Secured dashboard for managing deletion requests

## Prerequisites

1. **Node.js and npm** - Download from https://nodejs.org/ (LTS version recommended)
2. **Firebase Account** - Sign up at https://firebase.google.com/
3. **Firebase CLI** - Install globally using npm

## Step 1: Install Firebase CLI

Open your terminal/command prompt and run:

```bash
npm install -g firebase-tools
```

Verify installation:

```bash
firebase --version
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 3: Create/Configure Firebase Project

### Option A: Use Existing Project (gtnjstudios-b3140)

If you already have the project `gtnjstudios-b3140` in your Firebase console, skip to Step 4.

### Option B: Create New Project

1. Go to https://console.firebase.google.com/
2. Click "Add Project" or select existing project
3. Enter project name: `gtnjstudios-b3140` (or your preferred name)
4. Follow the setup wizard
5. Enable Google Analytics (optional)

## Step 4: Enable Required Firebase Services

### 4.1 Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in Production Mode**
4. Select a location (closest to your users)
5. Click **Enable**

### 4.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click **Save**

### 4.3 Create Admin User

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **Add User**
3. Enter:
   - **Email**: `gtnjstudios@gmail.com`
   - **Password**: `t2YUXNUEWduZ`
4. Click **Add User**

## Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the **Web** icon (`</>`) to add a web app
4. Register app with nickname: "GTNJ Studios Web"
5. Copy the Firebase configuration object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "gtnjstudios-b3140.firebaseapp.com",
  projectId: "gtnjstudios-b3140",
  storageBucket: "gtnjstudios-b3140.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
};
```

## Step 6: Update Firebase Configuration

Open `public/js/firebaseConfig.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "gtnjstudios-b3140.firebaseapp.com",
  projectId: "gtnjstudios-b3140",
  storageBucket: "gtnjstudios-b3140.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 7: Update Firebase Project ID (if different)

If you're using a different project ID than `gtnjstudios-b3140`, update `.firebaserc`:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## Step 8: Deploy Firestore Rules

The Firestore security rules are already configured in `firestore.rules`. To deploy them:

```bash
firebase deploy --only firestore:rules
```

## Step 9: Deploy to Firebase Hosting

From the project root directory, run:

```bash
firebase deploy --only hosting
```

Or deploy everything at once:

```bash
firebase deploy
```

## Step 10: Verify Deployment

After successful deployment, you'll see output like:

```
✔  Deploy complete!

Hosting URL: https://gtnjstudios-b3140.web.app
```

Visit the URL to see your live website!

## Testing the Website

### Test Landing Page
1. Visit `https://your-project-id.web.app/`
2. Verify logo, navigation, and content display correctly

### Test Privacy Policy
1. Visit `https://your-project-id.web.app/privacy.html`
2. Verify all sections are readable

### Test Account Deletion Form
1. Visit `https://your-project-id.web.app/delete-account.html`
2. Try submitting a test email with the CAPTCHA
3. Check Firestore Console > `deletion_requests` collection for the new document

### Test Admin Dashboard
1. Visit `https://your-project-id.web.app/admin.html`
2. Login with:
   - Email: `gtnjstudios@gmail.com`
   - Password: `t2YUXNUEWduZ`
3. Verify deletion requests appear in the table
4. Test "Mark as Done" functionality

## Project Structure

```
gtnjstudios-web/
├── public/
│   ├── index.html              # Landing page
│   ├── privacy.html            # Privacy policy
│   ├── delete-account.html     # Account deletion form
│   ├── admin.html              # Admin dashboard
│   ├── logo.png                # Company logo
│   ├── styles/
│   │   └── main.css            # All styles
│   └── js/
│       ├── firebaseConfig.js   # Firebase configuration
│       ├── app.js              # Deletion form logic
│       └── admin.js            # Admin dashboard logic
├── firebase.json               # Firebase hosting config
├── .firebaserc                 # Firebase project config
├── firestore.rules             # Firestore security rules
└── firestore.indexes.json      # Firestore indexes

```

## Firestore Data Structure

### Collection: `deletion_requests`

Each document contains:
- `email` (string): User's email address
- `timestamp` (timestamp): When the request was submitted
- `status` (string): Either "pending" or "done"

Example document:
```json
{
  "email": "user@example.com",
  "timestamp": "2024-10-28T10:30:00Z",
  "status": "pending"
}
```

## Security Considerations

### Admin Access
- Only `gtnjstudios@gmail.com` can access the admin dashboard
- Password is: `t2YUXNUEWduZ`
- **IMPORTANT**: Change this password after first login via Firebase Console

### Firestore Security Rules
- Public read/write access to `deletion_requests` (required for form submission)
- All other collections are locked down by default
- Consider adding more strict rules in production

### Recommended: Enhance Security
After deployment, consider:
1. Changing the admin password in Firebase Console
2. Adding rate limiting to prevent spam submissions
3. Implementing server-side email validation
4. Adding reCAPTCHA v3 for better bot protection

## Updating the Website

To make changes and redeploy:

1. Edit files in the `public/` directory
2. Test locally (optional - use `firebase serve`)
3. Deploy changes:
   ```bash
   firebase deploy
   ```

## Local Testing (Optional)

To test locally before deploying:

```bash
firebase serve
```

Then visit `http://localhost:5000` in your browser.

## Troubleshooting

### Issue: "Firebase command not found"
**Solution**: Reinstall Firebase CLI with `npm install -g firebase-tools`

### Issue: "Permission denied"
**Solution**: Run `firebase login` to re-authenticate

### Issue: "Firestore security rules error"
**Solution**: Ensure rules are deployed with `firebase deploy --only firestore:rules`

### Issue: "Admin login fails"
**Solution**:
1. Verify admin user exists in Firebase Console > Authentication
2. Check email and password are correct
3. Verify Authentication is enabled

### Issue: "Deletion requests not showing in admin dashboard"
**Solution**:
1. Check Firestore Console for documents in `deletion_requests` collection
2. Verify Firestore rules are deployed
3. Check browser console for JavaScript errors

## Custom Domain (Optional)

To add a custom domain:

1. In Firebase Console, go to **Hosting**
2. Click **Add custom domain**
3. Follow the wizard to verify domain ownership
4. Update DNS records as instructed
5. Wait for SSL certificate to provision (can take up to 24 hours)

## Support

For issues or questions:
- Email: gtnjstudios@gmail.com
- Firebase Documentation: https://firebase.google.com/docs

## Next Steps

1. Test all functionality thoroughly
2. Change admin password for security
3. Consider adding Google reCAPTCHA for better CAPTCHA protection
4. Set up Firebase Analytics to track website usage
5. Configure custom domain if needed
6. Add monitoring and alerts for deletion requests

## Important Notes

- **Backup**: Firebase handles backups automatically, but consider exporting Firestore data periodically
- **Costs**: Firebase has a generous free tier, but monitor usage in Firebase Console
- **Updates**: Keep Firebase SDKs updated by checking for new versions periodically
- **Logo**: Ensure `logo.png` is in the `public/` directory before deploying

---

**Deployment Complete!** Your GTNJ Studios website is now live on Firebase Hosting.
