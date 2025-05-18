// src/scripts/api/api-service.js
import DbHelper from '../utils/idb-helper.js';
import networkStatus from '../utils/network-status.js';

class ApiService {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
    
    // Listen for online status changes to sync data
    networkStatus.addListener((isOnline) => {
      if (isOnline) {
        console.log('Back online! Syncing offline data...');
        this.syncOfflineData();
      }
    });
  }

  async register(name, email, password) {
    try {
      // Check if app is online
      if (!networkStatus.isOnline()) {
        throw new Error('Anda sedang offline. Silakan coba lagi saat online.');
      }
      
      console.log('Registering user:', name, email);
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();
      console.log('Register response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Failed to register: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      // Check if app is online
      if (!networkStatus.isOnline()) {
        throw new Error('Anda sedang offline. Silakan coba lagi saat online.');
      }
      
      console.log('Login attempt for:', email);
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();
      console.log('Login response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      // Simpan token dengan benar
      localStorage.setItem('token', responseJson.loginResult.token);
      // Simpan juga data user untuk referensi
      localStorage.setItem('user', JSON.stringify(responseJson.loginResult));
      
      // After successful login, check and register for push notifications
      this.registerPushNotification();
      
      return responseJson;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

  async getAllStories() {
    try {
      const token = localStorage.getItem('token');
      console.log('Getting stories with token:', token ? 'Token exists' : 'No token');
      
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      // If online, fetch from API and save to IndexedDB
      if (networkStatus.isOnline()) {
        console.log('Online mode: fetching stories from API');
        
        const response = await fetch(`${this.baseUrl}/stories?location=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const responseJson = await response.json();
        console.log('Stories response:', responseJson);
        
        if (responseJson.error) throw new Error(responseJson.message);

        // Save stories to IndexedDB for offline use
        await DbHelper.saveStories(responseJson.listStory);
        
        return responseJson.listStory;
      } else {
        // If offline, get from IndexedDB
        console.log('Offline mode: retrieving stories from IndexedDB');
        const stories = await DbHelper.getStories();
        
        if (!stories || stories.length === 0) {
          console.log('No stories found in IndexedDB');
        } else {
          console.log(`Found ${stories.length} stories in IndexedDB`);
        }
        
        return stories || [];
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      
      if (error.message.includes('Token tidak ditemukan')) {
        // Redirect to login if token is missing
        if (window.router) {
          window.router.navigateTo('/masuk');
        }
      }
      
      // Try to get stories from IndexedDB as fallback
      console.log('Trying to fetch from IndexedDB after error');
      const stories = await DbHelper.getStories();
      return stories || [];
    }
  }

  async addNewStory(description, photoBlob, lat, lon) {
    try {
      const token = localStorage.getItem('token');
      console.log('Adding new story with token:', token ? 'Token exists' : 'No token');
      
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      // Check if online
      if (!networkStatus.isOnline()) {
        console.log('Offline: storing story to IndexedDB for later sync');
        
        // Create a local ID for the offline story
        const offlineId = 'offline-' + Date.now();
        
        // Create a local URL for the image
        const photoUrl = URL.createObjectURL(photoBlob);
        
        // Get user info from localStorage
        const userInfo = JSON.parse(localStorage.getItem('user')) || {};
        
        // Create an offline story object with similar structure to API response
        const offlineStory = {
          id: offlineId,
          name: userInfo.name || 'Offline User',
          description,
          photoUrl,
          createdAt: new Date().toISOString(),
          lat,
          lon,
          isOffline: true  // Flag to identify offline entries
        };
        
        // Save to offline queue for later sync
        await DbHelper.saveOfflineStory({
          description,
          photoBlob,
          lat,
          lon,
          id: offlineId
        });
        
        // Also save to stories for immediate display
        await DbHelper.saveStories([offlineStory]);
        
        return { 
          error: false, 
          message: 'Cerita disimpan untuk diunggah nanti saat online',
          story: offlineStory
        };
      }

      // If online, send to API
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoBlob, 'photo.jpg');
      
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      console.log('Sending request to add story');
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const responseJson = await response.json();
      console.log('Add story response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      // Refresh stories in IndexedDB - fetch the updated list
      this.getAllStories();

      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      throw new Error(`Failed to add story: ${error.message}`);
    }
  }

  async syncOfflineData() {
    console.log('Syncing offline data...');
    
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available, skipping sync');
        return;
      }
      
      // Get offline queue
      const offlineQueue = await DbHelper.getOfflineQueue();
      console.log('Offline queue:', offlineQueue);
      
      if (!offlineQueue || offlineQueue.length === 0) {
        console.log('No offline data to sync');
        return;
      }
      
      // Process each item in the queue
      for (const item of offlineQueue) {
        if (item.type === 'add-story') {
          console.log('Syncing offline story:', item);
          
          try {
            // Get the data and the offline ID
            const { description, photoBlob, lat, lon, id: offlineId } = item.data;
            
            // Send to the API
            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photoBlob, 'photo.jpg');
            
            if (lat !== null && lon !== null) {
              formData.append('lat', lat);
              formData.append('lon', lon);
            }
            
            console.log('Sending offline story to API');
            const response = await fetch(`${this.baseUrl}/stories`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`
              },
              body: formData,
            });
            
            const responseJson = await response.json();
            console.log('Add story response for offline item:', responseJson);
            
            if (responseJson.error) {
              console.error('Error syncing offline story:', responseJson.message);
              continue;
            }
            
            // Remove the offline version from stories
            await DbHelper.deleteStory(offlineId);
            
            // Remove from offline queue
            await DbHelper.deleteFromOfflineQueue(item.id);
            
            console.log('Offline story synced successfully');
          } catch (error) {
            console.error('Failed to sync offline story:', error);
          }
        }
      }
      
      // Refresh stories to get the latest data
      await this.getAllStories();
      
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  // Push notification methods
  async registerPushNotification() {
    try {
      console.log('Checking push notification support...');
      
      // Check if Push API is supported
      if (!('PushManager' in window)) {
        console.log('Push notifications not supported in this browser');
        return false;
      }
      
      // Check if service worker is registered
      if (!navigator.serviceWorker.controller) {
        console.log('Service worker not yet controlling the page');
        return false;
      }
      
      // Request notification permission
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }
      
      console.log('Notification permission granted, getting VAPID key...');
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token available, cannot register for notifications');
        return false;
      }
      
      // Get VAPID key from API
      const response = await fetch(`${this.baseUrl}/notification`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        console.error('Error getting VAPID key:', responseJson.message);
        return false;
      }
      
      const vapidKey = responseJson.data.publicKey;
      console.log('Got VAPID key, subscribing to push service...');
      
      // Convert VAPID key to the correct format
      const vapidPublicKey = this._urlBase64ToUint8Array(vapidKey);
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push service');
        return true;
      }
      
      // Subscribe to push service
      console.log('Creating new push subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });
      
      console.log('Push subscription created:', subscription);
      
      // Send subscription to server
      console.log('Sending subscription to server...');
      const p256dh = btoa(String.fromCharCode.apply(null, 
                    new Uint8Array(subscription.getKey('p256dh'))));
      const auth = btoa(String.fromCharCode.apply(null, 
                  new Uint8Array(subscription.getKey('auth'))));
      
      const subscribeResponse = await fetch(`${this.baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          endpoint: subscription.endpoint,
          keys: {
            p256dh: p256dh,
            auth: auth
          }
        })
      });
      
      const subscribeJson = await subscribeResponse.json();
      
      if (subscribeJson.error) {
        console.error('Push subscription registration error:', subscribeJson.message);
        return false;
      }
      
      console.log('Push notification subscription successful');
      return true;
    } catch (error) {
      console.error('Push notification registration error:', error);
      return false;
    }
  }
  
  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
      
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

const apiService = new ApiService();