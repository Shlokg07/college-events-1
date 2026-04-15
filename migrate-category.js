/**
 * Migration Script: Update Category from "Tech Workshop" to "Tech"
 * 
 * Run this script to update all existing events in the database
 * Usage: node migrate-category.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_events';

async function migrateCategoryName() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Updating all "Tech Workshop" categories to "Tech"...');
    
    // Update all documents with "Tech Workshop" category to "Tech"
    const result = await Event.updateMany(
      { category: 'Tech Workshop' },
      { $set: { category: 'Tech' } }
    );

    console.log(`✅ Migration Complete!`);
    console.log(`   📝 Documents matched: ${result.matchedCount}`);
    console.log(`   🔄 Documents modified: ${result.modifiedCount}`);

    if (result.modifiedCount === 0) {
      console.log('   ℹ️  No events found with "Tech Workshop" category - already up to date!');
    }

    // Verify the update
    const techEvents = await Event.countDocuments({ category: 'Tech' });
    const oldTechEvents = await Event.countDocuments({ category: 'Tech Workshop' });
    
    console.log('\n📈 Verification:');
    console.log(`   ✅ Events with "Tech" category: ${techEvents}`);
    console.log(`   ❌ Events with "Tech Workshop" category: ${oldTechEvents}`);

    await mongoose.connection.close();
    console.log('\n✅ Migration script completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateCategoryName();
