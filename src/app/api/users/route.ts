import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebase-admin"; // Using the alias for our server-side admin SDK
import { UserRecord } from "firebase-admin/auth";

/**
 * API route handler for GET requests to /api/users.
 * Fetches and returns a list of all users from Firebase Authentication.
 */
export async function GET() {
  try {
    const listUsersResult = await authAdmin.listUsers(1000); // Fetches up to 1000 users

    // We map over the results to create a clean, serializable array of user data.
    const users = listUsersResult.users.map((userRecord: UserRecord) => {
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        emailVerified: userRecord.emailVerified,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error listing users:", error);
    // Return a structured error response
    return NextResponse.json(
      { error: "Failed to list users", details: error.message },
      { status: 500 }
    );
  }
}