class StoryModel {
    constructor(apiService) {
      this.apiService = apiService;
      this.stories = [];
    }
    
    async getAllStories() {
      try {
        this.stories = await this.apiService.getAllStories();
        return this.stories;
      } catch (error) {
        console.error('Error in StoryModel.getAllStories:', error);
        return [];
      }
    }
    
    async addNewStory(description, photoBlob, lat, lon) {
      try {
        const result = await this.apiService.addNewStory(description, photoBlob, lat, lon);
        
        
        if (!result.error) {
          await this.getAllStories();
        }
        
        return result;
      } catch (error) {
        console.error('Error in StoryModel.addNewStory:', error);
        throw error;
      }
    }
    
    getStoriesWithLocation() {
      return this.stories.filter(story => story.lat && story.lon);
    }
  }
  
  const storyModel = new StoryModel(apiService);