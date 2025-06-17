import { NextResponse } from "next/server";
import { authAdmin } from "@/lib/firebase-admin";
import { UserRecord } from "firebase-admin/auth";

export async function GET() {
  try {
    const listUsersResult = await authAdmin.listUsers(1000);

    const users = listUsersResult.users.map((userRecord: UserRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error listing users test:", error);
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to list users", details: errorMessage },
      { status: 500 }
    );
  }
}