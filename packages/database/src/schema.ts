import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

/**
 * User Roles Enum
 */
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

/**
 * Users Table
 * Stores user accounts with authentication and role information.
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(), // bcrypt hashed
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Todo Priority Enum
 */
export const todoPriorityEnum = pgEnum('todo_priority', ['low', 'medium', 'high']);

/**
 * Todos Table
 * Stores todo items for users.
 */
export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').default(false).notNull(),
  priority: todoPriorityEnum('priority').default('medium').notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});