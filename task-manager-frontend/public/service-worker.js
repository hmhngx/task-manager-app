// Service Worker for Push Notifications
const CACHE_NAME = 'task-manager-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('No data received with push event');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification data:', data);

    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/logo192.png',
      badge: data.badge || '/logo192.png',
      tag: data.tag || 'default',
      renotify: data.renotify !== false,
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    };

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(data.title || 'Task Manager', options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
    
    // Fallback notification
    const options = {
      body: 'You have a new notification',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'default',
      vibrate: [200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification('Task Manager', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  // Handle different actions
  if (action === 'view' && data.url) {
    // Navigate to the task page
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clients) {
          if (client.url.includes(data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(data.url);
        }
      })
    );
  } else if (data.url) {
    // Default action - navigate to the task page
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clients) {
          if (client.url.includes(data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(data.url);
        }
      })
    );
  } else {
    // No specific URL, just focus on the main app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // You can send analytics data here if needed
  const data = event.notification.data;
  if (data.notificationId) {
    // Optionally mark notification as read when closed
    console.log('Notification closed:', data.notificationId);
  }
});

// Background sync (if needed for offline functionality)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Performing background sync...')
    );
  }
});

// Message event - Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 