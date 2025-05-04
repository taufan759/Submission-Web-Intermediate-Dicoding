class HomePresenter {
    constructor({ view, model }) {
      this.view = view;
      this.model = model;
    }
    
    async init() {
      
      this.view.showLoading();
      
      try {
        
        const stories = await this.model.getAllStories();
        
        
        this.view.showStories(stories);
      } catch (error) {
        this.view.showError('Gagal memuat cerita. Silakan coba lagi nanti.');
        console.error(error);
      }
    }
  }