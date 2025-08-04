# ✅ Railway Setup Checklist

## Quick Start (30 minutes)

### **Before You Start**
- [ ] Code is committed and pushed to GitHub/GitLab
- [ ] You have a Railway account ([railway.app](https://railway.app))
- [ ] Backend dependencies are installed (`npm install` in Backend folder)

### **Railway Setup Steps**

#### **1. Create Railway Project (5 min)**
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "New Project" → "Deploy from GitHub repo"
- [ ] Select your `Boxinator_Siter` repository
- [ ] Railway detects Node.js project

#### **2. Add PostgreSQL Database (2 min)**
- [ ] In Railway dashboard: "New Service" → "Database" → "PostgreSQL"  
- [ ] Wait for provisioning (1-2 minutes)
- [ ] Note: `DATABASE_URL` is automatically created

#### **3. Configure Backend Service (5 min)**
- [ ] Go to backend service → "Variables" tab
- [ ] Add required environment variables:
  ```
  NODE_ENV=production
  JWT_SECRET=your-super-secure-secret-key-here
  PORT=3000
  ```
- [ ] Optional: Add email variables if using email features

#### **4. Deploy Backend (5 min)**
- [ ] Railway auto-deploys on push to main branch
- [ ] Monitor "Deployments" tab for progress
- [ ] Check "Logs" for successful database connection: `✅ Database connected successfully`

#### **5. Test Backend (3 min)**
- [ ] Visit: `https://your-backend-url.railway.app/api/health`
- [ ] Should return: `{"status":"OK","message":"API is healthy"}`
- [ ] Check database tables are created automatically

#### **6. Configure Frontend (5 min)**
- [ ] Create new service in same Railway project
- [ ] Set root directory to `/Frontend`
- [ ] Add environment variable:
  ```
  VITE_API_URL=https://your-backend-url.railway.app/api
  ```

#### **7. Deploy Frontend (5 min)**
- [ ] Railway builds and deploys frontend
- [ ] Visit frontend URL to test complete application
- [ ] Test user registration and login

### **Verification Steps**
- [ ] Backend health endpoint works
- [ ] Database connection successful
- [ ] Frontend loads and connects to backend
- [ ] User registration/login works
- [ ] No console errors in browser

### **If Something Goes Wrong**
1. **Check Railway logs** for error messages
2. **Verify environment variables** are set correctly
3. **Ensure DATABASE_URL** is automatically provided by PostgreSQL service
4. **Check CORS settings** if frontend can't connect to backend

### **Important URLs to Save**
- Railway Dashboard: `https://railway.app/dashboard`
- Backend URL: `https://your-backend.railway.app`
- Frontend URL: `https://your-frontend.railway.app`
- Database Connection: Available in PostgreSQL service dashboard

### **Environment Variables Template**

Copy this to your Railway backend service variables:

```env
NODE_ENV=production
JWT_SECRET=change-this-to-a-secure-random-string-32-characters-minimum
PORT=3000

# Optional: Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### **Next Steps After Deployment**
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring and alerts
- [ ] Set up staging environment
- [ ] Add error tracking (Sentry, LogRocket, etc.)

---

**Need Help?** 
- Check the full `RAILWAY_SETUP_GUIDE.md` for detailed instructions
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord community for support
