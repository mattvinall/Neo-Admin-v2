import * as admin from 'firebase-admin';

// The path to your service account key JSON file
// We will get this from the environment variables
const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

if (!serviceAccountKeyBase64) {
  throw new Error('Firebase service account key is not defined. Check your .env.local file.');
}

// Decode the base64 string to get the JSON object
const serviceAccount = JSON.parse(Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf-8'));

// Initialize the Admin SDK, but only if it hasn't been initialized already.
// This prevents errors during hot-reloading in development.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestoreAdmin = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestoreAdmin, authAdmin };