import { connect, disconnect, model } from 'mongoose';
import { User, UserSchema } from '../src/modules/users/user.schema';

async function migrateToEmailAuth() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the User model
    const UserModel = model('User', UserSchema);

    // Get all users
    const users = await UserModel.find({}).exec();
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Check if user already has email field
        if (user.email) {
          console.log(`User ${user.username} already has email: ${user.email}`);
          skippedCount++;
          continue;
        }

        // Generate a temporary email based on username
        const tempEmail = `${user.username}@temp.local`;

        // Update user with email field
        await UserModel.findByIdAndUpdate(user._id, {
          email: tempEmail,
          username: user.username, // Keep existing username
        }).exec();

        console.log(`Migrated user ${user.username} with temporary email: ${tempEmail}`);
        migratedCount++;

        console.log(
          `⚠️  IMPORTANT: User ${user.username} was migrated with temporary email ${tempEmail}`,
        );
        console.log(
          `   Please update this user's email address in the database or through the application.`,
        );
      } catch (error) {
        console.error(`Failed to migrate user ${user.username}:`, error);
      }
    }

    console.log('\nMigration Summary:');
    console.log(`- Total users: ${users.length}`);
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped (already had email): ${skippedCount}`);

    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT: Some users were migrated with temporary emails.');
      console.log(
        '   Please update their email addresses in the database or through the application.',
      );
      console.log('   Temporary emails follow the pattern: username@temp.local');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToEmailAuth()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateToEmailAuth };
