import { os } from '@orpc/server';
import { z } from 'zod';
import { db, todos, eq, and, desc } from '@repo/database';

/**
 * Todo CRUD Procedures
 */

// Get all todos for a user
export const getTodos = os
  .input(
    z.object({
      userId: z.string().uuid(),
    })
  )
  .output(
    z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        completed: z.boolean(),
        priority: z.enum(['low', 'medium', 'high']),
        dueDate: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
    )
  )
  .handler(async ({ input }) => {
    const { userId } = input;

    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));

    return userTodos;
  });

// Get single todo
export const getTodo = os
  .input(
    z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    })
  )
  .output(
    z
      .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        completed: z.boolean(),
        priority: z.enum(['low', 'medium', 'high']),
        dueDate: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })
      .nullable()
  )
  .handler(async ({ input }) => {
    const { id, userId } = input;

    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    return todo || null;
  });

// Create todo
export const createTodo = os
  .input(
    z.object({
      userId: z.string().uuid(),
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      dueDate: z.date().optional(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      completed: z.boolean(),
      priority: z.enum(['low', 'medium', 'high']),
      dueDate: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  )
  .handler(async ({ input }) => {
    const { userId, title, description, priority, dueDate } = input;

    const [newTodo] = await db
      .insert(todos)
      .values({
        userId,
        title,
        description: description || null,
        priority: priority || 'medium',
        dueDate: dueDate || null,
        completed: false,
      })
      .returning();

    return newTodo;
  });

// Update todo
export const updateTodo = os
  .input(
    z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      completed: z.boolean().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      dueDate: z.date().nullable().optional(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      completed: z.boolean(),
      priority: z.enum(['low', 'medium', 'high']),
      dueDate: z.date().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  )
  .handler(async ({ input }) => {
    const { id, userId, ...updates } = input;

    // Verify ownership
    const [existingTodo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    const [updatedTodo] = await db
      .update(todos)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning();

    return updatedTodo;
  });

// Delete todo
export const deleteTodo = os
  .input(
    z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    })
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    const { id, userId } = input;

    // Verify ownership before deleting
    const [existingTodo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    await db.delete(todos).where(eq(todos.id, id));

    return { success: true };
  });

// Toggle todo completed status
export const toggleTodo = os
  .input(
    z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      completed: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    const { id, userId } = input;

    // Get current todo
    const [existingTodo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    // Toggle completed
    const [updatedTodo] = await db
      .update(todos)
      .set({
        completed: !existingTodo.completed,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning();

    return {
      id: updatedTodo.id,
      completed: updatedTodo.completed,
    };
  });