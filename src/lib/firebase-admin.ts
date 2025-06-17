import * as admin from 'firebase-admin';

const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

if (!serviceAccountKeyBase64) {
  throw new Error('Firebase service account key is not defined in environment variables.');
}

// Decode the base64 string into a service account object
const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf-8')
);

// This is the key fix: We format the private key to ensure newlines are handled correctly.
const formattedPrivateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

// Initialize the Admin SDK only if it hasn't been initialized already.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: formattedPrivateKey, // Use the formatted key
    }),
  });
}

const firestoreAdmin = admin.firestore();
const authAdmin = admin.auth();

export { admin, firestoreAdmin, authAdmin };