"use client";

import type { User } from "@/types";
import Image from "next/image"; // Import the Next.js Image component

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        {/* ... table head remains the same ... */}
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.uid}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.photoURL ? (
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={user.photoURL}
                          alt={user.displayName || 'User avatar'}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {user.displayName?.charAt(0) || user.email?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground">{user.displayName || 'No Name'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(user.creationTime).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.disabled ? (
                     <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-destructive/10 text-destructive">Disabled</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">Active</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}