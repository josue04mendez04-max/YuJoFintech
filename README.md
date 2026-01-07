<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# YuJoFintech - Conserje Financiera

A sophisticated financial management system built with React, TypeScript, and Firebase Firestore.

## Features

- 📊 **Dashboard** - Overview of financial movements and statistics
- 📝 **Registry** - Add and manage financial movements (Income, Expenses, Investments)
- 💰 **Vault** - Physical cash counting system
- 🧾 **Corte de Caja** - Cash cut/closing system with receipt generation
- 🔐 **PIN Security** - Protected operations with PIN authentication
- ☁️ **Cloud Sync** - Real-time synchronization with Firebase Firestore

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Backend**: Firebase Firestore
- **Build Tool**: Vite
- **Charts**: Recharts
- **Styling**: Tailwind CSS

## Run Locally

**Prerequisites:** Node.js (v18 or higher recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Firebase Configuration

The app uses Firebase Firestore for data persistence. The Firebase configuration is located in `firebase.config.ts`.

### Firestore Collections

- `yujofintech` - Main collection for this app's financial movements

### Security Rules

Make sure the following Firestore security rules are configured in your Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /yujofintech/{document=**} {
      allow read, write: if true;
    }
  }
}
```

> **Note**: For production use, implement proper authentication and more restrictive security rules.

## Migration from Google Scripts

This application was migrated from Google Apps Script to Firebase Firestore. For detailed information about the migration, see [MIGRATION.md](MIGRATION.md).

## Development

View your app in AI Studio: https://ai.studio/apps/drive/1DuRFy9SRng6yY0dUtH3g9Bp8dBN8UUgS

## License

Private project - All rights reserved
