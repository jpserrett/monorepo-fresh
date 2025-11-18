# Quick Start Checklist

Use this checklist for your first time setting up the project.

## ☑️ Pre-Setup

- [ ] Read the [README.md](./README.md) overview
- [ ] Check you have enough disk space (~2GB)
- [ ] Stable internet connection

## ☑️ Prerequisites

- [ ] **Node.js 22+** installed
  ```bash
  node --version  # Should be 22.x or higher
  ```
  
- [ ] **pnpm** installed
  ```bash
  pnpm --version  # Should be 9.x or higher
  ```
  
- [ ] **Podman** or Docker installed
  ```bash
  podman --version  # Or: docker --version
  ```
  
- [ ] **Git** installed
  ```bash
  git --version
  ```

❌ Missing something? See [GETTING-STARTED.md](./docs/GETTING-STARTED.md) for installation instructions.

## ☑️ Initial Setup

- [ ] Clone the repository
  ```bash
  git clone <your-repo-url>
  cd my-monorepo
  ```

- [ ] Run setup script (recommended)
  ```bash
  ./setup.sh
  ```
  
  **OR** do manual setup:
  
  - [ ] Copy environment file
    ```bash
    cp .env.example .env
    ```
  
  - [ ] Install dependencies
    ```bash
    pnpm install
    ```

## ☑️ Start Development

- [ ] Start Podman machine (if using Podman)
  ```bash
  podman machine start
  ```

- [ ] Start all services
  ```bash
  make dev
  ```
  
  This will:
  - Start PostgreSQL database
  - Start Python service  
  - Push database schema
  - Seed demo data
  - Start web application

- [ ] Wait for startup (30-60 seconds)
  ```
  You should see:
  ✓ Database started
  ✓ Python service started
  ✓ Schema pushed
  ✓ Data seeded
  ✓ Web app running on http://localhost:3000
  ```

## ☑️ Verify Everything Works

- [ ] Open browser to http://localhost:3000
- [ ] See the landing page
- [ ] Click "Login"
- [ ] Use demo account: `admin@demo.com` / `admin123`
- [ ] See dashboard with todos
- [ ] Try checking a todo
- [ ] Click "Admin Panel" button
- [ ] See user list

✅ **Success!** Everything is working.

## ☑️ Explore the Project

- [ ] Look at project structure
  ```bash
  tree -L 2 -I node_modules
  ```

- [ ] Check all packages
  ```bash
  ls apps/
  ls packages/
  ```

- [ ] Read code:
  - [ ] Database schema: `packages/database/src/schema.ts`
  - [ ] API procedures: `packages/orpc-api/src/procedures/`
  - [ ] Frontend routes: `apps/web/app/routes/`

## ☑️ Make Your First Change

**Goal**: Change the landing page title

- [ ] Open `apps/web/app/routes/index.tsx`

- [ ] Find line with "Welcome to Todo App"

- [ ] Change to "Welcome to My App"

- [ ] Save file

- [ ] Browser should auto-reload (Hot Module Replacement)

- [ ] See your change immediately!

✅ **You just made your first change!**

## ☑️ Learn More

Now that everything works, dive deeper:

- [ ] Read [DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Learn daily workflows
- [ ] Read [FAQ.md](./docs/FAQ.md) - Understand technology choices
- [ ] Explore the code - See how everything connects
- [ ] Try adding a feature - Follow guides in DEVELOPMENT.md

## 🚨 Troubleshooting

**Something not working?**

1. **Check the terminal** for error messages
2. **Read error carefully** - often tells you what's wrong
3. **Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues
4. **Run status check**:
   ```bash
   make status
   ```

## 💡 Tips

### Useful Commands

```bash
make dev          # Start everything
make stop         # Stop everything  
make logs         # View logs
make reset        # Reset database
make clean        # Clean build artifacts
```

### Keyboard Shortcuts

- **Ctrl+C** - Stop running process
- **Cmd+Click** (VS Code) - Jump to definition
- **Cmd+P** (VS Code) - Quick file open

### Getting Unstuck

1. **Stop everything**: `make stop`
2. **Clean everything**: `make clean`
3. **Start fresh**: `make dev`

This solves 90% of issues!

## ✅ You're Ready!

Congratulations! You've successfully:

- ✅ Set up the development environment
- ✅ Started all services
- ✅ Verified everything works
- ✅ Made your first code change
- ✅ Learned basic commands

**Next steps**:
- Build features (see DEVELOPMENT.md)
- Read the codebase
- Ask questions in #engineering Slack

---

**Happy coding! 🚀**
