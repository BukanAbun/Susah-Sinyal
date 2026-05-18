const admin = require('firebase-admin');
const serviceAccount = require('../firebaseServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(collectionPath) {
  const batch = db.batch();
  const snapshot = await db.collection(collectionPath).get();
  
  console.log(`Found ${snapshot.size} documents in ${collectionPath}`);
  
  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  if (snapshot.size > 0) {
    await batch.commit();
    console.log(`✅ Deleted all documents in ${collectionPath}`);
  } else {
    console.log(`⏭️  No documents to delete in ${collectionPath}`);
  }
}

async function cleanup() {
  try {
    console.log('🧹 Starting cleanup...\n');
    
    await deleteCollection('telegram_messages');
    await deleteCollection('telegram_channels');
    
    console.log('\n✅ Cleanup complete! Ready to add new channels.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanup();
