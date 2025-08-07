import { connect, disconnect, model } from 'mongoose';
import { UserSchema } from '../src/modules/users/user.schema';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the User model
    const UserModel = model('User', UserSchema);

    // Admin credentials from environment variables or defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskmanager.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminUsername = process.env.ADMIN_USERNAME || 'superadmin';

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: adminEmail }).exec();
    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists`);
      return;
    }

    // Check if username already exists
    const existingUsername = await UserModel.findOne({ username: adminUsername }).exec();
    if (existingUsername) {
      console.log(`Username ${adminUsername} already exists`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = new UserModel({
      email: adminEmail,
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      permissions: [
        'create:task',
        'read:task',
        'update:task',
        'delete:task',
        'create:user',
        'read:user',
        'update:user',
        'delete:user',
        'admin:all',
      ],
      profile: {
        firstName: 'Super',
        lastName: 'Admin',
        bio: 'System Administrator',
      },
    });

    await adminUser.save();

    console.log('✅ Admin account created successfully!');
    console.log('Email:', adminEmail);
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    console.log('Role: admin');
    console.log('\nYou can now log in with these credentials.');
  } catch (error) {
    console.error('Failed to create admin:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run script if executed directly
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { createAdmin };
