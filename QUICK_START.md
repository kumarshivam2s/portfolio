# Quick Start Guide

Get your portfolio running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- A MongoDB Atlas account (free)

## Step-by-Step

### 1. Install Dependencies (1 minute)

`ash
cd portfolio-website
npm install
`

### 2. Set Up MongoDB (3 minutes)

1. Go to https://mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create FREE cluster (M0)
4. Create database user with password
5. Allow all IPs: Network Access -> 0.0.0.0/0
6. Get connection string: Database -> Connect -> Connect your application

### 3. Generate Password Hash (1 minute)

`ash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword', 10));"
`

Copy the output (starts with $dollar).

### 4. Configure Environment (2 minutes)

Create `.env.local` file:

`env
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/portfolio
ADMIN_PASSWORD_HASH=paste_your_bcrypt_hash_here
`

### 5. Run Development Server (1 minute)

`ash
npm run dev
`

Open http://localhost:3000

### 6. Access Admin Panel

1. Go to http://localhost:3000/admin
2. Enter the password you used to generate the hash
3. Start creating content!

## Customization

### Update Your Info

- `components/Sidebar.js` - Name, email, bio, social links
- `app/about/page.js` - About page content
- `app/contact/page.js` - Contact info and social links
- `public/profile.jpg` - Your profile photo

### Deploy to Vercel (FREE)

`ash
git init
git add .
git commit -m "My portfolio"
git push origin main
`

Then go to vercel.com -> Import Project -> Add env variables -> Deploy

## What's Included?

- Blog with CMS (rich text editor)
- Comment system (like/dislike)
- Admin panel with dashboard
- Light/dark mode
- Fully responsive design
- Projects showcase with detail pages
- Resume page
- Contact page with social links
- Statistics page with live JS lines count
- Sharp/edgy design (no rounded corners)
