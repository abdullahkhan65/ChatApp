# 🚀 Deployment Guide

This guide will help you deploy your chat application for **FREE** using various platforms.

## 📋 Prerequisites

Before deploying, make sure to:

1. ✅ Install PostgreSQL driver: `cd backend && npm install`
2. ✅ Commit all changes to Git
3. ✅ Push to GitHub (required for most platforms)

---

## 🎯 Option 1: Render (Recommended - Easiest)

**Perfect for beginners. Everything automated.**

### Steps:

1. **Create a Render account:**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Deploy using Blueprint (Automatic):**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create:
     - PostgreSQL database
     - Backend service
     - Frontend static site
   - Click "Apply"

3. **Update Environment Variables:**
   - After deployment, go to Backend service
   - Update `FRONTEND_URL` to your actual frontend URL
   - Go to Frontend service
   - Update `VITE_API_URL` and `VITE_SOCKET_URL` to your backend URL
   - Redeploy both services

4. **Done!** 🎉
   - Backend will be at: `https://chatapp-backend.onrender.com`
   - Frontend will be at: `https://chatapp-frontend.onrender.com`

**Note:** Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## 🎯 Option 2: Railway (Better Performance)

**Great developer experience. $5/month free credit.**

### Steps:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create new project:**
   ```bash
   cd /Users/abdullah/Documents/ChatApp
   railway init
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   railway up
   ```

4. **Add PostgreSQL:**
   - Go to Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` connection string

5. **Set Backend Environment Variables:**
   ```bash
   railway variables set DATABASE_URL=<your-postgres-url>
   railway variables set JWT_SECRET=<random-secure-string>
   railway variables set FRONTEND_URL=<will-add-later>
   ```

6. **Deploy Frontend:**
   ```bash
   cd ../frontend
   railway up
   ```

7. **Set Frontend Environment Variables:**
   ```bash
   railway variables set VITE_API_URL=<backend-url>
   railway variables set VITE_SOCKET_URL=<backend-url>
   ```

8. **Update CORS:**
   - Go back to backend and update `FRONTEND_URL` with your frontend URL

---

## 🎯 Option 3: Vercel (Frontend) + Render (Backend)

**Best frontend performance.**

### Backend (Render):

Follow Render steps above for backend only.

### Frontend (Vercel):

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Add Environment Variables:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add:
     - `VITE_API_URL` = your Render backend URL
     - `VITE_SOCKET_URL` = your Render backend URL

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## 🔧 Environment Variables Reference

### Backend (.env):
```
DATABASE_URL=<your-postgresql-connection-string>
JWT_SECRET=<random-secure-string-min-32-chars>
PORT=3000
FRONTEND_URL=<your-frontend-url>
```

### Frontend (.env):
```
VITE_API_URL=<your-backend-url>
VITE_SOCKET_URL=<your-backend-url>
```

---

## 🐛 Troubleshooting

### CORS Errors:
- Make sure `FRONTEND_URL` in backend matches your actual frontend URL
- Don't include trailing slashes

### WebSocket Connection Failed:
- Ensure `VITE_SOCKET_URL` is set correctly
- Check backend logs for errors

### Database Connection Failed:
- Verify `DATABASE_URL` is set
- PostgreSQL URL should start with `postgresql://` or `postgres://`

### 502 Bad Gateway on Render:
- Free tier services sleep after inactivity
- Wait 30-60 seconds for first request
- Check logs for startup errors

---

## 💡 Tips

1. **Free Tier Limits:**
   - Render: 750 hours/month, sleeps after 15 min
   - Railway: $5 credit/month
   - Vercel: Unlimited for frontend

2. **Keep Services Awake:**
   - Use [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes
   - Free tier: 50 monitors

3. **Custom Domain:**
   - All platforms support custom domains for free
   - Configure in dashboard settings

4. **Monitoring:**
   - Check platform dashboards for logs
   - Enable email alerts for errors

---

## 📞 Need Help?

- Check platform documentation
- Review application logs in dashboard
- Ensure all environment variables are set correctly
- Try deploying backend first, then frontend
