# Deployment Guide

Deploy your portfolio website to production.

## Option 1: Vercel (Recommended - FREE)

### Step 1: Push to GitHub

`ash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your repository
5. Vercel auto-detects Next.js

### Step 3: Add Environment Variables

In Vercel Dashboard -> Settings -> Environment Variables:

`
MONGODB_URI = your_mongodb_connection_string
ADMIN_PASSWORD_HASH = your_bcrypt_hash
`

### Step 4: Deploy

Click "Deploy" - your site will be live in ~1 minute!

## MongoDB Setup (If Not Done)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create FREE cluster (M0 Sandbox)
4. Database Access -> Add user with password
5. Network Access -> Allow 0.0.0.0/0 (anywhere)
6. Get connection string from Database -> Connect

## Generate Password Hash

`ash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword', 10));"
`

## Custom Domain (Optional)

1. In Vercel: Settings -> Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL is automatic

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/portfolio |
| ADMIN_PASSWORD_HASH | bcrypt hash of admin password | $... |

## Post-Deployment Checklist

- [ ] Test admin login at /admin
- [ ] Create a test blog post
- [ ] Check light/dark mode toggle
- [ ] Test on mobile device
- [ ] Verify MongoDB connection (check posts load)

## Troubleshooting

### Build Fails
- Check environment variables are set
- Ensure MONGODB_URI is correct
- Check Vercel build logs

### Admin Login Not Working
- Verify ADMIN_PASSWORD_HASH is set correctly
- Make sure you're using the same password used to generate the hash

### MongoDB Connection Issues
- Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access
- Check connection string format
- Ensure database user has correct permissions

### Pages Not Loading
- Check browser console for errors
- Verify API routes are working
- Check MongoDB connection

## Performance Tips

1. **Images**: Use WebP format, optimize sizes
2. **Profile Photo**: Keep under 100KB
3. **Blog Images**: Use external CDN (Cloudinary, Imgur)

## Security Notes

1. Never commit `.env.local` to Git
2. Use strong admin password
3. Regularly rotate password hash if needed
4. MongoDB Atlas has built-in security features
