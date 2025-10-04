# 🚀 Deployment Guide

This guide will help you deploy your chat application for **FREE** using various platforms.

## 📊 Quick Comparison

| Platform | Difficulty | Free Tier | Card Required? | Best For | Setup Time |
|----------|------------|-----------|----------------|----------|------------|
| **Fly.io** | ⭐⭐ Medium | 3 apps free | ❌ NO | No card needed | 10 min |
| **Vercel** | ⭐ Easy | Forever | ❌ NO | Frontend only | 5 min |
| **Render** | ⭐ Easy | Forever (sleeps) | ⚠️ YES | Full stack easy | 5 min |
| **Railway** | ⭐⭐ Medium | $5/month credit | ⚠️ YES | Better performance | 10 min |
| **AWS** | ⭐⭐⭐⭐ Hard | 12 months | ⚠️ YES | Learning/Resume | 1-2 hours |

**💡 Recommendation:**
- **No credit card?** → Use Fly.io (Option 1)
- **Have a card?** → Use Render (Option 2)
- **Building portfolio?** → Use AWS (Option 4)

## 📋 Prerequisites

Before deploying, make sure to:

1. ✅ Install PostgreSQL driver: `cd backend && npm install`
2. ✅ Commit all changes to Git
3. ✅ Push to GitHub (required for most platforms)

---

## 🎯 Option 1: Fly.io (NO CARD REQUIRED - Best Free Option)

**Perfect for students and those without a credit card. 3 apps free forever!**

### What You Get Free:
- 3 shared-cpu VMs with 256MB RAM each
- 3GB persistent storage total
- 160GB outbound data transfer

### Steps:

#### 1. Install Fly CLI:
```bash
# macOS/Linux:
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell):
iwr https://fly.io/install.ps1 -useb | iex

# Verify installation:
flyctl version
```

#### 2. Sign Up (No Card):
```bash
flyctl auth signup
# Use email (no card required!)
```

#### 3. Deploy Backend:
```bash
cd backend

# Create fly.toml
flyctl launch
# Name: chatapp-backend
# Region: Choose closest to you
# PostgreSQL: Yes (creates free database)
# Deploy now: No

# Set environment variables
flyctl secrets set JWT_SECRET=your-random-secret-key
flyctl secrets set FRONTEND_URL=https://chatapp-frontend.vercel.app

# Deploy
flyctl deploy
```

#### 4. Get Backend URL:
```bash
flyctl info
# Copy the hostname (e.g., chatapp-backend.fly.dev)
```

#### 5. Deploy Frontend (Vercel - Also Free, No Card):
```bash
cd ../frontend

# Install Vercel CLI
npm i -g vercel

# Login (GitHub/Email)
vercel login

# Update .env
echo "VITE_API_URL=https://chatapp-backend.fly.dev" > .env.production
echo "VITE_SOCKET_URL=https://chatapp-backend.fly.dev" >> .env.production

# Deploy
vercel --prod
```

#### 6. Update CORS:
```bash
# Go back to backend and update FRONTEND_URL
cd ../backend
flyctl secrets set FRONTEND_URL=https://your-app.vercel.app

# Redeploy
flyctl deploy
```

**Done!** Both services are now live with HTTPS, no card required! 🎉

---

## 🎯 Option 2: Render (Requires Card - Easiest)

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

## 🎯 Option 3: AWS Free Tier (Most Complex, Best for Learning)

**Free for 12 months. Great learning experience but requires more setup.**

### What You Get Free:
- **EC2:** 750 hours/month of t2.micro instance (enough for 1 server running 24/7)
- **RDS:** 750 hours/month of db.t2.micro PostgreSQL
- **S3:** 5GB storage for frontend
- **CloudFront:** 50GB data transfer

### Steps:

#### 1. Create AWS Account:
- Go to [aws.amazon.com](https://aws.amazon.com)
- Sign up for free tier (requires credit card, but won't charge unless you exceed limits)

#### 2. Deploy Database (RDS PostgreSQL):
```bash
# In AWS Console:
1. Go to RDS → Create Database
2. Choose PostgreSQL (Free Tier)
3. Templates: Free tier
4. DB instance: db.t2.micro
5. Storage: 20 GB (free tier limit)
6. Username: postgres
7. Password: <set-a-strong-password>
8. Public access: Yes (for now)
9. Create database
10. Wait 5-10 minutes for creation
11. Copy the endpoint URL
```

#### 3. Deploy Backend (EC2):
```bash
# In AWS Console:
1. Go to EC2 → Launch Instance
2. Choose Ubuntu Server 22.04 LTS (Free tier eligible)
3. Instance type: t2.micro
4. Create new key pair → Download .pem file
5. Security group: Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (3000)
6. Launch instance

# SSH into your server:
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>

# On the server:
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repository
git clone <your-github-repo-url>
cd ChatApp/backend

# Install dependencies
npm install

# Set environment variables
nano .env
# Add:
DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/postgres
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://<your-s3-website-url>

# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name chatapp-backend
pm2 startup
pm2 save

# Your backend is now running at http://<ec2-ip>:3000
```

#### 4. Deploy Frontend (S3 + CloudFront):
```bash
# On your local machine:
cd frontend

# Update .env
echo "VITE_API_URL=http://<your-ec2-ip>:3000" > .env
echo "VITE_SOCKET_URL=http://<your-ec2-ip>:3000" >> .env

# Build
npm run build

# Install AWS CLI
# macOS: brew install awscli
# Windows: Download from aws.amazon.com/cli

# Configure AWS CLI
aws configure
# Enter your Access Key ID and Secret Access Key (create in IAM)

# Create S3 bucket
aws s3 mb s3://your-chatapp-frontend

# Enable static website hosting
aws s3 website s3://your-chatapp-frontend --index-document index.html

# Upload files
aws s3 sync dist/ s3://your-chatapp-frontend --acl public-read

# Your frontend is at: http://your-chatapp-frontend.s3-website-<region>.amazonaws.com
```

#### 5. Optional - Add HTTPS with Certificate Manager:
```bash
1. Request certificate in AWS Certificate Manager
2. Create CloudFront distribution
3. Point to your S3 bucket
4. Add custom domain (optional)
```

### Cost Warning:
- **Free for first 12 months**
- After 12 months: ~$15-25/month
- Set up billing alerts!

### ⚡ Simpler AWS Option: AWS Amplify

**Much easier than EC2, but limited free tier (1000 build minutes/month).**

```bash
# 1. Install Amplify CLI
npm install -g @aws-amplify/cli

# 2. Configure
amplify configure

# 3. Initialize (in your project root)
amplify init

# 4. Add hosting
amplify add hosting
# Choose: Hosting with Amplify Console
# Choose: Manual deployment

# 5. Deploy frontend
cd frontend
npm run build
amplify publish

# For backend, still use Render or Railway (easier than EC2)
```

---

## 🎯 Option 4: Vercel (Frontend) + Render (Backend)

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
