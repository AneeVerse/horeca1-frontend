# Cloudinary Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file in the `store` directory:

```env
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

## How to Get Cloudinary Credentials

### Step 1: Create a Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (or log in if you already have one)

### Step 2: Get Your Cloud Name
1. After logging in, you'll see your **Cloud Name** on the dashboard
2. It looks like: `dxxxxx` or `your-company-name`
3. Replace `YOUR_CLOUD_NAME` in the URL with your actual cloud name

### Step 3: Create an Upload Preset
1. Go to **Settings** → **Upload** tab
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: Choose a name (e.g., `kachabazar_products`)
   - **Signing mode**: Set to **Unsigned** (for client-side uploads)
   - **Folder**: Optional - set a folder name (e.g., `kachabazar/categories`)
   - **Format**: Set to **Auto** or specific format
   - **Quality**: Set to **Auto** or specific quality
5. Click **Save**

### Step 4: Add to .env.local
Create or update `store/.env.local`:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

**Example:**
```env
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/demo123/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kachabazar_products
```

## File Location

**Add these variables to:** `store/.env.local`

**Important Notes:**
- The `.env.local` file should be in the `store` directory (same level as `package.json`)
- Never commit `.env.local` to git (it should already be in `.gitignore`)
- Restart your Next.js dev server after adding environment variables
- Use `NEXT_PUBLIC_` prefix so the variables are available in the browser

## Testing

After setting up, test the image upload in the admin panel:
1. Go to `/admin/categories`
2. Click "Add Category"
3. Try uploading an image in the "Category Image" section
4. The image should upload to Cloudinary and display a preview

## Troubleshooting

- **"Cloudinary configuration missing"**: Check that both environment variables are set correctly
- **Upload fails**: Verify your upload preset is set to "Unsigned"
- **CORS errors**: Make sure your Cloudinary account allows uploads from your domain
- **Image not showing**: Check the browser console for errors and verify the URL format


