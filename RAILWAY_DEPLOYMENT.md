# Railway Deployment Guide

This guide explains how to deploy the Boxinator application to Railway.

## Prerequisites

- A Railway account (sign up at [railway.app](https://railway.app))
- Your project code pushed to a Git repository (GitHub, GitLab, etc.)

## Backend Deployment

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo" and select your repository
4. Railway will automatically detect it's a Node.js project

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL instance and provide connection details

### 3. Configure Environment Variables

Railway automatically sets the `DATABASE_URL` when you add PostgreSQL. You need to set additional variables:

1. Go to your backend service in Railway
2. Navigate to "Variables" tab
3. Add these environment variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Configure Build Settings

Railway should automatically detect your Node.js app, but you can verify:

1. Go to "Settings" → "Build"
2. Ensure build command is: `npm install`
3. Ensure start command is: `npm start` or `node server.js`

### 5. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Monitor the deployment in the "Deployments" tab
3. Once deployed, Railway provides a public URL for your backend

## Frontend Deployment

### Option 1: Deploy to Railway

1. Create another service in the same Railway project
2. Connect your frontend directory
3. Railway will detect it's a Vite/React app
4. Set environment variables:

```env
REACT_APP_API_URL=https://your-backend-railway-url.railway.app/api
```

### Option 2: Deploy to Netlify/Vercel

You can also deploy the frontend to specialized frontend hosting:

1. **Netlify**: Connect your GitHub repo, set build command to `npm run build`, publish directory to `dist`
2. **Vercel**: Similar process, auto-detects Vite configuration

## Database Setup

Railway PostgreSQL comes empty. The application will automatically create tables when it first runs thanks to Sequelize's `sync({ alter: true })` configuration.

## Environment Variables Reference

### Backend Variables (Railway)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Automatically set by Railway PostgreSQL | ✅ |
| `NODE_ENV` | Set to "production" | ✅ |
| `PORT` | Usually 3000, Railway may override | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `SMTP_HOST` | Email server host | ❌ |
| `SMTP_PORT` | Email server port | ❌ |
| `SMTP_USER` | Email username | ❌ |
| `SMTP_PASS` | Email password | ❌ |

### Frontend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | URL to your Railway backend | ✅ |

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL service is running in Railway
2. Check that `DATABASE_URL` is properly set
3. Verify SSL configuration (Railway requires SSL)

### Deployment Failures

1. Check the build logs in Railway dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### CORS Issues

The backend is configured to accept requests from multiple origins. If you encounter CORS issues:

1. Update the CORS configuration in `app.js`
2. Add your frontend URL to the allowed origins

## Monitoring

Railway provides:
- Real-time logs
- Metrics and analytics
- Resource usage monitoring
- Deployment history

Access these through your Railway project dashboard.

## Custom Domain (Optional)

1. Go to your service in Railway
2. Navigate to "Settings" → "Domain"
3. Add your custom domain
4. Configure DNS according to Railway's instructions

## Next Steps

After deployment:
1. Test all API endpoints
2. Verify database connectivity
3. Set up monitoring and alerts
4. Configure automated backups if needed
5. Set up CI/CD pipeline for automatic deployments
