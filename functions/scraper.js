const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape a Telegram public channel and return parsed messages
 * @param {string} channelUrl - Full Telegram channel URL (e.g., https://t.me/s/channelname)
 * @returns {Promise<Array>} Array of message objects
 */
async function scrapeTelegramChannel(channelUrl) {
  try {
    console.log(`Scraping channel: ${channelUrl}`);
    
    // Fetch the channel HTML
    const { data: html } = await axios.get(channelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });
    
    // Parse HTML
    const $ = cheerio.load(html);
    const messages = [];
    
    // Extract messages from the Telegram channel page
    $('div.tgme_widget_message').each((index, element) => {
      try {
        const $msg = $(element);
        
        // Extract message ID from link
        const messageLink = $msg.find('a.tgme_widget_message_date').attr('href');
        const messageId = messageLink ? messageLink.split('/').pop() : `msg_${Date.now()}_${index}`;
        
        // Extract text content
        const textElement = $msg.find('div.tgme_widget_message_text');
        const text = textElement.text().trim();
        
        // Extract timestamp
        const dateElement = $msg.find('a.tgme_widget_message_date');
        const dateTitle = dateElement.attr('title');
        
        // Extract media URLs (images, videos)
        const mediaElements = $msg.find('img[src*="cdn"], video[src*="cdn"]');
        const mediaUrls = mediaElements.map((i, el) => $(el).attr('src')).get().filter(url => url);
        
        // Extract author/channel name if available
        const authorElement = $msg.find('a.tgme_widget_message_owner_name');
        const authorName = authorElement.text().trim();
        
        // Only save if there's content
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
        console.warn(`Error parsing individual message: ${e.message}`);
      }
    });
    
    console.log(`Scraped ${messages.length} messages from ${channelUrl}`);
    return messages;
  } catch (error) {
    console.error(`Error scraping Telegram channel: ${error.message}`);
    throw error;
  }
}

/**
 * Save messages to Firestore, avoiding duplicates
 * @param {Object} db - Firestore database instance
 * @param {Array} messages - Messages to save
 * @returns {Promise<Object>} { newCount, duplicateCount, errors }
 */
async function saveMessagesToFirestore(db, messages, collectionName = 'telegram_messages') {
  let newCount = 0;
  let duplicateCount = 0;
  const errors = [];
  
  for (const msg of messages) {
    try {
      const docRef = db.collection(collectionName).doc(msg.messageId);
      const docSnapshot = await docRef.get();
      
      if (!docSnapshot.exists) {
        await docRef.set(msg);
        newCount++;
        console.log(`Saved new message: ${msg.messageId}`);
      } else {
        duplicateCount++;
      }
    } catch (error) {
      const errorMsg = `Error saving message ${msg.messageId}: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  return { newCount, duplicateCount, errors };
}

module.exports = {
  scrapeTelegramChannel,
  saveMessagesToFirestore
};
