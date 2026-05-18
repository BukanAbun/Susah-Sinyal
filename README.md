# 📱 SusahSinyal - Telegram Channel Feed

A web application to manage and display Telegram public channel posts. Admin can manage channels and scrape posts from the command line.

## 🎯 Features

- ✅ **Admin Panel** - Add/remove channels and admin users at https://susah-sinyal.web.app/admin.html
- ✅ **Public Feed** - Display all scraped Telegram posts at https://susah-sinyal.web.app
- ✅ **Local Scraper** - Run `npm run scrape` to fetch posts from any Telegram public channel
- ✅ **Firebase Firestore** - All posts and channels stored in Firestore
- ✅ **Google Auth** - Only authorized admins can manage channels

---

## 🚀 Quick Start

### 1. Setup Firebase Service Account

You need a Firebase service account to run the local scraper.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **SusahSinyal** project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file (keep it secure!)

### 2. Configure Local Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste the **entire Firebase service account JSON** as a single line:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"susah-sinyal",...}
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### 3. Run the Scraper

Fetch posts from a Telegram channel:

```bash
npm run scrape -- https://t.me/s/tradingmasnael
```

**Example output:**
```
📡 Scraping: https://t.me/s/tradingmasnael
✅ Scraped 45 messages

📊 Results:
   ✅ New posts saved: 42
   ⏭️  Duplicates skipped: 3

✨ Done!
```

---

## 👥 Admin Panel

Access the admin panel at: **https://susah-sinyal.web.app/admin.html**

### Sign In
1. Click **Sign in with Google**
2. Use an account that's authorized as admin
3. **Super Admin:** arnold.darwin@gmail.com (can add/remove other admins)

### Manage Channels
1. Enter a Telegram channel URL (e.g., `https://t.me/s/tradingmasnael`)
2. (Optional) Enter a friendly channel name
3. Click **Add Channel**
4. Channel appears in the list with post count and last scraped date

### Manage Admin Users
1. **Super Admin only** can add/remove other admin users
2. Enter an email address
3. Click **Add Admin**
4. User can now access the admin panel

---

## 📊 How Posts Are Saved

When you run the scraper:
1. Scrapes all posts from the Telegram channel (text, timestamps, media URLs)
2. Checks for duplicates (by message ID) in Firestore
3. Saves only new posts to `telegram_messages` collection
4. Updates channel metadata with count and last scraped date

**Firestore Collections:**
- `telegram_messages` - All posts (public read access)
- `telegram_channels` - Channel configs (admin only)
- `admin_users` - List of authorized admins (admin only)

---

## 🔐 Security

- **Public posts** are visible to anyone at https://susah-sinyal.web.app
- **Admin panel** requires Google authentication and admin email verification
- **Service account** is only used for local scraping (never exposed)
- **Firestore rules** restrict channel management to authorized admins

---

## 📝 Firestore Rules

```
- telegram_messages: Anyone can read, authenticated users can write
- telegram_channels: Only admins can read/write
- admin_users: Only admins can read, only super admin can write
```

---

## 🛠️ Project Structure

```
SusahSinyal/
├── public/
│   ├── index.html              # Public feed page
│   ├── admin.html              # Admin panel
│   └── admin.js                # Admin panel logic
├── scripts/
│   ├── telegram-scraper.js     # Local scraper script
│   └── scraper.js              # (deprecated, use telegram-scraper.js)
├── functions/                   # (Not used - requires Blaze plan)
├── .env.example                # Environment template
├── .env                        # (Not in git - create locally)
├── firebase.json               # Firebase config
├── firestore.rules             # Firestore security rules
└── package.json                # Node.js dependencies
```

---

## 🔧 Troubleshooting

### Error: "FIREBASE_SERVICE_ACCOUNT not set in .env"
- Copy `.env.example` to `.env`
- Add your Firebase service account JSON

### Error: "No messages found"
- Check the Telegram channel URL is correct
- Channel must be a **public** channel (t.me/s/...)
- Try visiting the URL in your browser first

### Error: "Permission denied" when saving to Firestore
- Verify your service account JSON is valid
- Check Firestore rules are deployed
- Run: `firebase deploy --only firestore:rules`

### Admin panel not loading
- Check https://susah-sinyal.web.app/admin.html loads
- Open browser console (F12) to see errors
- Verify your email is in the admin_users list

---

## 📱 Adding Multiple Channels

1. Add channel via admin panel
2. Run scraper for each channel:
   ```bash
   npm run scrape -- https://t.me/s/channel1
   npm run scrape -- https://t.me/s/channel2
   npm run scrape -- https://t.me/s/channel3
   ```

3. All posts appear in the public feed at https://susah-sinyal.web.app

---

## 🔄 Automating Scraping (Optional)

### Using GitHub Actions (Schedule every 6 hours)
Create `.github/workflows/scrape.yml`:
```yaml
name: Scrape Telegram
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scrape -- https://t.me/s/tradingmasnael
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

Then add your service account JSON as a GitHub Secret.

### Using Cron Job (macOS/Linux)
```bash
# Edit crontab
crontab -e

# Add line (runs every 6 hours)
0 */6 * * * cd /path/to/SusahSinyal && npm run scrape -- https://t.me/s/tradingmasnael
```

---

## 📞 Support

- **Firebase Console:** https://console.firebase.google.com/project/susah-sinyal
- **Admin Panel:** https://susah-sinyal.web.app/admin.html
- **Public Feed:** https://susah-sinyal.web.app

---

## 📄 License

MIT
