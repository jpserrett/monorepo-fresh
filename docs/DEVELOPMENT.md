# Development Guide

This guide covers day-to-day development workflows for contributors.

## Table of Contents

- [Daily Workflow](#daily-workflow)
- [Adding Features](#adding-features)
- [Working with Database](#working-with-database)
- [Working with API](#working-with-api)
- [Working with Frontend](#working-with-frontend)
- [Testing](#testing)
- [Code Style](#code-style)
- [Git Workflow](#git-workflow)

---

## Daily Workflow

### Starting Your Day

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
pnpm install

# 3. Start development environment
make dev

# 4. Open your browser
# http://localhost:3000
```

### During Development

**Watch mode is automatic**: Changes to files trigger hot-reload.

- **Frontend changes**: Instant hot module replacement (HMR)
- **API changes**: Auto-restart on file save
- **Database changes**: Run `pnpm db:push` manually

### Ending Your Day

```bash
# Stop all services
make stop

# Or just Ctrl+C in the terminal
```

---

## Adding Features

### 1. Add a New API Endpoint

**Example**: Add a "share todo" feature

#### Step 1: Update Database Schema

```typescript
// packages/database/src/schema.ts
export const sharedTodos = pgTable('shared_todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  todoId: uuid('todo_id').references(() => todos.id).notNull(),
  sharedWithUserId: uuid('shared_with_user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### Step 2: Push Database Changes

```bash
pnpm db:push
```

#### Step 3: Add oRPC Procedure

```typescript
// packages/orpc-api/src/procedures/todos.ts
export const shareTodo = procedure
  .input(z.object({
    todoId: z.string().uuid(),
    userId: z.string().uuid(),
    shareWithUserId: z.string().uuid(),
  }))
  .handler(async ({ input }) => {
    const { todoId, userId, shareWithUserId } = input;
    
    // Verify ownership
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, todoId),
    });
    
    if (!todo || todo.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    // Create share
    const [share] = await db.insert(sharedTodos).values({
      todoId,
      sharedWithUserId: shareWithUserId,
    }).returning();
    
    return share;
  });
```

#### Step 4: Add to Router

```typescript
// packages/orpc-api/src/router.ts
export const appRouter = router({
  todos: {
    // ... existing procedures
    shareTodo,
  },
});
```

#### Step 5: Use in Frontend

```typescript
// apps/web/app/routes/dashboard.tsx
const handleShare = async (todoId: string, email: string) => {
  try {
    await orpcClient.todos.shareTodo({
      todoId,
      userId: currentUser.id,
      shareWithUserId: email, // Look up user by email first
    });
    alert('Todo shared!');
  } catch (error) {
    alert('Failed to share');
  }
};
```

---

### 2. Add a New Page/Route

**Example**: Add a "Settings" page

#### Step 1: Create Route File

```typescript
// apps/web/app/routes/settings.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/card';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings content here</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 2: Add Navigation Link

```typescript
// apps/web/app/routes/__root.tsx or dashboard.tsx
<Link to="/settings">
  <Button variant="ghost">Settings</Button>
</Link>
```

#### Step 3: Test

```bash
# Navigate to http://localhost:3000/settings
```

---

## Working with Database

### Adding a New Table

1. **Define schema**:
   ```typescript
   // packages/database/src/schema.ts
   export const categories = pgTable('categories', {
     id: uuid('id').defaultRandom().primaryKey(),
     name: text('name').notNull(),
     userId: uuid('user_id').references(() => users.id),
   });
   ```

2. **Push to database**:
   ```bash
   pnpm db:push
   ```

3. **Update seed script** (optional):
   ```typescript
   // packages/database/src/seed.ts
   await db.insert(categories).values([
     { name: 'Work', userId: adminUser.id },
     { name: 'Personal', userId: adminUser.id },
   ]);
   ```

### Querying Data

**Simple query**:
```typescript
const allTodos = await db.select().from(todos);
```

**With conditions**:
```typescript
import { eq } from 'drizzle-orm';

const userTodos = await db
  .select()
  .from(todos)
  .where(eq(todos.userId, userId));
```

**With relations**:
```typescript
const userWithTodos = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    todos: true,
  },
});
```

### Migrations vs Push

- **`pnpm db:push`**: For development (quick, no migration files)
- **`pnpm db:generate` + `pnpm db:migrate`**: For production (creates migration history)

**Production workflow**:
```bash
# Generate migration file
pnpm db:generate

# Review migration file in drizzle/migrations/

# Apply migration
pnpm db:migrate
```

---

## Working with API

### Adding Validation

oRPC uses Zod for validation:

```typescript
import { z } from 'zod';

export const updateTodo = procedure
  .input(z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(100),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dueDate: z.string().date().optional(),
  }))
  .handler(async ({ input }) => {
    // Input is fully typed and validated!
    const { id, title, priority, dueDate } = input;
    // ...
  });
```

### Error Handling

```typescript
export const getTodo = procedure
  .input(z.object({ id: z.string().uuid() }))
  .handler(async ({ input }) => {
    const todo = await db.query.todos.findFirst({
      where: eq(todos.id, input.id),
    });
    
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    return todo;
  });
```

### Testing API Procedures

```typescript
// packages/orpc-api/src/procedures/__tests__/todos.test.ts
import { describe, it, expect } from 'vitest';
import { getTodos } from '../todos';

describe('getTodos', () => {
  it('should return user todos', async () => {
    const result = await getTodos.handler({
      input: { userId: 'test-user-id' },
    });
    
    expect(result).toBeInstanceOf(Array);
  });
});
```

---

## Working with Frontend

### Adding a Component

**Create in UI package** (if reusable):
```typescript
// packages/ui/src/dialog.tsx
export function Dialog({ children, title, open, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50">
      <div className="bg-white rounded-lg p-6">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

**Create in app** (if app-specific):
```typescript
// apps/web/app/components/TodoCard.tsx
export function TodoCard({ todo, onToggle, onDelete }) {
  return (
    <Card>
      <CardContent>
        <h3>{todo.title}</h3>
        <Button onClick={() => onToggle(todo.id)}>Toggle</Button>
        <Button onClick={() => onDelete(todo.id)}>Delete</Button>
      </CardContent>
    </Card>
  );
}
```

### Using TanStack Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function TodoList({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  
  // Fetch todos
  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos', userId],
    queryFn: () => orpcClient.todos.getTodos({ userId }),
  });
  
  // Create todo mutation
  const createTodo = useMutation({
    mutationFn: (title: string) => 
      orpcClient.todos.createTodo({ userId, title }),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos', userId] });
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {todos?.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </div>
  );
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm --filter @repo/database test
```

### Writing Tests

**Unit test example**:
```typescript
// packages/database/src/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../utils';

describe('Password utils', () => {
  it('should hash and verify password', async () => {
    const password = 'secret123';
    const hashed = await hashPassword(password);
    
    expect(hashed).not.toBe(password);
    expect(await verifyPassword(password, hashed)).toBe(true);
  });
});
```

**Integration test example**:
```typescript
// apps/web/__tests__/dashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from '../app/routes/dashboard';

describe('Dashboard', () => {
  it('should render welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });
});
```

---

## Code Style

### TypeScript

- **Use strict mode**: No `any` types
- **Prefer types over interfaces** for consistency
- **Use explicit return types** for public functions

**Good**:
```typescript
export function getTodo(id: string): Promise<Todo> {
  return db.query.todos.findFirst({
    where: eq(todos.id, id),
  });
}
```

**Bad**:
```typescript
export function getTodo(id) {
  return db.query.todos.findFirst({
    where: eq(todos.id, id),
  });
}
```

### React

- **Prefer function components** over class components
- **Use hooks** for state and side effects
- **Extract reusable logic** into custom hooks

**Good**:
```typescript
function useTodos(userId: string) {
  return useQuery({
    queryKey: ['todos', userId],
    queryFn: () => orpcClient.todos.getTodos({ userId }),
  });
}

function Dashboard() {
  const { data: todos } = useTodos(userId);
  return <div>{todos?.length} todos</div>;
}
```

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `TodoCard.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Routes**: `lowercase.tsx` (e.g., `dashboard.tsx`)
- **Constants**: `UPPER_SNAKE_CASE.ts` (e.g., `API_URLS.ts`)

---

## Git Workflow

### Branch Naming

- **Features**: `feature/add-todo-sharing`
- **Bugs**: `fix/login-validation`
- **Refactor**: `refactor/api-error-handling`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add todo sharing functionality
fix: resolve login validation issue
docs: update API documentation
refactor: simplify error handling
test: add unit tests for auth
```

### Creating a Feature

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add my feature"

# 3. Push branch
git push origin feature/my-feature

# 4. Create merge request in GitLab
```

### Before Committing

```bash
# Run checks
pnpm typecheck
pnpm lint
pnpm test

# Or use the all-in-one command
pnpm check
```

---

## Common Tasks

### Update Dependencies

```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update react react-dom
```

### Clean Build Artifacts

```bash
# Clean everything
make clean

# Or manually
rm -rf node_modules
rm -rf .turbo
pnpm install
```

### Reset Database

```bash
# Reset with seed data
make reset

# Or manually
pnpm db:push --force
pnpm db:seed
```

### View Logs

```bash
# View all logs
make logs

# View specific service
podman logs myapp-postgres
podman logs myapp-python-service
```

---

## Tips & Tricks

### Fast Feedback Loop

```bash
# Terminal 1: Watch mode for specific package
cd packages/database
pnpm test:watch

# Terminal 2: Dev server
pnpm dev
```

### Debug Node.js

```bash
# Add to package.json script
"dev:debug": "node --inspect-brk ..."

# Then attach VS Code debugger
```

### Use TypeScript Utilities

```typescript
// Get type from Drizzle schema
type Todo = typeof todos.$inferSelect;
type NewTodo = typeof todos.$inferInsert;

// Partial updates
type TodoUpdate = Partial<Todo>;
```

### oRPC Client Type Safety

```typescript
// oRPC client has full type safety
import { appRouter } from '@repo/orpc-api';

type AppRouter = typeof appRouter;

// Use RouterOutput for response types
import type { RouterOutput } from '@orpc/server';

type Todo = RouterOutput<AppRouter>['todos']['getTodo'];
```

---

## Need Help?

- **Stuck?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Questions?** See [FAQ.md](./FAQ.md)
- **Setup issues?** Review [GETTING-STARTED.md](./GETTING-STARTED.md)
