import { db } from "@/db";
import { users } from "@/db/schema/core/user";
import { eq } from "drizzle-orm";

export class UserRepository {
  async findById(id: string) {
    const result = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        emailVerified: users.emailVerified,
        status: users.status,
        profileImageId: users.profileImageId,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async createUser(data: {
    firstName: string;
    lastName?: string | null;
    email: string;
    passwordHash: string;
    emailVerified?: boolean;
    status?: "active" | "inactive" | "blocked";
  }) {
    const [user] = await db
      .insert(users)
      .values({
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        email: data.email,
        passwordHash: data.passwordHash,
        emailVerified: data.emailVerified ?? false,
        status: data.status ?? "active",
      })
      .returning();

    return user;
  }

  async updateLastLogin(id: string) {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }
}

export const userRepository = new UserRepository();
