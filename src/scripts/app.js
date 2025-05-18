// app.js
import swRegister from './utils/sw-register.js';
import offlineIndicator from './view/components/offline-indicator.js';
import DbHelper from './utils/idb-helper.js';
import networkStatus from './utils/network-status.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = {
    async init() {
      console.log('App initializing...');
      
      // Register service worker
      await swRegister();
      
      // Initialize the offline indicator (imported as singleton)
      console.log('Offline indicator initialized');
      
      // Initialize IndexedDB
      try {
        await DbHelper.openDB();
        console.log('IndexedDB initialized');
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
      
      // Create models
      const storyModel = new StoryModel(apiService);
      const authModel = apiService;
      
      // Create views
      const appView = new AppView();
      const homeView = new HomeView();
      const addStoryView = new AddStoryView();
      const loginView = new LoginView();
      const registerView = new RegisterView();
      
      console.log('Views created');
      
      // Create app presenter
      const appPresenter = new AppPresenter({
        view: appView,
        storyModel: storyModel,
        authModel: authModel,
        router: router // Use the existing global router 
      });

      const homePresenter = new HomePresenter({
        view: homeView,
        model: storyModel,
      });
      
      const addStoryPresenter = new AddStoryPresenter({
        view: addStoryView,
        model: storyModel,
      });
      
      console.log('Creating login presenter...');
      const loginPresenter = new LoginPresenter({
        view: loginView,
        apiService,
        router,
      });
      
      console.log('Creating register presenter...');
      const registerPresenter = new RegisterPresenter({
        view: registerView,
        apiService,
        router,
      });
      
      console.log('Presenters initialized');
      
      // Add global event listener to stop camera on page navigation
      window.addEventListener('hashchange', () => {
        console.log('Page navigation detected, checking if camera needs to be stopped');
        
        if (cameraHelper && cameraHelper.stream) {
          console.log('Active camera stream detected during navigation, stopping it');
          cameraHelper.stopCamera();
        }
      });
      
      // Configure router
      router
        .addRoute('/', () => {
          console.log('Navigating to home page');
          document.querySelector('#mainContent').innerHTML = ''; // Clear previous content
          
          const homeView = new HomeView();
          const homePresenter = new HomePresenter({
            view: homeView,
            model: storyModel
          });
          
          homePresenter.init();
          homeView.render();
        }, { requiresAuth: true })
          
        .addRoute('/tambah', () => {
          console.log('Navigating to add story page');
          document.querySelector('#mainContent').innerHTML = ''; // Clear previous content
          
          const addStoryView = new AddStoryView();
          addStoryView.render();
          
          const addStoryPresenter = new AddStoryPresenter({
            view: addStoryView,
            model: storyModel
          });
          
          addStoryPresenter.init();
        }, { requiresAuth: true })
          
        .addRoute('/peta', () => {
          console.log('Navigating to map page');
          // Check and stop camera if active
          if (cameraHelper && cameraHelper.stream) {
            console.log('Active camera stream detected, stopping it');
            cameraHelper.stopCamera();
          }
          
          // Clear previous content
          document.querySelector('#mainContent').innerHTML = '';
          
          // Create and render map view
          const mapView = new MapView();
          mapView.render();
          
          // Create map presenter
          const mapPresenter = new MapPresenter({
            view: mapView,
            model: storyModel
          });
          
          mapPresenter.init();
        }, { requiresAuth: true })
          
        .addRoute('/masuk', () => {
          console.log('Rendering login page');
          document.querySelector('#mainContent').innerHTML = ''; // Clear content first
          loginView.render();
        }, { guestOnly: true })
          
        .addRoute('/daftar', () => {
          console.log('Rendering register page');
          document.querySelector('#mainContent').innerHTML = ''; // Clear content first
          registerView.render();
        }, { guestOnly: true })
          
        .setFallback(() => {
          console.error('Halaman tidak ditemukan');
          document.querySelector('#mainContent').innerHTML = '';
          
          // Render 404 page
          const notFoundView = new NotFoundView();
          notFoundView.render();
        });
      
      console.log('Routes configured');
      
      router.init();
      
      // Setup skip link
      this._setupSkipLink();
      
      // Setup navigation toggle
      this._setupNavigation();
      
      // Add click handlers for navigation
      this._setupNavClicks();

      appPresenter.start();
      
      // Add View Transition styles
      this._addViewTransitionStyles();
      
      // Check and sync offline data if needed
      if (networkStatus.isOnline()) {
        console.log('Online at startup, checking for offline data to sync');
        setTimeout(() => {
          storyModel.syncOfflineStories();
        }, 2000);
      }
      
      console.log('App initialization complete');
    },
    
    _setupSkipLink() {
      const mainContent = document.querySelector('#mainContent');
      const skipLink = document.querySelector('.skip-link');
      
      if (mainContent && skipLink) {
        skipLink.addEventListener('click', function (event) {
          event.preventDefault();
          skipLink.blur();
          mainContent.focus();
          mainContent.scrollIntoView();
        });
      }
    },
    
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
      
      // Update navigation based on auth status
      this._updateAuthNavItem();
      
      // Handle auth status changes
      document.addEventListener('authChanged', () => {
        console.log('Auth status changed');
        this._updateAuthNavItem();
      });
    },
    
    _setupNavClicks() {
      // Explicitly add click handlers to nav items
      document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href.startsWith('#')) {
            e.preventDefault();
            console.log('Navigation link clicked:', href);
            router.navigateTo(href.substring(1));
          }
        });
      });
    },
    
    _updateAuthNavItem() {
      const authNavItem = document.getElementById('authNavItem');
      
      if (authNavItem) {
        const isLoggedIn = localStorage.getItem('token') !== null;
        console.log('Updating auth nav item, isLoggedIn:', isLoggedIn);
        
        if (isLoggedIn) {
          authNavItem.innerHTML = `<a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Keluar</a>`;
          
          // Add logout functionality
          const logoutBtn = document.getElementById('logoutBtn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
              e.preventDefault();
              console.log('Logout clicked');
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('name');
              router.navigateTo('/masuk');
              document.dispatchEvent(new Event('authChanged'));
            });
          }
        } else {
          authNavItem.innerHTML = `<a href="#/masuk"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a>`;
        }
      }
    },
    
    _addViewTransitionStyles() {
      // Add transition styles if the browser supports the View Transition API
      if (!document.getElementById('viewTransitionStyles')) {
        const style = document.createElement('style');
        style.id = 'viewTransitionStyles';
        style.textContent = `
          /* Basic transitions for all browsers */
          #mainContent {
            transition: opacity 0.3s ease;
          }
          
          /* View Transitions API specific styles */
          @supports (view-transition: same) {
            ::view-transition-old(root) {
              animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both fade-out;
            }
            
            ::view-transition-new(root) {
              animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both fade-in;
            }
            
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes fade-out {
              from { opacity: 1; }
              to { opacity: 0; }
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  };
  
  console.log('Starting app...');
  app.init();
});