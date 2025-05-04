class StoryModel {
  constructor(apiService) {
    this.apiService = apiService;
    this.stories = [];
  }
  
  async getAllStories() {
    try {
      const stories = await this.apiService.getAllStories();
      this.stories = stories;
      return stories;
    } catch (error) {
      console.error('Error in StoryModel.getAllStories:', error);
      return [];
    }
  }
  
  async addStory(description, photoBlob, lat, lon) {
    try {
      const response = await this.apiService.addNewStory(description, photoBlob, lat, lon);
      return response;
    } catch (error) {
      console.error('Error in StoryModel.addStory:', error);
      throw error;
    }
  }
}