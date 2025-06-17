import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "./firebase"; // Import the initialized client-side app

// Initialize Firestore and get a reference to the service
const db = getFirestore(app);

/**
 * Adds a new user document to the 'users' collection in Firestore.
 * This is called from the client-side right after a user signs up.
 * @param userId The user's unique ID from Firebase Authentication.
 * @param fullName The user's full name from the sign-up form.
 * @param email The user's email address.
 */
export const addUserToFirestore = async (
  userId: string,
  fullName: string,
  email: string | null
) => {
  if (!email) {
    throw new Error("Email is required to add a user to Firestore.");
  }

  try {
    // Create a reference to a new document in the 'users' collection
    // We use the user's auth ID as the document ID for easy lookups
    const userDocRef = doc(db, "users", userId);

    // Set the data for the new document
    await setDoc(userDocRef, {
      uid: userId,
      fullName: fullName,
      email: email,
      createdAt: serverTimestamp(), // Use the server's timestamp for consistency
      mailerliteSynced: false, // A flag to track if the sync has happened
    });

    console.log("User document created in Firestore successfully.");
  } catch (error) {
    console.error("Error creating user document in Firestore: ", error);
    // You could add more robust error handling here, like showing a message to the user
  }
};