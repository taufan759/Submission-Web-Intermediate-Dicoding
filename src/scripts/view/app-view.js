class AppView {
  constructor() {
    this.mainContent = document.getElementById('mainContent');
    this._resetTransition = this._resetTransition.bind(this);
  }
  
  renderHomePage() {
    return this._renderView('home', () => {
      const homeView = new HomeView();
      homeView.render();
      return homeView;
    });
  }
  
  renderAddStoryPage() {
    return this._renderView('add-story', () => {
      const addStoryView = new AddStoryView();
      addStoryView.render();
      return addStoryView;
    });
  }
  
  renderMapPage() {
    return this._renderView('map', () => {
      const mapView = new MapView();
      mapView.render();
      return mapView;
    });
  }
  
  renderLoginPage() {
    return this._renderView('login', () => {
      const loginView = new LoginView();
      loginView.render();
      return loginView;
    });
  }
  
  renderRegisterPage() {
    return this._renderView('register', () => {
      const registerView = new RegisterView();
      registerView.render();
      return registerView;
    });
  }
  
  _renderView(viewName, renderCallback) {
    this._prepareViewTransition();
    
    // Clear previous content
    this.mainContent.innerHTML = '';
    
    // Create a container for the view
    const viewContainer = document.createElement('div');
    viewContainer.className = `${viewName}-container view-transition-element`;
    viewContainer.setAttribute('role', 'region');
    viewContainer.setAttribute('aria-label', `Halaman ${viewName}`);
    
    this.mainContent.appendChild(viewContainer);
    
    // Make the new view container the main content for the view
    const originalMainContent = this.mainContent;
    this.mainContent = viewContainer;
    
    // Execute the view's render method
    const view = renderCallback();
    
    // Restore original main content reference
    this.mainContent = originalMainContent;
    
    return view;
  }
  
  _prepareViewTransition() {
    // Add transition classes
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this._applyTransitionCSS();
      });
    } else {
      this._applyTransitionCSS();
    }
  }
  
  _applyTransitionCSS() {
    this.mainContent.classList.add('view-transition');
    this.mainContent.addEventListener('animationend', this._resetTransition, { once: true });
  }
  
  _resetTransition() {
    this.mainContent.classList.remove('view-transition');
  }
  
  showLoading() {
    this.mainContent.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner" aria-label="Memuat konten"></div>
        <p>Memuat...</p>
      </div>
    `;
  }
  
  showError(message) {
    this.mainContent.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <h2>Terjadi Kesalahan</h2>
        <p>${message}</p>
        <button class="btn btn-primary" id="retryButton">
          <i class="fas fa-redo" aria-hidden="true"></i>
          Coba Lagi
        </button>
      </div>
    `;
    
    document.getElementById('retryButton').addEventListener('click', () => {
      window.location.reload();
    });
  }
}