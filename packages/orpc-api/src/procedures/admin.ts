import { os } from '@orpc/server';
import { z } from 'zod';
import { db, users, todos, eq, sql } from '@repo/database';

/**
 * Admin Procedures
 * For user management and system operations
 */

// Get all users with their todo counts
export const getAllUsers = os
  .input(
    z.object({
      adminUserId: z.string().uuid(),
    })
  )
  .output(
    z.array(
      z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.enum(['user', 'admin']),
        createdAt: z.date(),
        updatedAt: z.date(),
        totalTodos: z.number(),
        completedCount: z.number(),
      })
    )
  )
  .handler(async ({ input }) => {
    const { adminUserId } = input;

    // Verify admin
    const [admin] = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);

    if (!admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get all users with todo counts
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        totalTodos: sql<number>`count(${todos.id})`.as('totalTodos'),
        completedCount: sql<number>`sum(case when ${todos.completed} then 1 else 0 end)`.as('completedCount'),
      })
      .from(users)
      .leftJoin(todos, eq(users.id, todos.userId))
      .groupBy(users.id);

    return allUsers.map((user) => ({
      ...user,
      totalTodos: Number(user.totalTodos) || 0,
      completedCount: Number(user.completedCount) || 0,
    }));
  });

// Get user details with all todos
export const getUserWithTodos = os
  .input(
    z.object({
      adminUserId: z.string().uuid(),
      targetUserId: z.string().uuid(),
    })
  )
  .output(
    z.object({
      user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.enum(['user', 'admin']),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
      todos: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().nullable(),
          completed: z.boolean(),
          priority: z.enum(['low', 'medium', 'high']),
          dueDate: z.date().nullable(),
          createdAt: z.date(),
        })
      ),
    })
  )
  .handler(async ({ input }) => {
    const { adminUserId, targetUserId } = input;

    // Verify admin
    const [admin] = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);

    if (!admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get target user
    const [user] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's todos
    const userTodos = await db.select().from(todos).where(eq(todos.userId, targetUserId));

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      todos: userTodos,
    };
  });

// Update user role
export const updateUserRole = os
  .input(
    z.object({
      adminUserId: z.string().uuid(),
      targetUserId: z.string().uuid(),
      newRole: z.enum(['user', 'admin']),
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
    const { adminUserId, targetUserId, newRole } = input;

    // Verify admin
    const [admin] = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);

    if (!admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Can't change own role
    if (adminUserId === targetUserId) {
      throw new Error('Cannot change your own role');
    }

    // Update role
    const [updatedUser] = await db
      .update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, targetUserId))
      .returning();

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    };
  });

// Delete todo (admin override)
export const deleteTodoAdmin = os
  .input(
    z.object({
      adminUserId: z.string().uuid(),
      todoId: z.string().uuid(),
    })
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    const { adminUserId, todoId } = input;

    // Verify admin
    const [admin] = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);

    if (!admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    await db.delete(todos).where(eq(todos.id, todoId));

    return { success: true };
  });

// Get system stats
export const getSystemStats = os
  .input(
    z.object({
      adminUserId: z.string().uuid(),
    })
  )
  .output(
    z.object({
      totalUsers: z.number(),
      totalAdmins: z.number(),
      totalTodos: z.number(),
      completedTodos: z.number(),
    })
  )
  .handler(async ({ input }) => {
    const { adminUserId } = input;

    // Verify admin
    const [admin] = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);

    if (!admin || admin.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const [userStats] = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        totalAdmins: sql<number>`sum(case when ${users.role} = 'admin' then 1 else 0 end)`,
      })
      .from(users);

    const [todoStats] = await db
      .select({
        totalTodos: sql<number>`count(*)`,
        completedTodos: sql<number>`sum(case when ${todos.completed} then 1 else 0 end)`,
      })
      .from(todos);

    return {
      totalUsers: Number(userStats.totalUsers) || 0,
      totalAdmins: Number(userStats.totalAdmins) || 0,
      totalTodos: Number(todoStats.totalTodos) || 0,
      completedTodos: Number(todoStats.completedTodos) || 0,
    };
  });