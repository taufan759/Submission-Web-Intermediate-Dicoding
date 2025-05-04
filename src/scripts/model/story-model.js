class StoryModel {
  constructor(apiService) {
    this.apiService = apiService;
    this.stories = [];
    this.listeners = [];
  }

  async fetchStories() {
    try {
      this.stories = await this.apiService.getAllStories();
      this._notifyListeners();
      return this.stories;
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  }

  async addStory(description, photoBlob, lat, lon) {
    try {
      const result = await this.apiService.addNewStory(description, photoBlob, lat, lon);
      await this.fetchStories(); // Refresh stories after adding a new one
      return result;
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }

  getStories() {
    return this.stories;
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  _notifyListeners() {
    this.listeners.forEach(listener => {
      if (typeof listener.onStoriesChanged === 'function') {
        listener.onStoriesChanged(this.stories);
      }
    });
  }
}

const storyModel = new StoryModel(apiService);