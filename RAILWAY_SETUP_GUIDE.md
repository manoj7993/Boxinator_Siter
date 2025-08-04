# 🚂 Complete Railway Setup Guide for Boxinator

## Prerequisites

✅ **Git repository** with your code (GitHub, GitLab, or Bitbucket)  
✅ **Railway account** - Sign up at [railway.app](https://railway.app)  
✅ **Node.js** installed locally for testing  

---

## 🎯 Step-by-Step Setup

### **Step 1: Create Railway Account & Project**

1. **Sign up at Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Sign up" and use your GitHub account (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `Boxinator_Siter` repository
   - Railway will automatically detect it's a Node.js project

### **Step 2: Add PostgreSQL Database**

1. **Add Database Service**
   - In your Railway project dashboard
   - Click "New Service" or "Add Service"
   - Select "Database" → "PostgreSQL"
   - Railway will provision a PostgreSQL instance

2. **Note the Database Info**
   - Railway automatically creates `DATABASE_URL`
   - You can view connection details in the PostgreSQL service dashboard

### **Step 3: Configure Backend Service**

1. **Service Detection**
   - Railway should automatically detect your backend in `/Backend` folder
   - If not, you may need to configure the root directory

2. **Set Environment Variables**
   - Go to your backend service
   - Click "Variables" tab
   - Add these variables:

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
PORT=3000

# Optional: Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

3. **Build Configuration**
   - Railway should auto-detect Node.js
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `/Backend` (if needed)

### **Step 4: Configure Frontend Service**

1. **Add Frontend Service**
   - Click "New Service" in your Railway project
   - Choose "Deploy from GitHub repo" 
   - Select the same repository
   - Set root directory to `/Frontend`

2. **Frontend Environment Variables**
   - Go to frontend service → Variables
   - Add your backend URL:

```env
VITE_API_URL=https://your-backend-service.railway.app/api
```

3. **Frontend Build Settings**
   - Build Command: `npm run build`
   - Start Command: `npm run preview` or use Railway's static hosting
   - Output Directory: `dist`

### **Step 5: Deploy Services**

1. **Deploy Backend First**
   - Railway will automatically deploy when you push to main branch
   - Monitor deployment in "Deployments" tab
   - Check logs for any errors

2. **Deploy Frontend**
   - Update the API URL with your actual backend Railway URL
   - Deploy frontend service

### **Step 6: Test Your Deployment**

1. **Backend Health Check**
   - Visit: `https://your-backend.railway.app/api/health`
   - Should return: `{"status":"OK","message":"API is healthy"}`

2. **Database Connection**
   - Check logs for "✅ Database connected successfully"
   - Tables will be created automatically by Sequelize

3. **Frontend Access**
   - Visit your frontend Railway URL
   - Test registration and login functionality

---

## 🔧 Configuration Details

### **Environment Variables Explained**

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection | ✅ Auto-set | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | ✅ | `production` |
| `JWT_SECRET` | Token encryption | ✅ | `your-secret-key-256-bits` |
| `PORT` | Server port | ✅ | `3000` |
| `SMTP_HOST` | Email server | ❌ | `smtp.gmail.com` |
| `SMTP_USER` | Email username | ❌ | `your@email.com` |
| `SMTP_PASS` | Email password | ❌ | `app-password` |

### **Railway Project Structure**

```
Your Railway Project
├── Backend Service (Node.js)
│   ├── Environment: NODE_ENV, JWT_SECRET, etc.
│   ├── Build: npm install
│   └── Start: npm start
├── Frontend Service (Static/Vite)
│   ├── Environment: VITE_API_URL
│   ├── Build: npm run build
│   └── Output: dist/
└── PostgreSQL Database
    ├── Automatic DATABASE_URL
    └── Connection details available
```

---

## 🚨 Troubleshooting

### **Common Issues & Solutions**

#### **1. Database Connection Failed**
```bash
# Check logs for:
❌ DB Error: connection refused

# Solutions:
✅ Verify DATABASE_URL is set
✅ Check PostgreSQL service is running
✅ Ensure SSL configuration is correct
```

#### **2. Build Failures**
```bash
# Error: Module not found
❌ Cannot find module 'sequelize'

# Solutions:
✅ Check package.json dependencies
✅ Verify npm install runs successfully
✅ Check Node.js version compatibility
```

#### **3. CORS Errors**
```bash
# Error in browser console:
❌ CORS policy blocked

# Solutions:
✅ Update CORS origins in app.js
✅ Add your frontend Railway URL to allowed origins
```

#### **4. Environment Variables Not Loading**
```bash
# Check if variables are set:
console.log('DATABASE_URL:', process.env.DATABASE_URL);

# Solutions:
✅ Verify variables are set in Railway dashboard
✅ Restart the service after adding variables
✅ Check variable names (case-sensitive)
```

---

## 🔒 Security Checklist

### **Before Going Live:**

- [ ] **Strong JWT Secret**: Use a secure random string (32+ characters)
- [ ] **Environment Variables**: All secrets in Railway variables, not in code
- [ ] **Database**: PostgreSQL with SSL enabled (Railway default)
- [ ] **HTTPS**: Railway provides SSL certificates automatically
- [ ] **CORS**: Configure allowed origins for your domain
- [ ] **Rate Limiting**: Enabled in your Express app

---

## 📊 Monitoring & Maintenance

### **Railway Dashboard Features:**

1. **Logs**: Real-time application logs
2. **Metrics**: CPU, Memory, Network usage
3. **Deployments**: History and rollback options
4. **Variables**: Environment variable management
5. **Domains**: Custom domain configuration

### **Regular Maintenance:**

- Monitor database usage and optimize queries
- Check logs for errors and performance issues
- Update dependencies regularly
- Backup important data (Railway handles database backups)

---

## 🚀 Next Steps

### **After Successful Deployment:**

1. **Custom Domain** (Optional)
   - Add your domain in Railway dashboard
   - Configure DNS records as instructed

2. **CI/CD Pipeline**
   - Railway auto-deploys on git push
   - Consider GitHub Actions for additional testing

3. **Monitoring Setup**
   - Use Railway's built-in monitoring
   - Consider external services like Sentry for error tracking

4. **Performance Optimization**
   - Monitor database performance
   - Optimize queries and add indexes as needed

---

## 💡 Pro Tips

### **Development Workflow:**

1. **Local Development**
   ```bash
   # Use local SQLite for development
   USE_LOCAL_DB=true npm run dev
   ```

2. **Testing Before Deploy**
   ```bash
   # Test database connection
   npm run db:test
   ```

3. **Environment Management**
   - Keep `.env.example` updated
   - Use different Railway projects for staging/production

### **Cost Optimization:**

- Railway offers $5/month free tier
- PostgreSQL databases start at $5/month
- Monitor usage in Railway dashboard
- Consider scaling down services during low usage

---

## 📞 Support Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Active community support
- **GitHub Issues**: For project-specific problems
- **Railway Status**: [status.railway.app](https://status.railway.app)

Your Boxinator application is now ready for Railway deployment! 🎉
