import { os } from '@orpc/server';
import * as auth from './procedures/auth';
import * as todoProcedures from './procedures/todos';
import * as admin from './procedures/admin';

/**
 * Main oRPC Router
 * Combines all procedure modules
 */
export const router = os.router({
  // Authentication
  auth: {
    login: auth.login,
    register: auth.register,
    getCurrentUser: auth.getCurrentUser,
  },
  
  // Todos
  todos: {
    getTodos: todoProcedures.getTodos,
    getTodo: todoProcedures.getTodo,
    createTodo: todoProcedures.createTodo,
    updateTodo: todoProcedures.updateTodo,
    deleteTodo: todoProcedures.deleteTodo,
    toggleTodo: todoProcedures.toggleTodo,
  },
  
  // Admin
  admin: {
    getAllUsers: admin.getAllUsers,
    getUserWithTodos: admin.getUserWithTodos,
    updateUserRole: admin.updateUserRole,
    deleteTodoAdmin: admin.deleteTodoAdmin,
    getSystemStats: admin.getSystemStats,
  },
});

export type AppRouter = typeof router;