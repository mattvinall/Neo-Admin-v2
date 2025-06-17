import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebase-admin";
import { addOrUpdateSubscriber } from "@/lib/mailerlite-api"; // We'll create this new helper file next
import { UserRecord } from "firebase-admin/auth";

/**
 * API route handler for POST requests to /api/sync.
 * Fetches all users from Firebase Auth and syncs them to MailerLite.
 */
export async function POST() {
  try {
    console.log("Starting manual sync process...");
    const listUsersResult = await authAdmin.listUsers(1000);

    let processedCount = 0;
    const allPromises: Promise<void>[] = [];

    listUsersResult.users.forEach((userRecord: UserRecord) => {
      // We only sync users who have an email and a display name
      if (userRecord.email && userRecord.displayName) {
        // Add the sync operation to our list of promises
        allPromises.push(
          addOrUpdateSubscriber(userRecord.email, userRecord.displayName)
        );
        processedCount++;
      }
    });

    // Wait for all the sync operations to complete
    await Promise.all(allPromises);
    console.log("Manual sync process completed.");

    return NextResponse.json({
      message: "Sync completed successfully.",
      processedCount: processedCount,
    });
  } catch (error: any) {
    console.error("Error during manual sync:", error);
    return NextResponse.json(
      { error: "Failed to sync users", details: error.message },
      { status: 500 }
    );
  }
}