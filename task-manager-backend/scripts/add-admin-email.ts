import { connect, disconnect, model } from 'mongoose';
import { User, UserSchema } from '../src/modules/users/user.schema';

async function addAdminEmail() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the User model
    const UserModel = model('User', UserSchema);

    // Find admin users without email
    const adminUsers = await UserModel.find({
      role: 'admin',
      $or: [{ email: { $exists: false } }, { email: null }, { email: '' }],
    }).exec();

    console.log(`Found ${adminUsers.length} admin users without email`);

    if (adminUsers.length === 0) {
      console.log('No admin users found without email');
      return;
    }

    // Update each admin user with a temporary email
    for (const admin of adminUsers) {
      const tempEmail = `admin-${admin.username}@temp.local`;

      await UserModel.findByIdAndUpdate(admin._id, {
        email: tempEmail,
      }).exec();

      console.log(`Updated admin user "${admin.username}" with email: ${tempEmail}`);
      console.log(
        `⚠️  IMPORTANT: Please update this email to a real email address for production use.`,
      );
    }

    console.log('\n✅ Admin users updated successfully!');
    console.log('You can now log in with the temporary email addresses.');
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run script if executed directly
if (require.main === module) {
  addAdminEmail()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { addAdminEmail };
