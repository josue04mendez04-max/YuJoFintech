# Migration from Google Scripts to Firebase Firestore

## Overview
This document describes the migration of YuJoFintech from Google Apps Script to Firebase Firestore.

## Changes Made

### 1. Removed Google Scripts Code
- **Deleted**: `code_gs.ts` - Contains Google Apps Script backend code
- **Removed**: API_URL constant from `App.tsx` that pointed to Google Scripts deployment

### 2. Added Firebase Dependencies
- **Package**: `firebase` v12.7.0
- **Modules Used**: 
  - `firebase/app` - Core Firebase initialization
  - `firebase/firestore` - Firestore database operations

### 3. New Files Created

#### `firebase.config.ts`
Initializes Firebase with the provided credentials and exports the Firestore database instance.

**Important Note**: The Firebase credentials exposed in this file are client-side credentials that are safe to be public. Security is enforced through Firestore Security Rules on the backend.

#### `firestore.service.ts`
Service layer that handles all Firestore database operations:
- `fetchMovements()` - Retrieves all movements from Firestore
- `addMovement(movement)` - Adds a new movement
- `deleteMovement(id)` - Deletes a movement by ID
- `updateMovementStatus(id, status, cutId)` - Updates movement status
- `performCorte(movementIds, cutId)` - Batch operation to archive multiple movements

### 4. Updated App.tsx
Replaced all Google Scripts API calls with Firestore service calls:
- Changed `fetch(API_URL)` calls to `FirestoreService.fetchMovements()`
- Changed POST requests to direct Firestore service methods
- Updated error messages to reference Firebase instead of Google Scripts
- Maintained optimistic updates and error handling

## Firestore Database Structure

### Collection: `yujofintech`
This collection stores all movements for this application.

**Document Structure**:
```typescript
{
  id: string,              // Movement ID (e.g., "YJ-ABC123")
  type: string,            // "INGRESO" | "GASTO" | "INVERSION"
  category?: string,       // Optional category
  amount: number,          // Amount in currency
  description: string,     // Description of the movement
  responsible: string,     // Person responsible
  authorization: string,   // Authorization (usually "Josué M.")
  date: string,            // Date in ISO format
  status: string,          // "PENDIENTE_CORTE" | "EN_CURSO" | "ARCHIVADO"
  cutId?: string,          // Optional ID linking to a corte de caja
  timestamp: string        // ISO timestamp when document was created
}
```

## Firestore Security Rules

The following Firestore security rules must be configured in the Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reportes/{document=**} {
      allow read, write: if true;
    }
    match /iglesias/{document=**} {
      allow read, write: if true;
    }
    match /soporte/{document=**} {
      allow read, write: if true;
    }
    match /actividades/{document=**} {
      allow read, write: if true;
    }
    match /yujofintech/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: These rules allow public read/write access. For production use, consider implementing authentication and more restrictive rules.

## Compatibility

This migration maintains full compatibility with:
- Existing app structure and UI
- All existing functionality (add, delete, edit, corte de caja)
- Optimistic updates and sync status indicators
- Other collections in the same Firebase project (reportes, iglesias, soporte, actividades)

## Testing

1. **Build Test**: ✅ Passed
   ```bash
   npm run build
   ```

2. **Security Scan**: ✅ Passed
   - No vulnerabilities found in dependencies
   - No security alerts in code

## Next Steps for Deployment

1. Ensure Firestore security rules are configured in Firebase Console
2. Test the application in development mode:
   ```bash
   npm run dev
   ```
3. Verify all CRUD operations work correctly
4. Deploy the built application

## Benefits of Migration

1. **Scalability**: Firestore can handle much larger datasets than Google Sheets
2. **Real-time**: Firestore supports real-time listeners (can be implemented in future)
3. **Performance**: Direct database queries are faster than Google Scripts API calls
4. **Reliability**: No more CORS issues or "Failed to fetch" errors
5. **Modern Stack**: Standard Firebase SDK with TypeScript support
6. **Offline Support**: Firestore has built-in offline capabilities (can be enabled)

## Maintenance Notes

- The collection name `yujofintech` is used to keep this app's data separate from other apps
- Movement IDs are preserved to maintain data consistency
- All operations use batch writes where appropriate for atomic updates
- Error handling maintains the same UX as before with sync status indicators
