import { UserTable } from "@/components/UserTable";
import type { User } from "@/types"; // We will create this type definition file next

/**
 * Fetches user data from our API endpoint.
 * This function runs on the server.
 * @returns A promise that resolves to an array of users.
 */
async function getUsers(): Promise<User[]> {
  try {
    // In a real app, the base URL should come from an environment variable
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/users`, {
      cache: "no-store", // Don't cache user data, always get the latest
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return []; // Return an empty array on error
  }
}

/**
 * The main page for the /admin route.
 * This is a React Server Component.
 */
export default async function AdminPage() {
  const users = await getUsers();

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="p-4 border rounded-lg bg-card">
        <UserTable users={users} />
      </div>
    </main>
  );
}