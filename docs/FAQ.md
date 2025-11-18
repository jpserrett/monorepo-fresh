# Frequently Asked Questions

## Table of Contents

- [Project Structure](#project-structure)
- [Technology Choices](#technology-choices)
- [Development Workflow](#development-workflow)
- [Database](#database)
- [Authentication](#authentication)
- [Python Service](#python-service)
- [Deployment](#deployment)
- [Performance](#performance)

---

## Project Structure

### What is a monorepo and why are we using one?

A monorepo is a repository that contains multiple projects/packages. We're using one because:

1. **Shared Code**: Common types, utilities, and configurations are shared across apps
2. **Atomic Changes**: Update API and frontend in a single commit
3. **Build Caching**: Turborepo caches builds, making rebuilds extremely fast
4. **Easier Refactoring**: Change shared code and see all affected apps immediately

**Example:**
```
packages/database/      ← Shared by web app AND Python service
packages/orpc-api/      ← Shared API logic
apps/web/               ← Frontend app
apps/python-service/    ← Backend service
```

---

### Why separate packages and apps?

- **`packages/`**: Code that's shared/reusable (database, API contracts)
- **`apps/`**: Deployable applications (web frontend, Python service)

This separation makes it clear what's a deployable artifact vs. shared code.

---

### Can I create more apps?

Yes! Common additions:

```bash
# Mobile app
apps/mobile/

# Admin dashboard
apps/admin/

# Marketing site
apps/marketing/

# Background worker
apps/worker/
```

Just add them to `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'apps/new-app'  ← Add your new app
```

---

## Technology Choices

### Why TanStack Start instead of Next.js?

**TanStack Start** (2024/2025) offers:
- Built-in routing, queries, and state management
- Better TypeScript integration
- Full-stack type safety with oRPC
- Lighter than Next.js
- More explicit data fetching

**Next.js** is great for:
- SEO-heavy sites
- Established ecosystem
- Vercel deployment

We chose TanStack Start for the superior DX and type safety.

---

### Why oRPC instead of tRPC?

**oRPC** provides:
- ✅ Built-in OpenAPI documentation (required by our company)
- ✅ Full type safety (like tRPC)
- ✅ Zod validation
- ✅ Easy to integrate with non-TypeScript clients

**tRPC** is great but:
- ❌ No built-in API documentation
- ❌ Requires custom OpenAPI generation
- ✅ More mature ecosystem

**Decision**: oRPC because automatic API docs are a company requirement.

---

### Why Drizzle ORM instead of Prisma?

**Drizzle**:
- ✅ SQL-like syntax (easier for SQL experts)
- ✅ Zero runtime overhead
- ✅ Better TypeScript inference
- ✅ PostgreSQL-first design

**Prisma**:
- ✅ More mature
- ✅ Prisma Studio (GUI)
- ❌ Heavier runtime
- ❌ Less PostgreSQL-specific features

**Decision**: Drizzle because our team knows SQL and we use PostgreSQL exclusively.

---

### Why Podman instead of Docker?

**Company Requirement**: We cannot use Docker Desktop on work machines.

**Podman**:
- Rootless containers (better security)
- Drop-in Docker replacement
- No daemon required
- Works with OpenShift

Most `docker` commands work by replacing with `podman`:
```bash
docker ps       → podman ps
docker-compose  → podman-compose
docker build    → podman build
```

---

### Why both TypeScript and Python?

**TypeScript** (90% of codebase):
- CRUD operations
- Business logic
- Frontend
- APIs

**Python** (10% of codebase):
- Machine learning
- AI models
- Image processing
- Data science tasks

**Reason**: Use the right tool for the job. TypeScript for web, Python for AI.

---

## Development Workflow

### Do I need to run `pnpm build` every time?

**No!** Use `pnpm dev` for development:

```bash
pnpm dev  # Auto-rebuilds on changes
```

Only use `pnpm build` when:
- Deploying to production
- Testing production builds
- CI/CD pipeline

---

### What's the difference between `pnpm dev` and `make dev`?

- **`pnpm dev`**: Starts only the web application
- **`make dev`**: Starts database, Python service, AND web application

**Use `make dev` when you need everything**. It's the "one command to rule them all."

---

### How do I add a new dependency?

```bash
# To a specific package
cd packages/database
pnpm add some-library

# To the root (workspace tools)
pnpm add -w -D some-tool

# To an app
cd apps/web
pnpm add react-icons
```

**Pro tip**: Always run `pnpm install` in root after adding dependencies.

---

### How do Turbo caching work?

Turborepo caches build outputs. If nothing changed, it uses the cache:

```bash
# First build: 30 seconds
pnpm turbo build

# Second build: instant (from cache)
pnpm turbo build
```

**Cache key**: Hash of source files + dependencies

**Force rebuild**:
```bash
pnpm turbo build --force
```

---

## Database

### How do I reset the database?

```bash
# Easy way
make reset

# Manual way
pnpm db:push --force
pnpm db:seed
```

**Warning**: This deletes all data!

---

### How do I add a new table?

1. **Edit `packages/database/src/schema.ts`**:
   ```typescript
   export const posts = pgTable('posts', {
     id: uuid('id').defaultRandom().primaryKey(),
     title: text('title').notNull(),
     content: text('content'),
     userId: uuid('user_id').references(() => users.id),
     createdAt: timestamp('created_at').defaultNow().notNull(),
   });
   ```

2. **Push to database**:
   ```bash
   pnpm db:push
   ```

3. **Types are auto-generated!** Use in your code:
   ```typescript
   import { posts } from '@repo/database/schema';
   ```

---

### Can I use raw SQL?

Yes! Drizzle supports raw SQL:

```typescript
import { sql } from 'drizzle-orm';

const result = await db.execute(
  sql`SELECT * FROM users WHERE email = ${email}`
);
```

---

### How do I see what's in the database?

```bash
# Option 1: Use psql
make shell-db
SELECT * FROM users;
\q

# Option 2: Use Prisma Studio (if installed)
pnpm studio

# Option 3: Use pgAdmin or TablePlus
# Connect to: localhost:5432, user: user, password: password
```

---

## Authentication

### How does authentication work?

1. User submits email/password
2. Backend validates with database
3. Password checked with bcrypt
4. Session created (stored in DB or Redis)
5. Session token returned in cookie
6. Frontend includes cookie in all requests

**Security features**:
- Passwords hashed with bcrypt (10 rounds)
- HttpOnly cookies (can't be accessed by JavaScript)
- CSRF protection
- Role-based access (user, admin)

---

### How do I add OAuth (Google, GitHub)?

You'll need to:

1. Install an auth library (e.g., `better-auth`, `lucia`)
2. Add OAuth provider credentials to `.env`
3. Create OAuth callback routes
4. Update database schema for OAuth tokens

**Future work**: This template doesn't include OAuth yet.

---

### How do I add a new role?

1. **Update enum in `packages/database/src/schema.ts`**:
   ```typescript
   export const userRoleEnum = pgEnum('user_role', [
     'user',
     'admin',
     'moderator',  // ← Add new role
   ]);
   ```

2. **Push changes**:
   ```bash
   pnpm db:push
   ```

3. **Update permissions in API**:
   ```typescript
   // packages/orpc-api/src/procedures/moderator.ts
   if (user.role !== 'moderator' && user.role !== 'admin') {
     throw new Error('Forbidden');
   }
   ```

---

## Python Service

### When should I use the Python service?

Use Python for:
- Machine learning inference
- AI models (transformers, computer vision)
- Heavy numerical computation
- Python-specific libraries

**Don't use Python for**:
- CRUD operations (use TypeScript/oRPC)
- Simple business logic
- Frontend logic

---

### How do I add a new Python endpoint?

1. **Edit `apps/python-service/main.py`**:
   ```python
   @app.post("/my-endpoint")
   async def my_endpoint(data: MyModel):
       # Your logic here
       return {"result": "success"}
   ```

2. **Rebuild container**:
   ```bash
   podman-compose up -d --build
   ```

3. **Call from frontend**:
   ```typescript
   const response = await fetch('http://localhost:8000/my-endpoint', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ data: 'test' }),
   });
   ```

---

### Can I use ML models in the Python service?

Yes! That's what it's for. Example:

```python
from transformers import pipeline

# Load model on startup
classifier = pipeline("sentiment-analysis")

@app.post("/analyze")
async def analyze(text: str):
    result = classifier(text)
    return result
```

**Warning**: ML models are large. Build a production Docker image and optimize.

---

## Deployment

### Where can I deploy this?

- **Recommended**: OpenShift (company standard)
- **Also works**: AWS ECS, GCP Cloud Run, Azure Container Apps, Kubernetes

**Requirements**:
- Container orchestration
- PostgreSQL database
- Persistent storage (optional)

---

### How do I deploy to production?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

**Quick version**:
```bash
# Build images
podman build -t myapp-web apps/web
podman build -t myapp-python apps/python-service

# Push to registry
podman push myapp-web registry.company.com/myapp-web
podman push myapp-python registry.company.com/myapp-python

# Deploy to OpenShift
oc apply -f deploy/
```

---

### How do I set up CI/CD?

1. **Configure GitLab CI variables**:
   - `TURBO_TOKEN`
   - `TURBO_API`
   - `TURBO_TEAM`
   - `OPENSHIFT_TOKEN`

2. **Push to GitLab**:
   ```bash
   git push origin main
   ```

3. **Pipeline runs automatically**:
   - Build → Test → Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

## Performance

### How fast should builds be?

**With Turbo cache**:
- First build: 20-30 seconds
- Subsequent builds (no changes): <1 second
- Incremental builds: 2-5 seconds

**Without cache** (CI):
- Full build: 1-2 minutes

---

### How do I speed up development?

1. **Use dev mode** (not build):
   ```bash
   pnpm dev  # Fast HMR
   ```

2. **Only build changed packages**:
   ```bash
   pnpm turbo build --filter=web
   ```

3. **Clear cache if stale**:
   ```bash
   pnpm clean
   ```

---

### How do I optimize bundle size?

1. **Analyze bundle**:
   ```bash
   pnpm build
   # Check output size
   ```

2. **Common optimizations**:
   - Tree-shaking (automatic)
   - Code splitting (automatic with TanStack)
   - Lazy load routes
   - Remove unused dependencies

3. **Check what's big**:
   ```bash
   cd apps/web
   pnpm add -D vite-plugin-bundle-analyzer
   ```

---

## Miscellaneous

### Can I use this template for my own project?

**Yes!** This template is designed to be copied and customized.

**To customize**:
1. Search and replace "myapp" with your app name
2. Update `package.json` names
3. Modify database schema
4. Add your features

---

### Is this production-ready?

**Almost!** Before production:

- [ ] Add proper authentication (OAuth, 2FA)
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Add error tracking (Sentry)
- [ ] Set up backups
- [ ] Configure rate limiting
- [ ] Add comprehensive tests
- [ ] Set up logging
- [ ] Security audit

---

### How do I contribute?

1. Create a feature branch
2. Make changes
3. Run tests: `pnpm test`
4. Create merge request
5. Get code review

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

### Who do I ask for help?

- **Questions**: #engineering Slack channel
- **Bugs**: Create GitLab issue
- **Urgent**: Ping @devops-team

---

## Still Have Questions?

Check other docs:
- [Getting Started](./GETTING-STARTED.md)
- [Development Guide](./DEVELOPMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Deployment](./DEPLOYMENT.md)
