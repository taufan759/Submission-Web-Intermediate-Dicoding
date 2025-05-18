class AddStoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    
    // Set this presenter as the view's presenter
    this.view.setPresenter(this);
    
    console.log('AddStoryPresenter created');
  }
  
  init() {
    console.log('AddStoryPresenter initialized');
  }
  
  async submitStory(formData) {
    // Validate the form through the view
    if (!this.view.validateForm()) {
      return false;
    }
    
    // Show loading indicator
    this.view.showLoading();
    
    try {
      // Get the story data from the view
      const { description, photoBlob, lat, lon } = await this.view.getStoryData();
      console.log('AddStoryPresenter.submitStory called with:', { description, lat, lon });
      
      // Call the model to add the story
      const result = await this.model.addNewStory(description, photoBlob, lat, lon);
      console.log('Story added successfully:', result);
      
      // Show success message
      this.view.showSuccess('Cerita berhasil ditambahkan!');
      
      // Navigate to home page after short delay
      setTimeout(() => {
        this.navigateToHome();
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Add story error:', error);
      this.view.showError(error.message || 'Gagal menambahkan cerita');
      this.view.hideLoading();
      return false;
    }
  }
  
  navigateToHome() {
    // Use router to navigate to home page
    if (window.router) {
      window.router.navigateTo('/');
    }
  }
}