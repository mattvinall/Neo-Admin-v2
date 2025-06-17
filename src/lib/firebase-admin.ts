import * as admin from 'firebase-admin';

// Check if the required environment variables are set
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  throw new Error('Firebase service account credentials are not fully defined in environment variables.');
}

// Construct the service account object from individual environment variables
// This completely avoids the JSON.parse() issue.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Vercel handles multi-line env variables correctly, but we add a replace()
  // to be safe in case it escapes the newline characters.
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Initialize the Admin SDK only if it hasn't been initialized already
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestoreAdmin = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestoreAdmin, authAdmin };