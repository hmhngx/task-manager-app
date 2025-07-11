import { connect, disconnect, model } from 'mongoose';
import { UserSchema } from '../src/modules/users/user.schema';

async function migrateAdminFields() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the User model
    const UserModel = model('User', UserSchema);

    // Find all admin users
    const adminUsers = await UserModel.find({ role: 'admin' }).exec();
    console.log(`Found ${adminUsers.length} admin users to update`);

    if (adminUsers.length === 0) {
      console.log('No admin users found to migrate');
      return;
    }

    // Update each admin user with missing fields
    for (const adminUser of adminUsers) {
      const updateData: any = {};

      // Add isActive if missing
      if (adminUser.isActive === undefined) {
        updateData.isActive = true;
      }

      // Add permissions if missing
      if (!adminUser.permissions || adminUser.permissions.length === 0) {
        updateData.permissions = [
          'create:task',
          'read:task',
          'update:task',
          'delete:task',
          'create:user',
          'read:user',
          'update:user',
          'delete:user',
          'admin:all',
        ];
      }

      // Add profile if missing
      if (!adminUser.profile) {
        updateData.profile = {
          firstName: adminUser.username || 'Admin',
          lastName: 'User',
          bio: 'System Administrator',
        };
      }

      // Update the user if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await UserModel.updateOne({ _id: adminUser._id }, { $set: updateData });
        console.log(`✅ Updated admin user: ${adminUser.email || adminUser.username}`);
      } else {
        console.log(
          `ℹ️  Admin user already has all fields: ${adminUser.email || adminUser.username}`,
        );
      }
    }

    console.log('✅ Admin fields migration completed successfully!');
  } catch (error) {
    console.error('Failed to migrate admin fields:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run script if executed directly
if (require.main === module) {
  migrateAdminFields()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { migrateAdminFields };
