class DbHelper {
  static dbPromise = null;

  static async openDB() {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        console.log('Opening IndexedDB');
        const request = indexedDB.open('petabicara-db', 1);

        request.onupgradeneeded = (event) => {
          console.log('Upgrading IndexedDB');
          const db = event.target.result;
          
          // Create object store for stories
          if (!db.objectStoreNames.contains('stories')) {
            console.log('Creating stories object store');
            db.createObjectStore('stories', { keyPath: 'id' });
          }
          
          // Create object store for offline submission queue
          if (!db.objectStoreNames.contains('offlineQueue')) {
            console.log('Creating offlineQueue object store');
            db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          }
        };

        request.onsuccess = () => {
          console.log('IndexedDB opened successfully');
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error opening IndexedDB', request.error);
          reject(request.error);
        };
      });
    }

    return this.dbPromise;
  }

  static async saveStories(stories) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('stories', 'readwrite');
      const store = transaction.objectStore('stories');

      // Clear existing stories to avoid duplicates (optional)
      // await store.clear();

      console.log(`Saving ${stories.length} stories to IndexedDB`);
      stories.forEach(story => {
        store.put(story);
      });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Stories saved successfully');
          resolve(true);
        };
        
        transaction.onerror = () => {
          console.error('Error saving stories', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Failed to save stories to IndexedDB', error);
      throw error;
    }
  }

  static async getStories() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('stories', 'readonly');
      const store = transaction.objectStore('stories');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log(`Retrieved ${request.result.length} stories from IndexedDB`);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting stories from IndexedDB', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to get stories from IndexedDB', error);
      return [];
    }
  }

  static async getStoryById(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('stories', 'readonly');
      const store = transaction.objectStore('stories');
      
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting story by ID', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Failed to get story with ID ${id} from IndexedDB`, error);
      return null;
    }
  }

  static async deleteStory(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('stories', 'readwrite');
      const store = transaction.objectStore('stories');
      
      console.log(`Deleting story with ID ${id} from IndexedDB`);
      store.delete(id);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`Story ${id} deleted successfully`);
          resolve(true);
        };
        
        transaction.onerror = () => {
          console.error('Error deleting story', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error(`Failed to delete story with ID ${id} from IndexedDB`, error);
      throw error;
    }
  }

  static async saveOfflineStory(storyData) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('offlineQueue', 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      
      const queueItem = {
        id: `offline-${Date.now()}`,
        type: 'add-story',
        data: storyData,
        timestamp: new Date().getTime()
      };
      
      console.log('Saving story to offline queue', queueItem);
      store.add(queueItem);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Story saved to offline queue successfully');
          resolve(queueItem.id);
        };
        
        transaction.onerror = () => {
          console.error('Error saving to offline queue', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Failed to save to offline queue', error);
      throw error;
    }
  }

  static async getOfflineQueue() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('offlineQueue', 'readonly');
      const store = transaction.objectStore('offlineQueue');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          console.log(`Retrieved ${request.result.length} items from offline queue`);
          resolve(request.result);
        };
        
        request.onerror = () => {
          console.error('Error getting offline queue', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to get offline queue', error);
      return [];
    }
  }

  static async deleteFromOfflineQueue(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('offlineQueue', 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      
      console.log(`Deleting item with ID ${id} from offline queue`);
      store.delete(id);
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`Offline queue item ${id} deleted successfully`);
          resolve(true);
        };
        
        transaction.onerror = () => {
          console.error('Error deleting from offline queue', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Failed to delete from offline queue', error);
      throw error;
    }
  }

  static async clearOfflineQueue() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction('offlineQueue', 'readwrite');
      const store = transaction.objectStore('offlineQueue');
      
      console.log('Clearing offline queue');
      store.clear();
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('Offline queue cleared successfully');
          resolve(true);
        };
        
        transaction.onerror = () => {
          console.error('Error clearing offline queue', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Failed to clear offline queue', error);
      throw error;
    }
  }
}

export default DbHelper;