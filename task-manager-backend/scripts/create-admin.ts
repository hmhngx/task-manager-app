import * as bcrypt from 'bcrypt';

async function generateAdminPassword(password: string): Promise<void> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Use this JSON to create admin user:');
  console.log(
    JSON.stringify(
      {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      },
      null,
      2,
    ),
  );
}

// Replace 'your_password' with your desired admin password
generateAdminPassword('garnacho');
