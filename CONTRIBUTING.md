# Contributing Guide

Thank you for considering contributing to this project! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)

---

## Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Welcome beginners** and help them learn
- **Give constructive feedback**, not criticism
- **Accept different viewpoints** gracefully
- **Focus on what's best** for the project and community

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information
- Political or off-topic discussions in project spaces
- Any conduct which could reasonably be considered inappropriate

---

## How Can I Contribute?

### Reporting Bugs

**Before submitting**:
1. Check if the bug has already been reported
2. Try to reproduce on latest version
3. Gather as much information as possible

**When reporting**:
```markdown
**Describe the bug**
A clear and concise description.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**:
 - OS: [e.g. macOS 14.2]
 - Node: [e.g. 22.1.0]
 - pnpm: [e.g. 9.12.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Features

**Before suggesting**:
1. Check if the feature has already been proposed
2. Consider if it fits the project's scope
3. Think about how it benefits most users

**When suggesting**:
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
Clear and concise description of what you want.

**Describe alternatives you've considered**
Other solutions or features you've thought about.

**Additional context**
Mockups, examples, or other context.
```

### Improving Documentation

Documentation improvements are always welcome!

- Fix typos or unclear explanations
- Add examples or clarifications
- Improve code comments
- Write blog posts or tutorials

**No issue required** for documentation fixes. Just submit a PR!

---

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9+
- Podman (or Docker)
- Git

### First-Time Setup

```bash
# 1. Fork the repository on GitLab

# 2. Clone your fork
git clone https://gitlab.com/YOUR-USERNAME/my-monorepo.git
cd my-monorepo

# 3. Add upstream remote
git remote add upstream https://gitlab.com/ORIGINAL-OWNER/my-monorepo.git

# 4. Install dependencies
pnpm install

# 5. Copy environment file
cp .env.example .env

# 6. Start development environment
make dev

# 7. Verify everything works
open http://localhost:3000
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Making Changes

### 1. Create a Branch

```bash
# Feature branch
git checkout -b feature/my-new-feature

# Bug fix branch
git checkout -b fix/issue-123

# Documentation branch
git checkout -b docs/improve-readme
```

**Branch naming conventions**:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Adding tests
- `chore/description` - Maintenance tasks

### 2. Make Your Changes

**Follow these guidelines**:

- Write clear, self-documenting code
- Add comments for complex logic
- Update tests if needed
- Update documentation if needed
- Keep commits focused and atomic

### 3. Write Good Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(api): add todo sharing endpoint

- Add shareTodo procedure
- Update database schema
- Add tests

Closes #123
```

```bash
fix(auth): resolve login validation issue

The email validation was too strict and rejected valid emails with + symbols.

Fixes #456
```

```bash
docs(readme): improve quick start section

Made the setup instructions clearer for beginners.
```

### 4. Test Your Changes

**Before committing**:

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Test
pnpm test

# Build
pnpm build
```

**Or run all at once**:
```bash
pnpm check
```

---

## Pull Request Process

### 1. Push Your Branch

```bash
git push origin feature/my-new-feature
```

### 2. Create Pull Request

1. Go to GitLab
2. Click "Create merge request"
3. Fill out the template:

```markdown
## Description
What does this PR do? Why is it needed?

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to show visual changes.
```

### 3. Code Review

**Reviewers will check**:
- Code quality and style
- Tests and test coverage
- Documentation updates
- No breaking changes (or properly documented)
- Performance implications

**As a contributor**:
- Be responsive to feedback
- Make requested changes promptly
- Ask questions if unclear
- Be patient and respectful

### 4. Merge

Once approved, a maintainer will merge your PR. Thank you for contributing! 🎉

---

## Coding Standards

### TypeScript

```typescript
// ✅ Good
export async function getTodo(id: string): Promise<Todo> {
  const todo = await db.query.todos.findFirst({
    where: eq(todos.id, id),
  });
  
  if (!todo) {
    throw new Error('Todo not found');
  }
  
  return todo;
}

