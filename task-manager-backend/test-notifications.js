const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testNotifications() {
  try {
    console.log('🔍 Testing notification system...\n');

    // 1. Login as admin
    console.log('1. Logging in as admin...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.access_token;
    console.log('✅ Admin logged in successfully\n');

    // 2. Login as regular user
    console.log('2. Logging in as regular user...');
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@example.com',
      password: 'user123'
    });
    const userToken = userLogin.data.access_token;
    const userId = userLogin.data.user._id;
    console.log('✅ User logged in successfully\n');

    // 3. Create a test task
    console.log('3. Creating a test task...');
    const taskData = {
      title: 'Test Task for Notifications',
      description: 'This task is created to test the notification system',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      assignedTo: [userId]
    };

    const createTask = await axios.post(`${BASE_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const taskId = createTask.data._id;
    console.log('✅ Test task created successfully\n');

    // 4. Add a comment to trigger comment notification
    console.log('4. Adding a comment to trigger notification...');
    const commentData = {
      content: 'This is a test comment to trigger notification'
    };

    await axios.post(`${BASE_URL}/tasks/${taskId}/comments`, commentData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Comment added successfully\n');

    // 5. Change task status to trigger status change notification
    console.log('5. Changing task status...');
    await axios.patch(`${BASE_URL}/tasks/${taskId}`, {
      status: 'in_progress'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Task status changed successfully\n');

    // 6. Check notifications for the user
    console.log('6. Checking user notifications...');
    const notifications = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('📋 User notifications:');
    notifications.data.notifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title}`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Read: ${notification.read}`);
      console.log(`   Timestamp: ${new Date(notification.timestamp).toLocaleString()}`);
      console.log('');
    });

    console.log('🎉 Notification test completed!');
    console.log(`Total notifications: ${notifications.data.notifications.length}`);

  } catch (error) {
    console.error('❌ Error during notification test:', error.response?.data || error.message);
  }
}

// Run the test
testNotifications(); 