class StoryModel {
  constructor(apiService) {
    this.apiService = apiService;
    console.log('StoryModel initialized');
  }
  
  async getAllStories() {
    try {
      console.log('Getting all stories');
      const stories = await this.apiService.getAllStories();
      return stories || [];
    } catch (error) {
      console.error('Error getting stories:', error);
      throw error;
    }
  }
  
  async addNewStory(description, photoBlob, lat, lon) {
    try {
      console.log('Adding new story');
      if (!description || !photoBlob) {
        throw new Error('Description and photo are required');
      }
      
      const result = await this.apiService.addNewStory(description, photoBlob, lat, lon);
      return result;
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }
}