# Portfolio Website

A beautiful, minimalist, and professional portfolio website built with Next.js 14, featuring a blog with CMS capabilities, comment system, light/dark mode, and full responsive design.

## Features

- **Modern Tech Stack**: Next.js 14, React 18, Tailwind CSS, MongoDB
- **Blog System**: Full-featured blog with rich text editor (React Quill)
- **Comment System**: Nested comments with like/dislike functionality
- **Admin Panel**: Complete CMS to manage posts, projects, and comments
- **Light/Dark Mode**: Seamless theme switching
- **Fully Responsive**: Mobile-first design with collapsible sidebar
- **Sharp/Edgy Design**: No rounded corners (except profile picture)
- **Dynamic Stats**: Real-time lines of code counter
- **Project Showcase**: Fixed-size cards with detail pages

## Pages

- **Home**: Landing page (click profile to navigate here)
- **About**: Personal introduction and history
- **Resume**: Education, experience, skills, certifications
- **Projects**: Portfolio showcase with detail pages
- **Blog**: Article listing and individual post pages
- **Stats**: Site statistics including dynamic JS lines count
- **Contact**: Contact information and social links
- **Admin Panel**: Content management system

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_PASSWORD_HASH=your_bcrypt_hash
   ```

3. Generate password hash:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword', 10));"
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Documentation

- **QUICK_START.md** - 10-minute setup guide
- **DEPLOYMENT_GUIDE.md** - Deploy to Vercel/production
- **PROJECT_SUMMARY.md** - Complete project overview and file index

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- MongoDB
- React Quill (rich text editor)
- bcryptjs (authentication)

## License

MIT License
