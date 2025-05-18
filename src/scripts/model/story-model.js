import DbHelper from '../utils/idb-helper.js';
import networkStatus from '../utils/network-status.js';

class StoryModel {
  constructor(apiService) {
    this.apiService = apiService;
    console.log('StoryModel initialized with apiService');
  }
  
  async getAllStories() {
    try {
      console.log('StoryModel.getAllStories: Requesting stories');
      
      let stories;
      
      // Try to get stories from API if online
      if (networkStatus.isOnline()) {
        try {
          console.log('Online: Getting stories from API');
          stories = await this.apiService.getAllStories();
        } catch (error) {
          console.error('Failed to fetch stories from API:', error);
          // Fallback to IndexedDB
          stories = await DbHelper.getStories();
          console.log('Fallback: Retrieved stories from IndexedDB');
        }
      } else {
        // If offline, use IndexedDB
        console.log('Offline: Getting stories from IndexedDB');
        stories = await DbHelper.getStories();
      }
      
      if (!stories || !Array.isArray(stories)) {
        console.warn('StoryModel: Invalid stories data received');
        return [];
      }
      
      console.log(`StoryModel: Successfully retrieved ${stories.length} stories`);
      
      // Sort stories by creation date (newest first)
      stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return stories;
    } catch (error) {
      console.error('StoryModel: Error getting stories:', error);
      throw new Error(`Failed to load stories: ${error.message}`);
    }
  }
  
  async addNewStory(description, photoBlob, lat, lon) {
    try {
      console.log('StoryModel.addNewStory: Adding new story');
      if (!description || !photoBlob) {
        throw new Error('Description and photo are required');
      }
      
      let result;
      
      if (networkStatus.isOnline()) {
        // Online - send directly to API
        console.log('Online: Sending story to API');
        result = await this.apiService.addNewStory(description, photoBlob, lat, lon);
      } else {
        // Offline - store for later sync
        console.log('Offline: Storing story for later sync');
        result = await this.apiService.addNewStory(description, photoBlob, lat, lon);
      }
      
      return result;
    } catch (error) {
      console.error('StoryModel: Error adding story:', error);
      throw new Error(`Failed to add story: ${error.message}`);
    }
  }
  
  async deleteStory(id) {
    try {
      console.log(`StoryModel.deleteStory: Deleting story with ID ${id}`);
      
      // If it's an offline story (ID starts with 'offline-')
      if (id.startsWith('offline-')) {
        // Delete from IndexedDB
        await DbHelper.deleteStory(id);
        
        // Also try to delete from offline queue if it exists there
        const offlineQueue = await DbHelper.getOfflineQueue();
        const matchingItem = offlineQueue.find(item => item.data && item.data.id === id);
        
        if (matchingItem) {
          await DbHelper.deleteFromOfflineQueue(matchingItem.id);
        }
        
        return { error: false, message: 'Story deleted successfully' };
      } else {
        // If we're online, we would delete from API too
        // but for this app we're only implementing local deletion for now
        await DbHelper.deleteStory(id);
        return { error: false, message: 'Story deleted from local storage' };
      }
    } catch (error) {
      console.error(`StoryModel: Error deleting story ${id}:`, error);
      throw new Error(`Failed to delete story: ${error.message}`);
    }
  }
  
  async syncOfflineStories() {
    if (networkStatus.isOnline()) {
      console.log('StoryModel: Syncing offline stories');
      return this.apiService.syncOfflineData();
    } else {
      console.log('Cannot sync offline stories when offline');
      return false;
    }
  }
}