class AppPresenter {
  constructor({ view, storyModel, authModel, router }) {
    this.view = view;
    this.storyModel = storyModel;
    this.authModel = authModel;
    this.router = router;
    
    // Set this presenter as the view's presenter
    this.view.setPresenter(this);
    
    console.log('AppPresenter initialized');
  }
  
  _initRouter() {
    // Clear existing routes (if any)
    this.router.routes = [];
    
    this.router
      .addRoute('/', () => {
        console.log('Navigating to home page');
        this._applyViewTransition(); // Apply transition effect
        
        const homeView = this.view.renderHomePage();
        const homePresenter = new HomePresenter({
          view: homeView,
          model: this.storyModel
        });
        homePresenter.init();
      }, { requiresAuth: true })
      
      .addRoute('/tambah', () => {
        console.log('Navigating to add story page');
        this._applyViewTransition(); // Apply transition effect
        
        const addStoryView = this.view.renderAddStoryPage();
        const addStoryPresenter = new AddStoryPresenter({
          view: addStoryView,
          model: this.storyModel
        });
        addStoryPresenter.init();
      }, { requiresAuth: true })
      
      .addRoute('/peta', () => {
        console.log('Navigating to map page');
        this._applyViewTransition(); // Apply transition effect
        
        // Stop any active camera before navigating
        if (window.cameraHelper && window.cameraHelper.stream) {
          console.log('Stopping camera before map navigation');
          window.cameraHelper.stopCamera();
        }
        
        // Create and render map view
        const mapView = this.view.renderMapPage();
        
        // Create map presenter
        const mapPresenter = new MapPresenter({
          view: mapView,
          model: this.storyModel
        });
        
        mapPresenter.init();
      }, { requiresAuth: true })
      
      .addRoute('/masuk', () => {
        console.log('Rendering login page');
        this._applyViewTransition(); // Apply transition effect
        
        const loginView = this.view.renderLoginPage();
        const loginPresenter = new LoginPresenter({
          view: loginView,
          apiService: this.authModel,
          router: this.router
        });
        loginPresenter.init();
      }, { guestOnly: true })
      
      .addRoute('/daftar', () => {
        console.log('Rendering register page');
        this._applyViewTransition(); // Apply transition effect
        
        const registerView = this.view.renderRegisterPage();
        const registerPresenter = new RegisterPresenter({
          view: registerView,
          apiService: this.authModel,
          router: this.router
        });
        registerPresenter.init();
      }, { guestOnly: true })
      
      .setFallback(() => {
        console.error('Halaman tidak ditemukan');
        this.router.navigateTo('/');
      });
  }
  
  _setupEventListeners() {
    // Setup navigation
    this.view.setupNavigation();
    
    // Setup skip link
    this.view.setupSkipLink();
    
    // Update auth nav item based on authentication status
    this.updateAuthNavigation();
    
    // Listen for auth status changes
    document.addEventListener('authChanged', () => {
      console.log('Auth status changed');
      this.updateAuthNavigation();
    });
    
    // Add global event listener to stop camera on page navigation
    window.addEventListener('hashchange', () => {
      console.log('Page navigation detected, checking if camera needs to be stopped');
      
      // Check if camera is active and stop it if needed
      if (window.cameraHelper && window.cameraHelper.stream) {
        console.log('Active camera stream detected during navigation, stopping it');
        window.cameraHelper.stopCamera();
      }
    });
  }
  
  updateAuthNavigation() {
    const isLoggedIn = this.isAuthenticated();
    this.view.updateAuthNavItem(isLoggedIn);
  }
  
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }
  
  logout() {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    document.dispatchEvent(new Event('authChanged'));
    this.router.navigateTo('/masuk');
  }
  
  _applyViewTransition() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    // Check if browser supports View Transitions API
    if (document.startViewTransition) {
      // Add view-transition class to main content
      mainContent.classList.add('view-transition');
      
      // Use View Transitions API
      document.startViewTransition(() => {
        console.log('View transition started');
      });
    } else {
      // Fallback for browsers that don't support View Transitions API
      mainContent.classList.add('page-transitioning');
      
      // Remove the transitioning class after animation completes
      setTimeout(() => {
        mainContent.classList.remove('page-transitioning');
      }, 300);
    }
  }
  
  reloadPage() {
    window.location.reload();
  }
  
  start() {
    // Initialize router
    this._initRouter();
    
    // Setup event listeners
    this._setupEventListeners();
    
    // Initialize the router
    // Note: We won't call router.init() here since it's already initialized
    // We'll just trigger a route load to ensure the current route is loaded
    this.router._loadRoute();
  }
}