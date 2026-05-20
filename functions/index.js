const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { scrapeTelegramChannel, saveMessagesToFirestore } = require('./scraper');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * HTTP Cloud Function to trigger Telegram channel scrape
 * POST /scrapeTelegram
 * Body: { channelId, channelUrl }
 * Auth: User email must be in admin_users collection
 */
exports.scrapeTelegram = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { channelId, channelUrl } = req.body;

    // Validate inputs
    if (!channelId || !channelUrl) {
      res.status(400).json({ error: 'Missing channelId or channelUrl' });
      return;
    }

    // Get auth token from header
    const authToken = req.headers.authorization?.split('Bearer ')[1];
    if (!authToken) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    // Verify token and get user email
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authToken);
    } catch (error) {
      res.status(401).json({ error: 'Invalid authorization token' });
      return;
    }

    const userEmail = decodedToken.email;

    // Check if user is admin
    const adminRef = db.collection('admin_users').doc('users');
    const adminSnapshot = await adminRef.get();
    const adminData = adminSnapshot.exists ? adminSnapshot.data() : { emails: [] };
    const adminEmails = adminData.emails || [];

    if (!adminEmails.includes(userEmail)) {
      res.status(403).json({ error: 'User is not authorized to perform this action' });
      return;
    }

    console.log(`[${userEmail}] Scraping channel: ${channelUrl}`);

    try {
      // Scrape the channel
      const messages = await scrapeTelegramChannel(channelUrl);

      if (messages.length === 0) {
        // Update channel metadata - successful scrape with 0 messages
        const channelRef = db.collection('telegram_channels').doc(channelId);
        await channelRef.update({
          lastScrapedDate: new Date(),
          lastScrapedBy: userEmail,
          lastScrapeStatus: 'success'
        }).catch(async () => {
          // If channel doc doesn't exist, create it
          await channelRef.set({
            channelId,
            channelUrl,
            createdDate: new Date(),
            lastScrapedDate: new Date(),
            lastScrapedBy: userEmail,
            lastScrapeStatus: 'success',
            totalMessages: 0
          });
        });

        res.status(200).json({
          success: true,
          channelId,
          newCount: 0,
          duplicateCount: 0,
          totalScraped: 0,
          errors: []
        });
        return;
      }

      // Save to Firestore
      const result = await saveMessagesToFirestore(db, messages);

      // Update channel metadata - successful scrape
      const channelRef = db.collection('telegram_channels').doc(channelId);
      await channelRef.update({
        lastScrapedDate: new Date(),
        lastScrapedBy: userEmail,
        lastScrapeStatus: 'success',
        totalMessages: admin.firestore.FieldValue.increment(result.newCount)
      }).catch(async () => {
        // If channel doc doesn't exist, create it
        await channelRef.set({
          channelId,
          channelUrl,
          createdDate: new Date(),
          lastScrapedDate: new Date(),
          lastScrapedBy: userEmail,
          lastScrapeStatus: 'success',
          totalMessages: result.newCount
        });
      });

      res.status(200).json({
        success: true,
        channelId,
        newCount: result.newCount,
        duplicateCount: result.duplicateCount,
        totalScraped: messages.length,
        errors: result.errors
      });
    } catch (scrapeError) {
      // Scrape failed - record the failure
      console.error(`Scrape failed for ${channelUrl}:`, scrapeError.message);
      const channelRef = db.collection('telegram_channels').doc(channelId);
      await channelRef.update({
        lastScrapedDate: new Date(),
        lastScrapedBy: userEmail,
        lastScrapeStatus: 'failed',
        lastScrapeError: scrapeError.message
      }).catch(async () => {
        // If channel doc doesn't exist, create it
        await channelRef.set({
          channelId,
          channelUrl,
          createdDate: new Date(),
          lastScrapedDate: new Date(),
          lastScrapedBy: userEmail,
          lastScrapeStatus: 'failed',
          lastScrapeError: scrapeError.message,
          totalMessages: 0
        });
      });
      throw scrapeError;
    }
  } catch (error) {
    console.error('Error in scrapeTelegram function:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * HTTP Cloud Function to manage admin users
 * POST /manageAdmins
 * Body: { action: 'add' | 'remove', email }
 * Auth: Must be arnold.darwin@gmail.com
 */
exports.manageAdmins = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { action, email } = req.body;

    // Validate
    if (!action || !email) {
      res.status(400).json({ error: 'Missing action or email' });
      return;
    }

    // Get auth token
    const authToken = req.headers.authorization?.split('Bearer ')[1];
    if (!authToken) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authToken);
    } catch (error) {
      res.status(401).json({ error: 'Invalid authorization token' });
      return;
    }

    // Only arnold.darwin@gmail.com can manage admins
    if (decodedToken.email !== 'arnold.darwin@gmail.com') {
      res.status(403).json({ error: 'Only super admin can manage admin users' });
      return;
    }

    const adminRef = db.collection('admin_users').doc('users');
    const adminSnapshot = await adminRef.get();
    let adminEmails = adminSnapshot.exists && adminSnapshot.data().emails ? adminSnapshot.data().emails : [];

    if (action === 'add') {
      if (!adminEmails.includes(email)) {
        adminEmails.push(email);
        await adminRef.set({ emails: adminEmails }, { merge: true });
        res.status(200).json({ success: true, message: `Admin ${email} added`, emails: adminEmails });
      } else {
        res.status(400).json({ error: 'Email already an admin' });
      }
    } else if (action === 'remove') {
      if (email === 'arnold.darwin@gmail.com') {
        res.status(400).json({ error: 'Cannot remove super admin' });
        return;
      }
      adminEmails = adminEmails.filter(e => e !== email);
      await adminRef.set({ emails: adminEmails }, { merge: true });
      res.status(200).json({ success: true, message: `Admin ${email} removed`, emails: adminEmails });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in manageAdmins function:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
