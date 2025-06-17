import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { addOrUpdateSubscriber } from "./mailerlite";

// Initialize the Firebase Admin SDK to interact with Firestore and Auth
admin.initializeApp();
const db = admin.firestore();

/**
 * Function #1: Records a new user's ID in a Firestore 'syncQueue'
 * This is triggered the moment a user is created in Firebase Auth.
 * @param user The UserRecord object for the newly created user.
 */
export const recordNewUserForSync = functions.auth.user().onCreate(
  async (user: functions.auth.UserRecord): Promise<void> => {
    functions.logger.info("New user created, adding to sync queue:", {
      uid: user.uid,
      email: user.email,
    });

    if (!user.email) {
      functions.logger.warn("User was created without an email, cannot sync.", { uid: user.uid });
      return;
    }

    // Create a document in the 'syncQueue' collection
    const queueDocRef = db.collection("syncQueue").doc(user.uid);

    await queueDocRef.set({
      email: user.email,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`User ${user.uid} successfully added to syncQueue.`);
  }
);


/**
 * Function #2: Processes the syncQueue on a schedule.
 * Runs every 10 minutes to check for pending users and sync them.
 * @param context The event context provided by Cloud Functions.
 */
export const processSyncQueue = functions.pubsub
  .schedule("every 10 minutes")
  .onRun(async (context: functions.EventContext): Promise<void> => {
    functions.logger.info("Running scheduled job to process sync queue...");

    // Get all documents from the queue that are still pending
    const pendingDocsSnapshot = await db
      .collection("syncQueue")
      .where("status", "==", "pending")
      .limit(50) // Process in batches to avoid overwhelming resources
      .get();

    if (pendingDocsSnapshot.empty) {
      functions.logger.info("No users in queue to process.");
      return;
    }

    functions.logger.info(`Found ${pendingDocsSnapshot.size} users to process.`);

    // Create a promise for each document to be processed
    const processingPromises: Promise<void>[] = pendingDocsSnapshot.docs.map(
      async (doc) => {
        const userId = doc.id;
        const userData = doc.data();

        try {
          // Fetch the LATEST user record from Firebase Auth
          const userAuthRecord = await admin.auth().getUser(userId);

          // Check if the displayName now exists
          if (userAuthRecord.displayName) {
            functions.logger.info(`Found displayName for ${userId}, syncing to MailerLite.`);
            
            // Sync to MailerLite with the name and email
            await addOrUpdateSubscriber(userData.email, userAuthRecord.displayName);

            // Update the status to 'processed' so we don't check it again
            await doc.ref.update({ status: "processed" });
          } else {
            functions.logger.info(`User ${userId} still has no displayName. Will retry later.`);
          }
        } catch (error) {
          functions.logger.error(`Error processing user ${userId}:`, error);
          // Mark as 'error' to prevent retrying a user that fails consistently
          await doc.ref.update({ status: "error" });
        }
      }
    );

    // Wait for all the processing to complete
    await Promise.all(processingPromises);

    functions.logger.info("Finished processing sync queue batch.");
  });