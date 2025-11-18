# Getting Started Guide

This guide will walk you through setting up the development environment **from scratch**. No prior knowledge assumed!

**Estimated time**: 30-45 minutes (including downloads)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing Required Tools](#installing-required-tools)
3. [Cloning the Project](#cloning-the-project)
4. [Setting Up Environment Variables](#setting-up-environment-variables)
5. [Starting the Application](#starting-the-application)
6. [Verifying Everything Works](#verifying-everything-works)
7. [Next Steps](#next-steps)

---

## Prerequisites

Before you start, you need to install several tools on your computer. Don't worry if you've never heard of these - we'll explain everything!

### What You Need

| Tool | What It Is | Why We Need It | Time |
|------|-----------|----------------|------|
| **Node.js** | JavaScript runtime | Runs our frontend and API | 5 min |
| **pnpm** | Package manager | Installs dependencies faster | 2 min |
| **Podman** | Container runtime | Runs Postgres database locally | 10 min |
| **Git** | Version control | Downloads code | 5 min |

**Total setup time: ~30 minutes** (including downloads)

---

## Installing Required Tools

### Step 1: Install Node.js

**What is Node.js?**  
Node.js lets you run JavaScript code outside of a web browser. We use it to run our API server and build tools.

#### macOS Installation

**Option A: Using Homebrew (Recommended)**

```bash
# If you don't have Homebrew, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@22
```

**Option B: Direct Download**

1. Go to: https://nodejs.org/
2. Download the "LTS" version (v22.x.x)
3. Open the downloaded file and follow the installer

#### Verify Installation

```bash
node --version
# Expected: v22.x.x (any version starting with 22 is fine)

npm --version
# Expected: 10.x.x (comes with Node.js)
```

#### Troubleshooting

❌ **"command not found: node"**
- Solution: Close and reopen your terminal, then try again
- If still not working: Restart your computer

❌ **Version is older than 22**
- Solution: Uninstall old version first
- macOS: `brew uninstall node`, then reinstall Node.js 22

---

### Step 2: Install pnpm

**What is pnpm?**  
pnpm is a faster, more efficient version of npm (Node Package Manager). It installs project dependencies and saves disk space by sharing packages.

#### Installation (All Platforms)

```bash
# Enable corepack (comes with Node.js)
corepack enable

# Activate pnpm
corepack prepare pnpm@latest --activate
```

#### Verify Installation

```bash
pnpm --version
# Expected: 9.x.x or higher
```

#### Troubleshooting

❌ **"command not found: corepack"**
- Solution: Update Node.js to version 20 or higher
- Run: `brew upgrade node` (macOS)

❌ **"command not found: pnpm"**
- Solution: Close and reopen terminal, then try `pnpm --version`

---

### Step 3: Install Podman

**What is Podman?**  
Podman runs containers - isolated environments for running software. We use it to run a PostgreSQL database on your computer without installing Postgres directly.

**Why Podman instead of Docker?**
- Free and open source (no licensing issues)
- Rootless by default (more secure)
- Works on closed networks
- Compatible with Docker commands

#### macOS Installation

1. **Install Podman:**
   ```bash
   brew install podman
   ```

2. **Initialize Podman Machine:**
   ```bash
   # Create a virtual machine for Podman
   podman machine init
   
   # Start the machine
   podman machine start
   ```
   
   **What just happened?**  
   Podman created a small Linux VM to run containers (macOS needs this).

3. **Install podman-compose:**
   ```bash
   # Install pip3 if you don't have it
   brew install python3
   
   # Install podman-compose
   pip3 install podman-compose
   ```

#### Verify Installation

```bash
podman --version
# Expected: podman version 4.x.x or higher

podman machine list
# Expected: Shows a running machine

podman-compose --version
# Expected: podman-compose version 1.x.x
```

#### Troubleshooting

❌ **"Cannot connect to Podman"**
- Solution: Run `podman machine start`
- Wait 30 seconds and try again
- Check status: `podman machine list` (should show "running")

❌ **"podman-compose: command not found"**
- Solution: Run `pip3 install --user podman-compose`
- Add to PATH: `export PATH="$HOME/Library/Python/3.x/bin:$PATH"`
- Add that line to `~/.zshrc` to make it permanent

❌ **Podman machine won't start**
- Solution: Remove old machine and recreate
  ```bash
  podman machine stop
  podman machine rm
  podman machine init
  podman machine start
  ```

---

### Step 4: Verify Git is Installed

**What is Git?**  
Git tracks changes to code and lets you download projects from GitLab/GitHub.

#### Check if you have Git

```bash
git --version
# Expected: git version 2.x.x
```

#### If you don't have Git

macOS:
```bash
brew install git
```

Or download from: https://git-scm.com/downloads

#### Verify

```bash
git --version
# Expected: git version 2.x.x
```

---

## Cloning the Project

**What is "cloning"?**  
Cloning means downloading a copy of the project code to your computer.

### Steps

1. **Open Terminal**
   - macOS: Applications → Utilities → Terminal
   - Or: Cmd+Space, type "Terminal"

2. **Navigate to where you want the project:**
   ```bash
   # Go to your home directory
   cd ~
   
   # Create a "projects" folder if you don't have one
   mkdir -p projects
   
   # Go into that folder
   cd projects
   
   # Check where you are
   pwd
   # Should show: /Users/your-username/projects
   ```

3. **Clone the repository:**
   ```bash
   # TODO: Replace with your actual GitLab URL
   git clone https://gitlab.your-company.com/your-team/my-monorepo.git
   
   # Go into the project folder
   cd my-monorepo
   
   # List files to verify
   ls
   # Should show: apps/ packages/ docs/ etc.
   ```

**What just happened?**  
You now have a folder called `my-monorepo` with all the project code inside.

---

## Setting Up Environment Variables

**What are environment variables?**  
Environment variables are configuration values that tell the application how to connect to databases, APIs, and other services. They're kept separate from the code for security.

### Step 1: Copy the Example File

```bash
# Make sure you're in the project folder
cd ~/projects/my-monorepo

# Check you're in the right place
pwd
# Should show: /Users/your-username/projects/my-monorepo

# Copy the example file
cp .env.example .env

# Verify it was created
ls -la .env
# Should show the .env file
```

**What just happened?**  
You created a `.env` file from the template. This file contains YOUR specific configuration.

### Step 2: Edit the Environment Variables

**Open the `.env` file:**

```bash
# Option 1: Open with default text editor
open .env

# Option 2: Use nano (command-line editor)
nano .env

# Option 3: Use VS Code (if installed)
code .env
```

### Step 3: Verify Your .env File

**For local development, your `.env` should look like this:**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
PYTHON_SERVICE_URL="http://localhost:8000"
NODE_ENV="development"
LOG_LEVEL="info"
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"
```

**⚠️ Important for Local Development:**

- **DO NOT CHANGE** `DATABASE_URL` - it matches the settings in `compose.yaml`
- **DO NOT CHANGE** `PYTHON_SERVICE_URL` - it matches the Python service port
- The `SESSION_SECRET` can stay as-is for local dev (change in production)

**When to Change Values:**

| Variable | When to Change | How to Get the Value |
|----------|---------------|---------------------|
| `DATABASE_URL` | Production deployment | Ask your DBA or check AWS RDS console |
| `PYTHON_SERVICE_URL` | Production deployment | Ask DevOps team for the service URL |
| `SESSION_SECRET` | Production deployment | Generate: `openssl rand -base64 32` |
| `NODE_ENV` | Almost never | Should be "development" locally |

**⚠️ Critical:**

- The `.env` file is in `.gitignore` - it will NOT be committed to Git
- Never share your `.env` file with anyone
- Each developer has their own `.env` file
- Never commit secrets to Git!

---

## Starting the Application

Now that everything is installed and configured, let's start the app!

### Option 1: One Command (Recommended for First Time)

```bash
# Make sure you're in the project folder
cd ~/projects/my-monorepo

# Start everything
make dev
```

**What this command does:**

1. ✅ Stops any running services
2. ✅ Starts Postgres database
3. ✅ Starts Python microservice
4. ✅ Installs all dependencies (2-5 minutes first time)
5. ✅ Creates database tables
6. ✅ Seeds demo data (7 users, 40 todos)
7. ✅ Starts development server

**What to expect:**

```
🚀 Starting development environment...

Step 1: Stopping any running services...
✓ Services stopped

Step 2: Starting infrastructure...
[+] Running 2/2
 ✔ Container myapp-postgres         Started
 ✔ Container myapp-python-service   Started

Step 3: Waiting for Postgres...
✓ Postgres is ready

Step 4: Installing dependencies...
Progress: resolved 1423, reused 1200...
✓ Dependencies installed

Step 5: Setting up database...
✓ Database schema pushed

Step 6: Seeding demo data...
🌱 Seeding database...
✓ Created 7 users
✓ Created 40 todos

✅ Ready! Starting development server...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌐 Web app: http://localhost:3000
  🐍 Python:  http://localhost:8000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> turbo dev

• Packages in scope: web, orpc-api, database, ui
• Running dev in 4 packages

web:dev: ▲ TanStack Start dev server running
```

**This will take 5-10 minutes the first time** (downloading Docker images, installing packages). Subsequent starts will be much faster!

### Option 2: Manual Steps (Understanding Each Step)

If you want to understand what's happening, follow these steps:

#### 2.1. Start Infrastructure Services

```bash
# Start Postgres and Python service
podman-compose up -d
```

**What `-d` means:** "Detached mode" - runs in background

**Expected output:**
```
[+] Running 2/2
 ✔ Container myapp-postgres         Started
 ✔ Container myapp-python-service   Started
```

**Verify services are running:**
```bash
podman-compose ps
```

**Expected output:**
```
NAME                    STATUS    PORTS
myapp-postgres          Up        0.0.0.0:5432->5432/tcp
myapp-python-service    Up        0.0.0.0:8000->8000/tcp
```

#### 2.2. Install Dependencies

```bash
pnpm install
```

**What to expect:**
- Takes 2-5 minutes first time
- Lots of text scrolling - that's normal!
- When done: "✓ Done in X.XXs"

#### 2.3. Setup Database

```bash
pnpm db:push
```

**What this does:** Creates all database tables

**Expected output:**
```
✓ Database schema pushed successfully
✓ Tables created: users, todos
```

#### 2.4. Seed Demo Data

```bash
pnpm db:seed
```

**What this does:** Adds demo users and todos to database

**Expected output:**
```
🌱 Seeding database...
✓ Created 7 users
✓ Created 40 todos

🔑 Demo Accounts:
Admin: admin@demo.com / admin123
User:  user@demo.com  / user123
```

#### 2.5. Start Development Server

```bash
pnpm dev
```

**Expected output:**
```
• Packages in scope: web, orpc-api, database, ui
• Running dev in 4 packages

web:dev: ▲ TanStack Start dev server running on http://localhost:3000
```

**Keep this terminal open!** The application runs here.

---

## Verifying Everything Works

### Step 1: Open the Web Application

1. **Open your browser** (Chrome, Firefox, Safari, etc.)
2. **Go to:** http://localhost:3000

**What you should see:**
- A login page with email and password fields
- "Login" and "Register" options

**If you see this: ✅ Success! The app is running**

### Step 2: Login and Test

1. **Enter credentials:**
   - Email: `user@demo.com`
   - Password: `user123`

2. **Click "Login"**

**What should happen:**
- You're redirected to the dashboard
- You see a list of todos
- Some are completed (✓), some are pending
- You see your name in the header

**✅ This proves: Frontend → API → Database is working!**

### Step 3: Create a Todo

1. **Click "New Todo" or "+"**
2. **Fill in the form:**
   - Title: "Test my first todo"
   - Description: "This is a test"
   - Priority: High

3. **Click "Create"**

**What should happen:**
- Todo appears in your list immediately
- No page reload (React is working!)
- Todo is saved to database

**✅ This proves: Full CRUD operations work!**

### Step 4: Test Admin Access

1. **Try to visit:** http://localhost:3000/admin

**What should happen:**
- You see "Access Denied" or are redirected
- Message: "Admin access required"

**✅ This proves: Role-based access control works!**

2. **Logout and login as admin:**
   - Email: `admin@demo.com`
   - Password: `admin123`

3. **Visit:** http://localhost:3000/admin

**What should happen:**
- You see the admin dashboard
- List of all users
- User statistics

**✅ This proves: Admin features work!**

### Step 5: Check API Documentation

1. **Open:** http://localhost:8000/docs

**What you should see:**
- Interactive API documentation (Swagger UI)
- List of endpoints: `/analyze`, `/process-image`
- Ability to test endpoints

**✅ This proves: Python service is running!**

### Step 6: Verify Database

```bash
# In a new terminal, connect to database
make shell-db
```

**Inside the database shell:**
```sql
-- List all tables
\dt

-- Count users
SELECT COUNT(*) FROM users;
-- Should show: 7

-- Count todos
SELECT COUNT(*) FROM todos;
-- Should show: ~40

-- Exit
\q
```

**✅ If all of this works, you're fully set up!**

---

## Next Steps

### 🎉 Congratulations! You've successfully set up the development environment!

**What to do next:**

1. **Read the architecture docs:**
   ```bash
   open docs/ARCHITECTURE.md
   ```

2. **Learn the development workflow:**
   ```bash
   open docs/DEVELOPMENT.md
   ```

3. **Explore the codebase:**
   - `apps/web/` - Frontend application
   - `packages/orpc-api/` - API endpoints
   - `packages/database/` - Database schemas
   - `apps/python-service/` - Python microservice

4. **Try making a change:**
   - Edit `apps/web/app/routes/index.tsx`
   - Save the file
   - See it update automatically in your browser!

5. **Run tests:**
   ```bash
   pnpm test
   ```

6. **Build for production:**
   ```bash
   pnpm build
   ```

7. **See all available commands:**
   ```bash
   make help
   ```

---

## Common Operations

### Starting the App (After First Setup)

```bash
# Quick start
make start

# Or manually:
podman-compose up -d
pnpm dev
```

### Stopping the App

```bash
# Press Ctrl+C in the terminal where `pnpm dev` is running

# Then stop infrastructure:
make stop

# Or:
podman-compose down
```

### Restarting from Scratch

```bash
# Reset everything
make clean
make dev
```

### View Demo Accounts

```bash
make accounts
```

---

## Getting Help

**If something isn't working:**

1. **Check the troubleshooting guide:**
   ```bash
   open docs/TROUBLESHOOTING.md
   ```

2. **Check service logs:**
   ```bash
   # All logs
   make logs
   
   # Database logs
   make logs-db
   
   # Python service logs
   make logs-python
   ```

3. **Check service status:**
   ```bash
   make status
   ```

4. **Reset everything:**
   ```bash
   make fresh-start
   ```

5. **Ask your team:**
   - Post in #engineering Slack channel
   - Include error messages and what you tried

---

## FAQ

**Q: How do I stop the application?**

A: Press Ctrl+C in the terminal where `pnpm dev` is running, then run `make stop`

**Q: Do I need to keep the terminal open?**

A: Yes, while `pnpm dev` is running. If you close it, the app stops.

**Q: Can I use VS Code instead of terminal?**

A: Yes! Open the folder in VS Code and use the integrated terminal (View → Terminal).

**Q: What if I restart my computer?**

A: You'll need to start services again:
```bash
podman machine start
cd ~/projects/my-monorepo
make start
```

**Q: How much disk space does this need?**

A: Approximately:
- Node.js + pnpm: ~100MB
- Podman: ~500MB
- Project dependencies: ~500MB
- Database: ~50MB
- **Total: ~1.2GB**

**Q: Can I work offline?**

A: Yes, once everything is set up. The app runs entirely locally.

**Q: Where is the database data stored?**

A: In a Podman volume. To delete it: `podman-compose down -v`

---

**Next:** [Development Workflow](./DEVELOPMENT.md) →
