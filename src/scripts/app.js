document.addEventListener('DOMContentLoaded', () => {
  const app = {
    async init() {
      console.log('App initializing...');
      
      // Inisialisasi Model
      const storyModel = new StoryModel(apiService);
      
      // Inisialisasi View
      const homeView = new HomeView();
      const addStoryView = new AddStoryView();
      const loginView = new LoginView();
      const registerView = new RegisterView();
      
      console.log('Views created');
      
      // Inisialisasi Presenter
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
      
      // Konfigurasi Router
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
          addStoryView.renderPage();
          
          const addStoryPresenter = new AddStoryPresenter({
            view: addStoryView,
            model: storyModel
          });
          
          addStoryPresenter.init();
        }, { requiresAuth: true })
        
        .addRoute('/peta', () => {
          console.log('Rendering map page');
          // Clear existing content
          document.querySelector('#mainContent').innerHTML = '';
          
          // Tambahkan container untuk peta
          document.querySelector('#mainContent').innerHTML = `
  <section class="map-section" style="margin-top: 100px;">
    <div class="container">
      <h2 class="section-title">Peta Cerita</h2>
      <div id="storyMap" style="height: 500px;"></div>
    </div>
  </section>
          `;
          
          // Inisialisasi peta
          setTimeout(() => {
            const map = L.map('storyMap').setView([-2.5489, 118.0149], 5);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Load stories with location
            storyModel.getAllStories().then(stories => {
              stories.filter(story => story.lat && story.lon).forEach(story => {
                L.marker([story.lat, story.lon])
                  .addTo(map)
                  .bindPopup(`
                    <h3>${story.name}</h3>
                    <p>${story.description}</p>
                    <img src="${story.photoUrl}" alt="${story.name}" style="width:100%;max-width:200px;">
                  `);
              });
            });
          }, 100);
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
          router.navigateTo('/');
        });
      
      console.log('Routes configured');
      
      // Inisialisasi router
      router.init();
      
      // Setup skip link
      this._setupSkipLink();
      
      // Setup navigation toggle
      this._setupNavigation();
      
      // Add click handlers for navigation
      this._setupNavClicks();
      
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
    }
  };
  
  console.log('Starting app...');
  app.init();
});