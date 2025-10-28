# GTNJ Studios - Quick Start Guide

## Quick Deployment Commands

### 1. Install Firebase CLI (first time only)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase (first time only)
```bash
firebase login
```

### 3. Update Firebase Config
Edit `public/js/firebaseConfig.js` with your Firebase project credentials from Firebase Console.

### 4. Deploy to Firebase
```bash
firebase deploy
```

Or deploy only hosting:
```bash
firebase deploy --only hosting
```

## Project URLs

After deployment, your site will be available at:
- **Main Site**: `https://gtnjstudios-b3140.web.app/`
- **Privacy Policy**: `https://gtnjstudios-b3140.web.app/privacy.html`
- **Delete Account**: `https://gtnjstudios-b3140.web.app/delete-account.html`
- **Admin Dashboard**: `https://gtnjstudios-b3140.web.app/admin.html`

## Admin Credentials

**Admin Login** (for admin.html):
- Email: `gtnjstudios@gmail.com`
- Password: `t2YUXNUEWduZ`

**IMPORTANT**: Change this password in Firebase Console > Authentication after first login!

## Firebase Console Tasks

### Create Admin User
1. Go to Firebase Console > Authentication > Users
2. Click "Add User"
3. Email: `gtnjstudios@gmail.com`
4. Password: `t2YUXNUEWduZ`

### Enable Services
1. **Firestore**: Console > Firestore Database > Create Database
2. **Authentication**: Console > Authentication > Get Started > Enable Email/Password

### Get Firebase Config
1. Console > Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Copy the config object

## File Structure

```
public/
  ├── index.html              # Landing page
  ├── privacy.html            # Privacy policy
  ├── delete-account.html     # Account deletion
  ├── admin.html              # Admin dashboard
  ├── logo.png                # Company logo
  ├── styles/
  │   └── main.css           # All styling
  └── js/
      ├── firebaseConfig.js  # Firebase setup (UPDATE THIS!)
      ├── app.js             # Deletion form logic
      └── admin.js           # Admin dashboard logic
```

## Testing Checklist

- [ ] Landing page loads with logo and content
- [ ] Navigation links work
- [ ] Privacy policy is readable
- [ ] Deletion form accepts email and CAPTCHA
- [ ] Deletion request appears in Firestore
- [ ] Admin login works with credentials
- [ ] Deletion requests show in admin dashboard
- [ ] "Mark as Done" button updates status
- [ ] Completed requests turn red

## Common Issues

**Admin can't login?**
- Verify admin user exists in Firebase Console > Authentication
- Check Authentication > Sign-in method > Email/Password is enabled

**Deletion form not working?**
- Check browser console for errors
- Verify Firebase config is correct in `firebaseConfig.js`
- Check Firestore rules are deployed

**Dashboard shows no requests?**
- Submit a test deletion request first
- Check Firestore Console for `deletion_requests` collection
- Verify you're logged in as admin

## Next Steps

1. Deploy: `firebase deploy`
2. Test all pages
3. Change admin password
4. Monitor Firestore usage
5. Consider adding custom domain

---

For detailed instructions, see `DEPLOYMENT_GUIDE.md`
