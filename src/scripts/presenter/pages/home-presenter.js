class HomePresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    
    // Set presenter reference in the view
    this.view.setPresenter(this);
  }
  
  async loadStories() {
    console.log('HomePresenter.loadStories called');
    this.view.showLoading();
    
    try {
      const stories = await this.model.getAllStories();
      console.log('Stories loaded:', stories);
      this.view.showStories(stories);
    } catch (error) {
      console.error('Error loading stories:', error);
      this.view.hideLoading();
      this.view.storiesContainer.innerHTML = `
        <div class="error-message">
          <p>Gagal memuat cerita. ${error.message}</p>
          <button id="retryButton" class="btn btn-primary">Coba Lagi</button>
        </div>
      `;
      
      document.getElementById('retryButton')?.addEventListener('click', () => {
        this.loadStories();
      });
    }
  }
  
  init() {
    console.log('HomePresenter initialized');
  }
}