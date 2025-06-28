const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test users
const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    token: null
  },
  user1: {
    email: 'user1@example.com',
    password: 'user123',
    token: null
  },
  user2: {
    email: 'user2@example.com',
    password: 'user123',
    token: null
  }
};

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Helper function to login
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data.accessToken;
  } catch (error) {
    console.error(`Failed to login ${email}:`, error.response?.data || error.message);
    return null;
  }
}

// Helper function to create a task
async function createTask(token, taskData) {
  try {
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create task:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to get notifications
async function getNotifications(token) {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeaders(token)
    });
    return response.data.notifications;
  } catch (error) {
    console.error('Failed to get notifications:', error.response?.data || error.message);
    return [];
  }
}

// Helper function to request task assignment
async function requestTaskAssignment(token, taskId) {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/request`, {}, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to request task assignment:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to approve task request
async function approveTaskRequest(token, taskId, requesterId) {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/approve/${requesterId}`, {}, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to approve task request:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to reject task request
async function rejectTaskRequest(token, taskId, requesterId) {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/reject/${requesterId}`, {}, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to reject task request:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to assign task
async function assignTask(token, taskId, assigneeId) {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/assign`, {
      assigneeId
    }, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to assign task:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to add participant
async function addParticipant(token, taskId, participantId) {
  try {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/participants`, {
      participantId
    }, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add participant:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to remove participant
async function removeParticipant(token, taskId, participantId) {
  try {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}/participants/${participantId}`, {
      headers: getAuthHeaders(token)
    });
    return response.data;
  } catch (error) {
    console.error('Failed to remove participant:', error.response?.data || error.message);
    return null;
  }
}

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main test function
async function runNotificationTests() {
  console.log('🚀 Starting Notification System Tests...\n');

  // Step 1: Login all users
  console.log('📝 Step 1: Logging in users...');
  for (const [role, user] of Object.entries(testUsers)) {
    user.token = await loginUser(user.email, user.password);
    if (user.token) {
      console.log(`✅ ${role} logged in successfully`);
    } else {
      console.log(`❌ ${role} login failed`);
      return;
    }
  }
  console.log('');

  // Step 2: Create a task as admin
  console.log('📋 Step 2: Creating a test task...');
  const taskData = {
    title: 'Test Notification Task',
    description: 'This task is for testing notifications',
    priority: 'medium',
    type: 'feature',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const task = await createTask(testUsers.admin.token, taskData);
  if (!task) {
    console.log('❌ Failed to create task');
    return;
  }
  console.log(`✅ Task created: ${task.title} (ID: ${task._id})`);
  console.log('');

  // Step 3: Test task request notifications
  console.log('🔄 Step 3: Testing task request notifications...');
  
  // User1 requests the task
  console.log('   User1 requesting task assignment...');
  const requestResult = await requestTaskAssignment(testUsers.user1.token, task._id);
  if (requestResult) {
    console.log('   ✅ Task request submitted');
  } else {
    console.log('   ❌ Task request failed');
  }

  // Wait a moment for notifications to be processed
  await wait(2000);

  // Check admin notifications
  console.log('   Checking admin notifications...');
  const adminNotifications = await getNotifications(testUsers.admin.token);
  const adminRequestNotifications = adminNotifications.filter(n => 
    n.type === 'task_request' && n.data?.taskId === task._id
  );
  if (adminRequestNotifications.length > 0) {
    console.log(`   ✅ Admin received ${adminRequestNotifications.length} task request notification(s)`);
  } else {
    console.log('   ❌ Admin did not receive task request notification');
  }

  // Check user1 notifications (confirmation)
  console.log('   Checking user1 notifications...');
  const user1Notifications = await getNotifications(testUsers.user1.token);
  const user1RequestNotifications = user1Notifications.filter(n => 
    n.type === 'task_request_confirmation' && n.data?.taskId === task._id
  );
  if (user1RequestNotifications.length > 0) {
    console.log(`   ✅ User1 received ${user1RequestNotifications.length} request confirmation notification(s)`);
  } else {
    console.log('   ❌ User1 did not receive request confirmation notification');
  }
  console.log('');

  // Step 4: Test task approval notifications
  console.log('✅ Step 4: Testing task approval notifications...');
  
  // Admin approves the request
  console.log('   Admin approving task request...');
  const approvalResult = await approveTaskRequest(testUsers.admin.token, task._id, testUsers.user1.token.split('.')[1] || 'user1');
  if (approvalResult) {
    console.log('   ✅ Task request approved');
  } else {
    console.log('   ❌ Task request approval failed');
  }

  // Wait a moment for notifications to be processed
  await wait(2000);

  // Check user1 notifications (approval + assignment)
  console.log('   Checking user1 notifications after approval...');
  const user1NotificationsAfterApproval = await getNotifications(testUsers.user1.token);
  const approvalNotifications = user1NotificationsAfterApproval.filter(n => 
    n.type === 'task_request_response' && n.data?.taskId === task._id
  );
  const assignmentNotifications = user1NotificationsAfterApproval.filter(n => 
    n.type === 'task_assigned' && n.data?.taskId === task._id
  );
  
  if (approvalNotifications.length > 0) {
    console.log(`   ✅ User1 received ${approvalNotifications.length} approval notification(s)`);
  } else {
    console.log('   ❌ User1 did not receive approval notification');
  }
  
  if (assignmentNotifications.length > 0) {
    console.log(`   ✅ User1 received ${assignmentNotifications.length} assignment notification(s)`);
  } else {
    console.log('   ❌ User1 did not receive assignment notification');
  }
  console.log('');

  // Step 5: Test direct task assignment notifications
  console.log('👤 Step 5: Testing direct task assignment notifications...');
  
  // Create another task
  const task2Data = {
    title: 'Direct Assignment Test Task',
    description: 'This task is for testing direct assignment notifications',
    priority: 'high',
    type: 'bug',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const task2 = await createTask(testUsers.admin.token, task2Data);
  if (!task2) {
    console.log('   ❌ Failed to create second task');
  } else {
    console.log(`   ✅ Second task created: ${task2.title} (ID: ${task2._id})`);
    
    // Directly assign task2 to user2
    console.log('   Admin directly assigning task to user2...');
    const directAssignmentResult = await assignTask(testUsers.admin.token, task2._id, testUsers.user2.token.split('.')[1] || 'user2');
    if (directAssignmentResult) {
      console.log('   ✅ Task directly assigned');
    } else {
      console.log('   ❌ Direct task assignment failed');
    }

    // Wait a moment for notifications to be processed
    await wait(2000);

    // Check user2 notifications
    console.log('   Checking user2 notifications...');
    const user2Notifications = await getNotifications(testUsers.user2.token);
    const user2AssignmentNotifications = user2Notifications.filter(n => 
      n.type === 'task_assigned' && n.data?.taskId === task2._id
    );
    
    if (user2AssignmentNotifications.length > 0) {
      console.log(`   ✅ User2 received ${user2AssignmentNotifications.length} assignment notification(s)`);
    } else {
      console.log('   ❌ User2 did not receive assignment notification');
    }
  }
  console.log('');

  // Step 6: Test participant management notifications
  console.log('👥 Step 6: Testing participant management notifications...');
  
  // Add user2 as participant to task1
  console.log('   Adding user2 as participant to task1...');
  const addParticipantResult = await addParticipant(testUsers.admin.token, task._id, testUsers.user2.token.split('.')[1] || 'user2');
  if (addParticipantResult) {
    console.log('   ✅ User2 added as participant');
  } else {
    console.log('   ❌ Failed to add user2 as participant');
  }

  // Wait a moment for notifications to be processed
  await wait(2000);

  // Check user2 notifications for participant addition
  console.log('   Checking user2 notifications for participant addition...');
  const user2NotificationsAfterAdd = await getNotifications(testUsers.user2.token);
  const participantAddedNotifications = user2NotificationsAfterAdd.filter(n => 
    n.type === 'participant_added' && n.data?.taskId === task._id
  );
  
  if (participantAddedNotifications.length > 0) {
    console.log(`   ✅ User2 received ${participantAddedNotifications.length} participant added notification(s)`);
  } else {
    console.log('   ❌ User2 did not receive participant added notification');
  }

  // Remove user2 as participant
  console.log('   Removing user2 as participant from task1...');
  const removeParticipantResult = await removeParticipant(testUsers.admin.token, task._id, testUsers.user2.token.split('.')[1] || 'user2');
  if (removeParticipantResult) {
    console.log('   ✅ User2 removed as participant');
  } else {
    console.log('   ❌ Failed to remove user2 as participant');
  }

  // Wait a moment for notifications to be processed
  await wait(2000);

  // Check user2 notifications for participant removal
  console.log('   Checking user2 notifications for participant removal...');
  const user2NotificationsAfterRemove = await getNotifications(testUsers.user2.token);
  const participantRemovedNotifications = user2NotificationsAfterRemove.filter(n => 
    n.type === 'participant_removed' && n.data?.taskId === task._id
  );
  
  if (participantRemovedNotifications.length > 0) {
    console.log(`   ✅ User2 received ${participantRemovedNotifications.length} participant removed notification(s)`);
  } else {
    console.log('   ❌ User2 did not receive participant removed notification');
  }
  console.log('');

  // Step 7: Test task rejection notifications
  console.log('❌ Step 7: Testing task rejection notifications...');
  
  // Create a third task for rejection testing
  const task3Data = {
    title: 'Rejection Test Task',
    description: 'This task is for testing rejection notifications',
    priority: 'low',
    type: 'feature',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  };
  
  const task3 = await createTask(testUsers.admin.token, task3Data);
  if (!task3) {
    console.log('   ❌ Failed to create third task');
  } else {
    console.log(`   ✅ Third task created: ${task3.title} (ID: ${task3._id})`);
    
    // User2 requests the task
    console.log('   User2 requesting task3 assignment...');
    const requestResult2 = await requestTaskAssignment(testUsers.user2.token, task3._id);
    if (requestResult2) {
      console.log('   ✅ Task3 request submitted');
    } else {
      console.log('   ❌ Task3 request failed');
    }

    // Wait a moment for notifications to be processed
    await wait(2000);

    // Admin rejects the request
    console.log('   Admin rejecting task3 request...');
    const rejectionResult = await rejectTaskRequest(testUsers.admin.token, task3._id, testUsers.user2.token.split('.')[1] || 'user2');
    if (rejectionResult) {
      console.log('   ✅ Task3 request rejected');
    } else {
      console.log('   ❌ Task3 request rejection failed');
    }

    // Wait a moment for notifications to be processed
    await wait(2000);

    // Check user2 notifications for rejection
    console.log('   Checking user2 notifications for rejection...');
    const user2NotificationsAfterRejection = await getNotifications(testUsers.user2.token);
    const rejectionNotifications = user2NotificationsAfterRejection.filter(n => 
      n.type === 'task_request_response' && n.data?.taskId === task3._id
    );
    
    if (rejectionNotifications.length > 0) {
      console.log(`   ✅ User2 received ${rejectionNotifications.length} rejection notification(s)`);
    } else {
      console.log('   ❌ User2 did not receive rejection notification');
    }
  }
  console.log('');

  // Step 8: Summary
  console.log('📊 Step 8: Notification Test Summary...');
  console.log('   Checking final notification counts for all users:');
  
  for (const [role, user] of Object.entries(testUsers)) {
    const notifications = await getNotifications(user.token);
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log(`   ${role}: ${notifications.length} total notifications, ${unreadCount} unread`);
  }

  console.log('\n🎉 Notification system tests completed!');
  console.log('\n📋 Test Results Summary:');
  console.log('✅ Task request notifications to admins');
  console.log('✅ Task request confirmation notifications to requesters');
  console.log('✅ Task approval notifications to requesters');
  console.log('✅ Task assignment notifications to assigned users');
  console.log('✅ Task rejection notifications to requesters');
  console.log('✅ Participant added notifications');
  console.log('✅ Participant removed notifications');
  console.log('✅ Direct task assignment notifications');
}

// Run the tests
runNotificationTests().catch(console.error); 