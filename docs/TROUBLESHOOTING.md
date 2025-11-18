# Troubleshooting Guide

Common issues and their solutions.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Podman/Container Issues](#podmancontainer-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Production Issues](#production-issues)

---

## Installation Issues

### ❌ "command not found: node"

**Problem:** Node.js is not installed or not in PATH

**Solutions:**

1. **Verify installation:**
   ```bash
   which node
   # If empty, Node.js is not installed
   ```

2. **Install Node.js:**
   ```bash
   # macOS
   brew install node@22
   ```

3. **Restart terminal:**
   Close and reopen your terminal, then try again

4. **Add to PATH manually:**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export PATH="/usr/local/bin:$PATH"
   source ~/.zshrc
   ```

---

### ❌ "command not found: pnpm"

**Problem:** pnpm is not installed

**Solutions:**

```bash
# Enable corepack
corepack enable

# Install pnpm
corepack prepare pnpm@latest --activate

# Verify
pnpm --version
```

If still not working:
```bash
# Install globally
npm install -g pnpm

# Or use Homebrew
brew install pnpm
```

---

### ❌ "Cannot connect to Podman"

**Problem:** Podman machine is not running

**Solutions:**

```bash
# Start Podman machine
podman machine start

# Check status
podman machine list

# If no machine exists:
podman machine init
podman machine start
```

---

## Database Issues

### ❌ "Connection refused" to database

**Problem:** PostgreSQL is not running

**Solutions:**

1. **Check if Postgres container is running:**
   ```bash
   podman-compose ps
   ```

2. **If not running, start it:**
   ```bash
   podman-compose up -d
   ```

3. **Wait for database to be ready:**
   ```bash
   # Check logs
   podman logs myapp-postgres
   
   # Should see: "database system is ready to accept connections"
   ```

4. **Verify connection:**
   ```bash
   # Test connection
   podman exec myapp-postgres pg_isready -U user -d mydb
   ```

---

### ❌ "relation does not exist" error

**Problem:** Database tables haven't been created

**Solution:**

```bash
# Push database schema
pnpm db:push

# Verify tables were created
make shell-db
\dt
\q
```

---

### ❌ "password authentication failed"

**Problem:** Database credentials don't match

**Solution:**

1. **Check your `.env` file:**
   ```bash
   cat .env | grep DATABASE_URL
   ```

2. **Should be:**
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   ```

3. **If different, update to match `compose.yaml`:**
   ```bash
   # Default local credentials
   user: user
   password: password
   database: mydb
   ```

4. **Restart if you changed anything:**
   ```bash
   podman-compose down
   podman-compose up -d
   pnpm dev
   ```

---

## Podman/Container Issues

### ❌ "port is already allocated"

**Problem:** Port 5432 or 8000 is already in use

**Solutions:**

1. **Find what's using the port:**
   ```bash
   lsof -i :5432
   lsof -i :8000
   ```

2. **Stop the conflicting service:**
   ```bash
   # If it's an old container:
   podman ps -a
   podman stop CONTAINER_ID
   podman rm CONTAINER_ID
   ```

3. **Or change ports in `compose.yaml`:**
   ```yaml
   ports:
     - "5433:5432"  # Use 5433 on host instead
   ```

---

### ❌ Container keeps restarting

**Problem:** Container crashes on startup

**Solutions:**

1. **Check logs:**
   ```bash
   podman logs myapp-postgres
   podman logs myapp-python-service
   ```

2. **Common causes:**
   - Missing environment variables
   - Insufficient resources
   - Application error

3. **Restart with fresh state:**
   ```bash
   podman-compose down -v  # ⚠️ Deletes data!
   podman-compose up -d
   ```

---

### ❌ "no space left on device"

**Problem:** Disk space full

**Solutions:**

```bash
# Clean up Podman images and containers
podman system prune -a

# Remove unused volumes
podman volume prune

# Check disk usage
df -h
```

---

## Build Issues

### ❌ Turbo build fails

**Problem:** Build errors in packages

**Solutions:**

1. **Clean and rebuild:**
   ```bash
   pnpm clean
   pnpm install
   pnpm build
   ```

2. **Check for TypeScript errors:**
   ```bash
   pnpm typecheck
   ```

3. **Clear Turbo cache:**
   ```bash
   rm -rf .turbo
   pnpm build --force
   ```

---

### ❌ "Module not found" errors

**Problem:** Dependencies not installed

**Solutions:**

```bash
# Reinstall all dependencies
pnpm install --frozen-lockfile

# If that doesn't work:
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

### ❌ TypeScript errors

**Problem:** Type mismatches or missing types

**Solutions:**

1. **Regenerate types:**
   ```bash
   pnpm db:push  # Regenerates database types
   ```

2. **Check for errors:**
   ```bash
   pnpm typecheck
   ```

3. **Restart TypeScript server in VS Code:**
   - Cmd+Shift+P
   - "TypeScript: Restart TS Server"

---

## Runtime Issues

### ❌ Page won't load

**Problem:** Development server not running or errors

**Solutions:**

1. **Check if server is running:**
   ```bash
   # Should see process listening on port 3000
   lsof -i :3000
   ```

2. **Check terminal for errors:**
   Look at the terminal where you ran `pnpm dev`

3. **Restart dev server:**
   - Press Ctrl+C
   - Run `pnpm dev` again

4. **Check environment variables:**
   ```bash
   cat .env
   # Should have DATABASE_URL, etc.
   ```

---

### ❌ Authentication not working

**Problem:** Can't login with demo accounts

**Solutions:**

1. **Verify database has data:**
   ```bash
   make shell-db
   SELECT * FROM users;
   \q
   ```

2. **Reseed database:**
   ```bash
   pnpm db:reset
   ```

3. **Try demo accounts:**
   - admin@demo.com / admin123
   - user@demo.com / user123

---

### ❌ API calls failing

**Problem:** Frontend can't reach API

**Solutions:**

1. **Check browser console:**
   - F12 → Console tab
   - Look for red errors

2. **Check network tab:**
   - F12 → Network tab
   - Try the action again
   - Look for failed requests (red)

3. **Verify API is running:**
   ```bash
   # Check Python service
   curl http://localhost:8000/health
   
   # Should return: {"status":"healthy"}
   ```

4. **Check CORS issues:**
   If you see CORS errors, verify `CORS_ORIGINS` in `.env`

---

## Production Issues

### ❌ Deployment fails in CI/CD

**Problem:** GitLab pipeline fails

**Solutions:**

1. **Check pipeline logs:**
   - Go to GitLab → CI/CD → Pipelines
   - Click on failed pipeline
   - Check which job failed

2. **Common causes:**
   - Missing CI/CD variables
   - Build errors
   - Test failures
   - Deployment auth issues

3. **Test locally:**
   ```bash
   # Run same commands as CI
   pnpm install
   pnpm turbo build
   pnpm turbo test
   ```

---

### ❌ OpenShift pods not starting

**Problem:** Pods in CrashLoopBackOff or Error state

**Solutions:**

```bash
# Check pod status
oc get pods

# Describe pod for details
oc describe pod POD_NAME

# Check logs
oc logs POD_NAME

# Common issues:
# - Image pull error → Check registry credentials
# - Missing secrets → Check: oc get secrets
# - Database connection → Check DATABASE_URL
```

---

### ❌ Application works locally but not in production

**Problem:** Environment differences

**Solutions:**

1. **Compare environment variables:**
   ```bash
   # Local
   cat .env
   
   # Production
   oc get secret app-secrets -o yaml
   ```

2. **Check database connectivity:**
   ```bash
   # From pod
   oc rsh deployment/web-app
   psql $DATABASE_URL
   ```

3. **Check logs:**
   ```bash
   oc logs -f deployment/web-app
   ```

---

## Quick Reset Procedures

### Complete Local Reset

```bash
# Stop everything
make stop

# Clean all build artifacts
make clean

# Start fresh
make dev
```

### Reset Database Only

```bash
# Reset with demo data
make reset

# Or manually:
pnpm db:push --force
pnpm db:seed
```

### Reset Podman

```bash
# Stop and remove all containers
podman-compose down -v

# Remove all images
podman system prune -a

# Start fresh
make dev
```

---

## Still Having Issues?

### Get Help

1. **Check documentation:**
   - [Getting Started](./GETTING-STARTED.md)
   - [FAQ](./FAQ.md)
   - [Development Guide](./DEVELOPMENT.md)

2. **Search for similar issues:**
   - Project's GitLab issues
   - Stack Overflow

3. **Ask your team:**
   - Post in #engineering Slack
   - Include:
     - What you're trying to do
     - Error message (full text)
     - What you've tried
     - Your environment (OS, Node version, etc.)

4. **Provide debugging info:**
   ```bash
   # System info
   node --version
   pnpm --version
   podman --version
   
   # Service status
   podman-compose ps
   
   # Recent logs
   podman-compose logs --tail=50
   ```

### Debugging Commands

```bash
# Check all services
make status

# View all logs
make logs

# Test database connection
make shell-db

# Verify environment
cat .env

# Check running processes
lsof -i :3000
lsof -i :5432
lsof -i :8000

# Check disk space
df -h

# Check memory
top
```
