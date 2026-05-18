import admin from 'firebase-admin';
import axios from 'axios';
import * as cheerio from 'cheerio';

const TELEGRAM_CHANNEL_URL = 'https://t.me/s/tradingmasnael';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize Firebase with service account
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT env var is missing');
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function scrapeTelegram() {
  try {
    console.log('Starting Telegram scrape...');
    
    // Fetch the channel HTML
    const { data: html } = await axios.get(TELEGRAM_CHANNEL_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    // Parse HTML
    const $ = cheerio.load(html);
    const messages = [];
    
    // Extract messages
    $('div.tgme_widget_message').each((index, element) => {
      try {
        const $msg = $(element);
        
        // Extract message ID
        const messageLink = $msg.find('a.tgme_widget_message_date').attr('href');
        const messageId = messageLink ? messageLink.split('/').pop() : `msg_${Date.now()}_${index}`;
        
        // Extract text
        const textElement = $msg.find('div.tgme_widget_message_text');
        const text = textElement.text().trim();
        
        // Extract date
        const dateElement = $msg.find('a.tgme_widget_message_date');
        const date = dateElement.attr('title') || new Date().toISOString();
        
        // Extract media
        const mediaElements = $msg.find('img, video');
        const mediaUrls = mediaElements.map((i, el) => $(el).attr('src')).get();
        
        if (text || mediaUrls.length > 0) {
          messages.push({
            messageId,
            text,
            date,
            mediaUrls: mediaUrls.filter(url => url),
            timestamp: new Date().toISOString(),
            notificationSent: false
          });
        }
      } catch (e) {
        console.error('Error parsing message:', e.message);
      }
    });
    
    if (messages.length === 0) {
      console.log('No messages found');
      return;
    }
    
    console.log(`Found ${messages.length} messages`);
    
    // Get last processed message
    const metadataRef = db.collection('telegram_metadata').doc('lastProcessed');
    const metadataSnapshot = await metadataRef.get();
    const lastMessageId = metadataSnapshot.exists ? metadataSnapshot.data().lastMessageId : null;
    
    // Process new messages
    let newCount = 0;
    for (const msg of messages) {
      const docRef = db.collection('telegram_messages').doc(msg.messageId);
      const docSnapshot = await docRef.get();
      
      if (!docSnapshot.exists) {
        newCount++;
        await docRef.set(msg);
        
        // Send Telegram notification
        try {
          const textPreview = msg.text 
            ? msg.text.substring(0, 300) + (msg.text.length > 300 ? '...' : '')
            : '(Media message)';
          
          const notificationText = `📱 *New Message from Trading Channel*\n\n${textPreview}\n\n${msg.date}`;
          
          await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              chat_id: TELEGRAM_CHAT_ID,
              text: notificationText,
              parse_mode: 'Markdown'
            }
          );
          
          await docRef.update({ notificationSent: true });
          console.log(`Notification sent for message ${msg.messageId}`);
        } catch (e) {
          console.error('Error sending notification:', e.message);
        }
      }
    }
    
    // Update metadata
    await metadataRef.set({
      lastMessageId: messages[0].messageId,
      lastChecked: new Date().toISOString(),
      totalMessages: messages.length
    });
    
    console.log(`Scrape completed. New messages: ${newCount}, Total processed: ${messages.length}`);
    
  } catch (error) {
    console.error('Fatal error in scraper:', error.message);
    process.exit(1);
  }
}

// Run scraper
scrapeTelegram().then(() => {
  console.log('Scraper finished successfully');
  process.exit(0);
}).catch(error => {
  console.error('Scraper failed:', error);
  process.exit(1);
});
