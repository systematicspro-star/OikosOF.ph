# 🗓️ Real-Time Google Calendar Integration Setup

**Goal:** Make your booking system automatically pull unavailable dates from Google Calendar in real-time.

---

## ✅ Prerequisites

- Google Account
- Access to Google Cloud Console
- Your calendar: `oikosorchardandfarm2@gmail.com`
- 5-10 minutes to complete setup

---

## 📋 Step-by-Step Setup

### **Step 1: Go to Google Cloud Console**

1. Open: https://console.cloud.google.com/
2. Sign in with your Google account
3. Click **"Select a Project"** (top-left dropdown)
4. Click **"NEW PROJECT"**

```
Project name: Oikos Orchard Calendar
Organization: (leave blank or select your organization)
```

5. Click **CREATE**
6. Wait 30 seconds for project creation to complete

---

### **Step 2: Enable Google Calendar API**

1. In the top search bar, search for **"Google Calendar API"**
2. Click on **"Google Calendar API"** from results
3. Click **ENABLE** (blue button)
4. Wait for it to load

✅ You should see: "Google Calendar API is now enabled"

---

### **Step 3: Create API Key**

1. On the Google Calendar API page, click **"CREATE CREDENTIALS"** (top-right)
2. A panel will appear asking "What data will you be accessing?"
3. Select:
   - **Application data** (for server)
   - **Public data**
   - Click **NEXT**

4. For service account setup, click **CREATE SERVICE ACCOUNT**
   - Service account name: `oikos-calendar`
   - Service account ID: (auto-filled, keep it)
   - Click **CREATE AND CONTINUE**

5. Skip the optional steps, click **GO TO SERVICE ACCOUNT**

6. In the service account page, go to **KEYS** tab
7. Click **ADD KEY** → **Create new key**
8. Select **JSON** format
9. Click **CREATE**

❌ **⚠️ IMPORTANT:** A JSON file will download. Keep this file safe!

---

### **Step 4: Get the API Key from JSON File**

1. Open the downloaded JSON file with a text editor
2. Look for the field: `"private_key"`
3. Copy the ENTIRE private key (including quotes and `\n` characters)

Alternative (Simpler): Use **API Key instead of Service Account**

1. Go back to Google Cloud Console
2. Click **CREATE CREDENTIALS** again
3. Select **API Key** (not service account)
4. Copy the API key (long string like: `AIzaSy...`)

✅ This is easier! Use this method.

---

### **Step 5: Make Your Calendar Public**

1. Go to: https://calendar.google.com/
2. Find **"Oikos Orchard and Farm"** calendar in left sidebar
3. Click the **3-dot menu** next to it
4. Select **Settings and sharing**
5. Go to **Access permissions** section
6. Check: **Make available to public** ✓
7. In **Share with specific people**, set: **Public** (if available)
8. Save changes

---

### **Step 6: Configure the API Key**

**Option A: Environment Variable (Recommended for Production)**

1. Open your server configuration (varies by hosting):
   - **XAMPP**: Edit `php.ini`
   - **Shared Hosting**: cPanel/Hosting panel

2. Add this line:
   ```
   GOOGLE_API_KEY=YOUR_API_KEY_HERE
   ```

**Option B: Direct Configuration (Quick for Testing)**

1. Open: `api/check-calendar.php`
2. Find line 17:
   ```php
   $googleApiKey = getenv('GOOGLE_API_KEY') ?: 'YOUR_GOOGLE_API_KEY';
   ```

3. Replace `YOUR_GOOGLE_API_KEY` with your actual API key:
   ```php
   $googleApiKey = getenv('GOOGLE_API_KEY') ?: 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxx';
   ```

4. Save the file

---

### **Step 7: Verify It Works**

1. Visit: `http://localhost/OikosOrchardandFarm/api/check-calendar.php`

You should see JSON output:

```json
{
  "success": true,
  "unavailableDates": [
    "2026-04-02",
    "2026-04-03",
    "2026-04-04",
    "2026-04-08",
    "2026-04-09",
    "2026-04-10",
    "2026-04-22",
    "2026-04-23"
  ],
  "message": "Calendar data retrieved successfully",
  "lastUpdated": "2026-04-13T14:30:20",
  "source": "google_calendar"
}
```

✅ If `"source": "google_calendar"` - **Success!** It's pulling from your calendar.
❌ If `"source": "fallback"` - API key not configured, still using backup dates.

---

## 🔄 How Real-Time Updates Work

**System Flow:**

```
Your Google Calendar
        ↓
Google Calendar API
        ↓
check-calendar.php (server)
        ↓
JavaScript (browser) fetches every 30 minutes
        ↓
Booking form checks availability
```

**When you add an event to Google Calendar:**
1. Event appears on calendar immediately
2. Next time someone loads the booking form (or within 30 minutes), it pulls fresh dates
3. They can't book those dates ✓

**Cache Duration:** 30 minutes (configurable in `script.js` line 1995)

---

## 🐛 Troubleshooting

### Problem: **"source": "fallback" in JSON response**

**Solution:** API key not configured
- Double-check API key in `check-calendar.php`
- Verify API key is correct (no extra spaces)
- Ensure Google Calendar API is **ENABLED** in Cloud Console

### Problem: **API Key error "Invalid key"**

**Solution:** 
- Verify key is active in Cloud Console
- Check calendar is set to public
- Delete and create a new API key

### Problem: **"Permission denied" error**

**Solution:**
- Make sure calendar is set to **Public**
- Try a different Google account as backup
- Regenerate the API key

### Problem: **"No events found"**

**Solution:**
- Add test events to your Google Calendar first
- Verify calendar ID is correct: `oikosorchardandfarm2@gmail.com`
- Check events are in the next 90 days

---

## 📱 Testing the System

### Test Case 1: Single Day Block
1. Add event to Google Calendar: **April 25**
2. Name it: **"Wedding"**
3. Save
4. Try to book April 25 on website → Should show **unavailable** ✓

### Test Case 2: Multi-Day Block
1. Add event: **April 28 - May 2**
2. Name it: **"Closed for Inventory"**
3. Save
4. Try to book April 28 → Should show **unavailable** ✓
5. Try to book May 1 → Should show **unavailable** ✓

### Test Case 3: Already Booked
1. Check today's booking form
2. Try dates: April 2-4, 8-10, 22-23 → Should be blocked ✓

---

## 🔐 Security Notes

**API Key Precautions:**

✅ DO:
- Keep API key in environment variables for production
- Restrict API key to Google Calendar API only
- Regenerate API key if exposed
- Set calendar to public intentionally

❌ DON'T:
- Commit API key to GitHub
- Share API key in emails
- Use same key for multiple sites
- Put in index.html or JavaScript files

---

## 📞 Support & Next Steps

**What Happens Now:**

Your booking system will:
1. ✅ Pull dates from Google Calendar automatically
2. ✅ Update every 30 minutes
3. ✅ Show real-time unavailable dates
4. ✅ Notify users with toast notifications when dates unavailable
5. ✅ Prevent bookings on blocked dates

**Need Help?**

Check the browser console for errors:
- Open: F12 (Developer Tools)
- Go to **Console** tab
- Look for error messages starting with "⚠️ Calendar"

---

## ✨ You're Done!

Your booking system is now **connected to your Google Calendar** and will automatically pull real-time availability. 🎉

**Remember:** Every time you add/remove events from `oikosorchardandfarm2@gmail.com`, the website automatically reflects those changes!

