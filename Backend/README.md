# Boxinator Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v13+) or Docker
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd Backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Database Setup:**

#### Option A: Supabase PostgreSQL (Recommended - Free & Easy)

**Step 1: Create Supabase Account**
1. Go to https://supabase.com/
2. Click "Start your project" → Sign up with GitHub/Google
3. Click "New project"
4. Choose your organization
5. Enter project name: "boxinator-backend"
6. Enter a strong database password (save this!)
7. Choose a region close to you
8. Click "Create new project"

**Step 2: Get Database Connection Details**
1. Wait for project setup (2-3 minutes)
2. Go to Settings → Database
3. Scroll down to "Connection string"
4. Copy the "URI" connection string
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Step 3: Update .env File**
```bash
# Replace with your Supabase details
DB_HOST=db.[your-project-ref].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[your-database-password]
```

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL from https://www.postgresql.org/download/windows/
createdb Boxinator1
```

#### Option C: Docker (If you have Docker)
```bash
docker-compose up -d postgres
```

4. **Start the application:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Email verification

### Shipments
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `GET /api/shipments/:id` - Get shipment details

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Update user role

### Settings
- `GET /api/settings/countries` - List countries
- `GET /api/settings/weight-tiers` - List weight tiers

## 🛠️ Development

### Testing
```bash
npm test
```

### Database Reset
```bash
# This will drop and recreate all tables
node -e "require('./server.js')"
```

## 🔧 Configuration

### Environment Variables (.env file)

#### For Supabase (Recommended)
```env
# Database Configuration - Supabase
DB_HOST=db.[your-project-ref].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[your-supabase-db-password]

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRE=7d

# Email Configuration (for nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=5000
```

#### For Local PostgreSQL
```env
# Database Configuration - Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Boxinator1
DB_USER=postgres
DB_PASSWORD=your-local-postgres-password
# ... rest same as above
```

## 🚨 Known Issues Fixed
- ✅ Field naming consistency (role vs accountType)
- ✅ Password field naming (password vs passwordHash)
- ✅ Missing dependencies (nodemailer)
- ✅ Authentication middleware fixes
- ✅ Environment configuration

## 📝 TODO
- [ ] Complete password reset functionality
- [ ] Add comprehensive error logging
- [ ] Implement API documentation with Swagger
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
