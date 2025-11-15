import { os } from '@orpc/server';
import { z } from 'zod';
import { db, users, eq } from '@repo/database';
import { hashPassword, verifyPassword } from '@repo/database';

/**
 * Authentication Procedures
 */

// Login procedure
export const login = os
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .output(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      role: z.enum(['user', 'admin']),
    })
  )
  .handler(async ({ input }) => {
    const { email, password } = input;

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Return user data (without password)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  });

// Register procedure
export const register = os
  .input(
    z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(6),
    })
  )
  .output(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      role: z.enum(['user', 'admin']),
    })
  )
  .handler(async ({ input }) => {
    const { email, name, password } = input;

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        role: 'user', // Default role
      })
      .returning();

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };
  });

// Get current user procedure
export const getCurrentUser = os
  .input(
    z.object({
      userId: z.string().uuid(),
    })
  )
  .output(
    z
      .object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.enum(['user', 'admin']),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
      .nullable()
  )
  .handler(async ({ input }) => {
    const { userId } = input;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });