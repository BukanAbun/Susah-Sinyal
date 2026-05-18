#!/usr/bin/env node

/**
 * Telegram Channel Scraper - Local Script
 * Usage: npm run scrape -- https://t.me/s/channelname
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Add your Firebase service account JSON
 * 3. Run: npm install
 * 4. Run: npm run scrape -- <channel-url>
 */

// Polyfill for Node.js 18 compatibility (undici needs File global)
if (typeof global.File === 'undefined') {
  global.File = class File extends Blob {
    constructor(parts, filename, options) {
      super(parts, options);
      this.name = filename;
      this.lastModified = options?.lastModified || Date.now();
    }
  };
}

require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Get channel URL from command line args
const channelUrl = process.argv[2];

if (!channelUrl) {
  console.error('❌ Error: Channel URL is required');
  console.error('Usage: npm run scrape -- https://t.me/s/channelname');
  process.exit(1);
}

if (!channelUrl.startsWith('https://t.me/s/')) {
  console.error('❌ Error: Invalid channel URL. Must start with https://t.me/s/');
  process.exit(1);
}

// Initialize Firebase Admin
async function initializeFirebase() {
  try {
    // Check if .env file exists
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      const envPath = path.join(__dirname, '..', '.env');
      if (!fs.existsSync(envPath)) {
        console.error('❌ Error: .env file not found');
        console.error('1. Copy .env.example to .env');
        console.error('2. Add your Firebase service account JSON');
        process.exit(1);
      }
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT not set in .env');
      process.exit(1);
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    return admin.firestore();
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    process.exit(1);
  }
}

/**
 * Scrape Telegram channel and return messages
 */
async function scrapeTelegramChannel(channelUrl) {
  try {
    console.log(`📡 Scraping: ${channelUrl}`);

    const { data: html } = await axios.get(channelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(html);
    const messages = [];

    $('div.tgme_widget_message').each((index, element) => {
      try {
        const $msg = $(element);

        // Extract message ID
        const messageLink = $msg.find('a.tgme_widget_message_date').attr('href');
        const messageId = messageLink ? messageLink.split('/').pop() : `msg_${Date.now()}_${index}`;

        // Extract text
        const textElement = $msg.find('div.tgme_widget_message_text');
        const text = textElement.text().trim();

        // Extract timestamp
        const dateElement = $msg.find('a.tgme_widget_message_date');
        const dateTitle = dateElement.attr('title');

        // Extract media
        const mediaElements = $msg.find('img[src*="cdn"], video[src*="cdn"]');
        const mediaUrls = mediaElements.map((i, el) => $(el).attr('src')).get().filter(url => url);

        // Extract author
        const authorElement = $msg.find('a.tgme_widget_message_owner_name');
        const authorName = authorElement.text().trim();

        if (text || mediaUrls.length > 0) {
          messages.push({
            messageId,
            text: text || '',
            date: dateTitle || new Date().toISOString(),
            mediaUrls,
            author: authorName || 'Unknown',
            timestamp: new Date().toISOString(),
            channelUrl
          });
        }
      } catch (e) {
        console.warn(`⚠️  Error parsing message: ${e.message}`);
      }
    });

    console.log(`✅ Scraped ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error('❌ Scrape error:', error.message);
    throw error;
  }
}

/**
 * Save messages to Firestore
 */
async function saveMessagesToFirestore(db, messages) {
  let newCount = 0;
  let duplicateCount = 0;

  for (const msg of messages) {
    try {
      const docRef = db.collection('telegram_messages').doc(msg.messageId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        await docRef.set(msg);
        newCount++;
      } else {
        duplicateCount++;
      }
    } catch (error) {
      console.error(`❌ Error saving message ${msg.messageId}:`, error.message);
    }
  }

  return { newCount, duplicateCount };
}

/**
 * Main function
 */
async function main() {
  const db = await initializeFirebase();

  try {
    // Scrape channel
    const messages = await scrapeTelegramChannel(channelUrl);

    if (messages.length === 0) {
      console.log('⚠️  No messages found');
      process.exit(0);
    }

    // Save to Firestore
    const { newCount, duplicateCount } = await saveMessagesToFirestore(db, messages);

    console.log(`\n📊 Results:`);
    console.log(`   ✅ New posts saved: ${newCount}`);
    console.log(`   ⏭️  Duplicates skipped: ${duplicateCount}`);

    // Update channel metadata
    const channelName = channelUrl.split('/').pop();
    const channelRef = db.collection('telegram_channels').doc(channelName);

    await channelRef.update({
      lastScrapedDate: new Date(),
      lastScrapedBy: 'local-script',
      totalMessages: admin.firestore.FieldValue.increment(newCount)
    }).catch(async () => {
      // Create if doesn't exist
      await channelRef.set({
        channelName,
        channelUrl,
        createdDate: new Date(),
        lastScrapedDate: new Date(),
        lastScrapedBy: 'local-script',
        totalMessages: newCount
      });
    });

    console.log(`\n✨ Done!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
