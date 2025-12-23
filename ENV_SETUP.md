# Environment Variables Setup Guide

## 📁 File Location
Create a file named `.env.local` in the `store` directory (same level as `package.json`)

## 🔑 Required Environment Variables

Based on your Cloudinary setup and codebase, here's what you need:

### 1. **Backend API URL** (Required)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```
- Replace with your actual backend URL
- For production: `https://your-backend.vercel.app`
- No trailing slash!

### 2. **Store Domain** (Required)
```env
NEXT_PUBLIC_STORE_DOMAIN=http://localhost:3000
```
- Your frontend store URL
- For production: `https://your-store.vercel.app`

### 3. **Cloudinary Configuration** (Required for Image Uploads)
Based on your Cloudinary account:
- **Cloud Name:** `dezs8ma9n`
- **Upload Preset:** `horeca1` (Unsigned mode)

```env
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dezs8ma9n/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=horeca1
```

### 4. **NextAuth Configuration** (Required for Authentication)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Or use online generator: https://generate-secret.vercel.app/32
```

### 5. **Stripe Payment** (Optional - Only if using Stripe)
```env
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_publishable_key_here
```
- Get from: https://dashboard.stripe.com/apikeys
- Use `pk_test_` for testing, `pk_live_` for production

## 📝 Complete .env.local Template

Copy this to `store/.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Store Domain
NEXT_PUBLIC_STORE_DOMAIN=http://localhost:3000

# Cloudinary (Your actual values)
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dezs8ma9n/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=horeca1

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_key_here
```

## ✅ Quick Setup Steps

1. **Create `.env.local` file:**
   ```bash
   cd store
   # Create .env.local file
   ```

2. **Copy the template above** and fill in your values

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## 🔍 Verify Your Setup

After adding variables, check:
- ✅ Backend API is accessible at `NEXT_PUBLIC_API_BASE_URL`
- ✅ Cloudinary upload works in admin panel (`/admin/categories`)
- ✅ Login works (`/admin/login`)
- ✅ No console errors about missing env variables

## 🚨 Important Notes

- ⚠️ **Never commit `.env.local` to git** (should be in `.gitignore`)
- ⚠️ **Restart dev server** after changing environment variables
- ⚠️ **Use `NEXT_PUBLIC_` prefix** for variables needed in the browser
- ⚠️ **No quotes** around values in `.env.local`
- ⚠️ **No spaces** around the `=` sign

## 📍 Your Current Cloudinary Setup

From your Cloudinary dashboard:
- ✅ Cloud Name: `dezs8ma9n`
- ✅ Upload Preset: `horeca1`
- ✅ Mode: Unsigned (correct for client-side uploads)

Your Cloudinary URL is already configured correctly! Just make sure the upload preset name matches exactly.


