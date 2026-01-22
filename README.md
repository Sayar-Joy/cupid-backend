# Cupid Pudding Backend API

Backend API for Cupid Pudding - Handles matchmaking logic and database operations.

## Deployment on Render

### Prerequisites

- GitHub/GitLab account
- Render account (free tier)
- MongoDB database (MongoDB Atlas free tier recommended)

### Steps to Deploy

1. **Setup MongoDB Atlas (Free Tier)**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist all IPs (0.0.0.0/0) for Render access
   - Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

2. **Push backend folder to a Git repository**

   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

3. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your backend repository
   - Configure:
     - **Name**: `cupid-pudding-api` (or your preferred name)
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   In Render dashboard, add these environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: 3000 (optional, Render sets this automatically)
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://cupid-pudding.vercel.app`)

5. **Copy Your Render URL**
   After deployment, you'll get a URL like:
   - `https://cupid-pudding-api.onrender.com`

   Use this URL to update the frontend `config.js` file.

### Local Development

```bash
cd backend
# Install dependencies
npm install

# Copy stickers folder (needed for local testing only)
mkdir -p public
cp -r ../frontend/public/stickers public/

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env and add your MongoDB connection string

# Run development server
npm run dev

# Or production mode
npm start
```

API will be available at `http://localhost:3000`

**Note**: The `public/stickers` folder is only needed for local development to read sticker filenames. In production, stickers are served by the frontend (Vercel), not the backend.

### Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── models/
│   └── User.js          # User/Match model
├── routes/
│   └── match.js         # Matching API routes
├── server.js            # Express server
├── package.json
├── .env.example         # Environment variables template
└── .gitignore
```

### API Endpoints

- `GET /` - Health check
- `POST /api/match` - Create a new match
  - Body: `{ "name": "string", "major": "string", "previousMatches": [], "previousStickers": [] }`
  - Returns: Match result with sticker

### Important Notes

- **Free tier limitation**: Service spins down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds (cold start)
- Consider using a cron job service to ping your API every 14 minutes to keep it alive (optional)
- Make sure CORS is properly configured with your frontend URL

### Keeping Service Alive (Optional)

Use a free service like [cron-job.org](https://cron-job.org) to ping your API every 14 minutes:

- URL: `https://your-app.onrender.com/`
- Frequency: Every 14 minutes
- This prevents cold starts but uses more of your free 750 hours/month

### Custom Domain (Optional)

In Render dashboard:

1. Go to your service settings
2. Click "Custom Domains"
3. Add your custom domain
4. Update DNS records as instructed
