class AppPresenter {
  constructor({ view, model, authModel, router }) {
    this.view = view;
    this.model = model;
    this.authModel = authModel;
    this.router = router;
    
    this._initRouter();
    this._setupNavigation();
  }
  
  _initRouter() {
    this.router
      .addRoute('/', () => {
        this._applyViewTransition();
        const homeView = this.view.renderHomePage();
        const homePresenter = new HomePresenter({
          view: homeView,
          model: this.model
        });
        homePresenter.init();
      }, { requiresAuth: true })
      
      .addRoute('/tambah', () => {
        this._applyViewTransition();
        const addStoryView = this.view.renderAddStoryPage();
        const addStoryPresenter = new AddStoryPresenter({
          view: addStoryView,
          model: this.model
        });
        addStoryPresenter.init();
      }, { requiresAuth: true })
      
      .addRoute('/peta', () => {
        this._applyViewTransition();
        const mapView = this.view.renderMapPage();
        const mapPresenter = new MapPresenter({
          view: mapView,
          model: this.model
        });
        mapPresenter.init();
      }, { requiresAuth: true })
      
      .addRoute('/masuk', () => {
        this._applyViewTransition();
        const loginView = this.view.renderLoginPage();
        const loginPresenter = new LoginPresenter({
          view: loginView,
          model: this.authModel,
          router: this.router
        });
        loginPresenter.init();
      }, { guestOnly: true })
      
      .addRoute('/daftar', () => {
        this._applyViewTransition();
        const registerView = this.view.renderRegisterPage();
        const registerPresenter = new RegisterPresenter({
          view: registerView,
          model: this.authModel,
          router: this.router
        });
        registerPresenter.init();
      }, { guestOnly: true })
      
      .setFallback(() => {
        console.error('Halaman tidak ditemukan');
        this.router.navigateTo('/');
      });
  }
  
  _setupNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
        navMenu.classList.toggle('active');
      });
    }
    
    // Update auth nav item based on authentication status
    this._updateAuthNavItem();
    
    // Add click event listeners to all navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
  
  _updateAuthNavItem() {
    const authNavItem = document.getElementById('authNavItem');
    const authNavText = document.getElementById('authNavText');
    
    if (authNavItem && authNavText) {
      const isLoggedIn = localStorage.getItem('token') !== null;
      
      if (isLoggedIn) {
        authNavItem.innerHTML = `<a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Keluar</a>`;
        
        // Add logout functionality
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('token');
          this.router.navigateTo('/masuk');
          this._updateAuthNavItem();
        });
      } else {
        authNavItem.innerHTML = `<a href="#/masuk"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a>`;
      }
    }
  }
  
  _applyViewTransition() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.classList.add('view-transition');
      
      // Remove the class after animation completes
      setTimeout(() => {
        mainContent.classList.remove('view-transition');
      }, 300);
    }
  }
  
  start() {
    this.router.init();
  }
}