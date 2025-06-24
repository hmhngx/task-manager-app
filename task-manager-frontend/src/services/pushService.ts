import axios from 'axios';
import { API_URL } from '../config';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushService {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    const permission = await this.requestPermission();
    if (!permission) {
      console.log('Notification permission not granted');
      return null;
    }

    const registration = await this.registerServiceWorker();
    if (!registration) {
      console.log('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await this.getVapidPublicKey(),
      });

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async getVapidPublicKey(): Promise<string> {
    try {
      const response = await axios.get(`${API_URL}/auth/push/vapid-public-key`);
      return response.data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      throw new Error('Failed to get VAPID public key');
    }
  }

  async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post(
        `${API_URL}/auth/push/subscribe`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Push subscription sent to backend successfully');
    } catch (error) {
      console.error('Failed to send subscription to backend:', error);
      throw error;
    }
  }

  async unsubscribeFromPushNotifications(endpoint: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(
        `${API_URL}/auth/push/unsubscribe/${encodeURIComponent(endpoint)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log('Push subscription unsubscribed successfully');
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  async deactivateAllSubscriptions(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`${API_URL}/auth/push/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('All push subscriptions deactivated successfully');
    } catch (error) {
      console.error('Failed to deactivate all subscriptions:', error);
      throw error;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async initializePushNotifications(): Promise<boolean> {
    try {
      const subscription = await this.subscribeToPushNotifications();
      if (subscription) {
        await this.sendSubscriptionToBackend(subscription);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }
}

export const pushService = new PushService();
export default pushService; 