// ❌ Bad
export async function getTodo(id) {
  return await db.query.todos.findFirst({
    where: eq(todos.id, id),
  });
}
```

**Rules**:
- Always use TypeScript, never `any`
- Explicit return types for exported functions
- Prefer `const` over `let`
- Use meaningful variable names
- Keep functions small and focused

### React

```typescript
// ✅ Good
interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoCard({ todo, onToggle, onDelete }: TodoCardProps) {
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

// ❌ Bad
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

**Rules**:
- Function components only
- Named exports (not default)
- Props interface defined above component
- Destructure props in parameters

### File Organization

```
packages/database/
├── src/
│   ├── schema.ts          # Database schemas
│   ├── client.ts          # Database client
│   ├── utils.ts           # Utility functions
│   ├── seed.ts            # Seed script
│   └── __tests__/         # Tests
│       └── utils.test.ts
├── package.json
└── tsconfig.json
```

**Rules**:
- Tests live in `__tests__/` folders
- One export per file (except barrel files)
- Related files grouped together

---

## Project Structure

Understanding the project structure helps you contribute effectively.

### Monorepo Layout

```
my-monorepo/
├── apps/                    # Deployable applications
│   ├── web/                # TanStack Start app
│   └── python-service/     # FastAPI service
├── packages/               # Shared packages
│   ├── database/          # Drizzle ORM
│   ├── orpc-api/          # oRPC procedures
│   └── ui/                # React components
├── deploy/                # Kubernetes manifests
├── docs/                  # Documentation
├── .gitlab-ci.yml        # CI/CD pipeline
├── turbo.json            # Turborepo config
└── package.json          # Root package
```

### Key Files

- **`package.json`** - Defines scripts and dependencies
- **`turbo.json`** - Turborepo pipeline configuration
- **`pnpm-workspace.yaml`** - Workspace packages
- **`.env.example`** - Environment variables template
- **`Makefile`** - Common commands

---

## Adding New Features

### Example: Add "Comments on Todos"

#### 1. Plan the Feature

- Database: Add `comments` table
- API: Add CRUD procedures
- Frontend: Add comment UI

#### 2. Database Changes

```typescript
// packages/database/src/schema.ts
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  todoId: uuid('todo_id').references(() => todos.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

```bash
pnpm db:push
```

#### 3. API Procedures

```typescript
// packages/orpc-api/src/procedures/comments.ts
export const getComments = procedure
  .input(z.object({ todoId: z.string().uuid() }))
  .handler(async ({ input }) => {
    return await db.query.comments.findMany({
      where: eq(comments.todoId, input.todoId),
      with: { user: true },
    });
  });

export const createComment = procedure
  .input(z.object({
    todoId: z.string().uuid(),
    userId: z.string().uuid(),
    text: z.string().min(1),
  }))
  .handler(async ({ input }) => {
    const [comment] = await db.insert(comments)
      .values(input)
      .returning();
    return comment;
  });
```

Add to router:

```typescript
// packages/orpc-api/src/router.ts
export const appRouter = router({
  // ...
  comments: {
    getComments,
    createComment,
  },
});
```

#### 4. Frontend

```typescript
// apps/web/app/components/CommentsList.tsx
export function CommentsList({ todoId }: { todoId: string }) {
  const { data: comments } = useQuery({
    queryKey: ['comments', todoId],
    queryFn: () => orpcClient.comments.getComments({ todoId }),
  });
  
  return (
    <div>
      {comments?.map(comment => (
        <div key={comment.id}>
          <p>{comment.text}</p>
          <small>By {comment.user.name}</small>
        </div>
      ))}
    </div>
  );
}
```

#### 5. Tests

```typescript
// packages/orpc-api/src/procedures/__tests__/comments.test.ts
describe('comments', () => {
  it('should create comment', async () => {
    const comment = await createComment.handler({
      input: {
        todoId: 'test-todo-id',
        userId: 'test-user-id',
        text: 'Test comment',
      },
    });
    
    expect(comment.text).toBe('Test comment');
  });
});
```

#### 6. Documentation

Update relevant docs:
- Add to FAQ if it's a common request
- Update development guide with example
- Add to GETTING-STARTED if it affects setup

---

## Questions?

- 💬 **Slack**: #engineering channel
- 📧 **Email**: engineering@company.com
- 🐛 **Issues**: Create a GitLab issue
- 📖 **Docs**: Check [DEVELOPMENT.md](./DEVELOPMENT.md)

Thank you for contributing! 🙏
