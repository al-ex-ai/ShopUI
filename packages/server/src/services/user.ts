export interface User {
  id: string;
  name: string;
  email: string;
  type: "new" | "returning" | "premium";
  joinedDate: string;
}

const USERS: Record<string, User> = {
  "user-1": {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    type: "new",
    joinedDate: "2026-02-20",
  },
  "user-2": {
    id: "user-2",
    name: "Sam Wilson",
    email: "sam@example.com",
    type: "returning",
    joinedDate: "2025-06-15",
  },
  "user-3": {
    id: "user-3",
    name: "Jordan Lee",
    email: "jordan@example.com",
    type: "premium",
    joinedDate: "2024-01-10",
  },
};

export function getUserById(id: string): User | undefined {
  return USERS[id];
}

export function getAllUsers(): User[] {
  return Object.values(USERS);
}
