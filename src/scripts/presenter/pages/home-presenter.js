// src/scripts/presenter/pages/home-presenter.js (Updated)
import DbHelper from '../../utils/idb-helper.js';

class HomePresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    
    // Set presenter reference in the view
    this.view.setPresenter(this);
    console.log('HomePresenter initialized with view and model');
  }
  
  init() {
    console.log('HomePresenter.init called');
    // The view will call loadStories when rendered
  }
  
  async loadStories() {
    console.log('HomePresenter.loadStories called');
    
    // Tell the view to show loading state
    this.view.showLoading();
    
    try {
      // Get stories from the model
      console.log('HomePresenter: Requesting stories from model');
      const stories = await this.model.getAllStories();
      console.log('HomePresenter: Stories loaded successfully, count:', stories ? stories.length : 0);
      
      // Check if stories array exists and has items
      if (stories && Array.isArray(stories)) {
        // Update the view with the loaded stories
        this.view.renderStories(stories);
      } else {
        console.warn('HomePresenter: No stories returned or invalid format');
        this.view.renderStories([]);
      }
    } catch (error) {
      console.error('HomePresenter: Error loading stories:', error);
      
      // Show error message in the view
      const errorMessage = error.message || 'Failed to load stories';
      this.view.renderError(errorMessage);
      
      // If the error is due to authentication, check token
      if (errorMessage.includes('token') || errorMessage.includes('authentication')) {
        console.log('HomePresenter: Authentication issue detected, checking token');
        this._checkAuth();
      }
    }
  }
  
  async deleteStory(storyId) {
    console.log(`HomePresenter: Deleting story with ID ${storyId}`);
    try {
      await this.model.deleteStory(storyId);
      console.log(`HomePresenter: Story ${storyId} deleted successfully`);
      this.view.showStoryDeleted(storyId);
    } catch (error) {
      console.error(`HomePresenter: Error deleting story ${storyId}:`, error);
      this.view.renderError(`Failed to delete story: ${error.message}`);
    }
  }
  
  // Helper method to check authentication status
  _checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('HomePresenter: No token found, redirecting to login');
      // Redirect to login page if no token exists
      setTimeout(() => {
        if (window.router) {
          window.router.navigateTo('/masuk');
        }
      }, 1500);
    }
  }
}

export default HomePresenter;