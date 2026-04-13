# Google Calendar Integration Setup

## Overview
The booking calendar system is now configured to pull unavailable dates directly from your Google Calendar: **oikosorchardandfarm2@gmail.com**

## Setup Steps

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. Enter project name: `Oikos Calendar`
4. Click **Create**

### Step 2: Enable Google Calendar API
1. In the Cloud Console, search for **"Calendar API"**
2. Click on **Google Calendar API**
3. Click **Enable**

### Step 3: Create an API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key (it will look like: `AIzaSyD...`)
4. Optionally, restrict the key:
   - Click on the key to edit
   - Under **API restrictions**, select **Calendar API**
   - Save

### Step 4: Add API Key to Your Website

**Option A: Environment Variable (Recommended for Security)**
```
Set GOOGLE_API_KEY environment variable to your API key
```

**Option B: Direct in Code (Quick Setup)**
1. Open `api/check-calendar.php`
2. Find this line:
   ```php
   $googleApiKey = getenv('GOOGLE_API_KEY') ?: 'YOUR_GOOGLE_API_KEY';
   ```
3. Replace `YOUR_GOOGLE_API_KEY` with your actual API key
4. Save

### Step 5: Make Google Calendar Public
1. Go to [Google Calendar Settings](https://calendar.google.com/calendar/u/0/r/settings)
2. Find **oikosorchardandfarm2@gmail.com** calendar
3. Click on it → **Settings** → **Access permissions**
4. Check **Make available to public** (or at least allow public view)
5. Save

### Step 6: Test
1. Refresh your website
2. Check browser console (F12 → Console)
3. You should see: `✅ Unavailable dates fetched from Google Calendar`

## How It Works
- The system checks Google Calendar every time someone visits
- All-day events and timed events are marked as unavailable dates
- Multi-day events automatically block all days
- Caches results for better performance
- Falls back to hardcoded dates if API key not configured

## Managing Bookings
1. Simply add events to your Google Calendar
2. Event dates will automatically appear as unavailable on the website
3. Changes appear within the cache duration (currently ~10 minutes)

## Troubleshooting

### "PHP not executing, using JSON fallback"
- API key not set or SQL error
- Check browser console for details
- Verify API key in `check-calendar.php`

### "No events found"
- Calendar might be private
- Check calendar sharing settings in Google Calendar
- Ensure calendar is public or publicly readable

### "Invalid API key"
- API key is wrong or expired
- Regenerate a new API key from Google Cloud Console

## Security Note
⚠️ **Don't commit your API key to public repositories**

If you set the API key directly in the code, add to `.gitignore`:
```
api/check-calendar.php
config/google-api-key.php
```

Or use environment variables instead (recommended).

## Support
For issues with Google Calendar API, see:
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [API Error Messages](https://developers.google.com/calendar/api/guides/error-codes)
