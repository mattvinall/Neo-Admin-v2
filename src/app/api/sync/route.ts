import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebase-admin";
import { addOrUpdateSubscriber } from "@/lib/mailerlite-api";
import { UserRecord } from "firebase-admin/auth";

export async function POST() {
  try {
    console.log("Starting manual sync process...");
    const listUsersResult = await authAdmin.listUsers(1000);

    const allPromises: Promise<void>[] = [];

    listUsersResult.users.forEach((userRecord: UserRecord) => {
      if (userRecord.email && userRecord.displayName) {
        allPromises.push(
          addOrUpdateSubscriber(userRecord.email, userRecord.displayName)
        );
      }
    });

    await Promise.all(allPromises);
    console.log("Manual sync process completed.");

    return NextResponse.json({
      message: "Sync completed successfully.",
      processedCount: allPromises.length,
    });
  } catch (error) {
    console.error("Error during manual sync:", error);
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to sync users", details: errorMessage },
      { status: 500 }
    );
  }
}