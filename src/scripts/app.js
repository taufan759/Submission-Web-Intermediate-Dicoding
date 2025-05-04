document.addEventListener('DOMContentLoaded', () => {
  const app = {
    async init() {
      // Inisialisasi Model
      const storyModel = new StoryModel(apiService);
      
      // Inisialisasi View
      const homeView = new HomeView();
      const addStoryView = new AddStoryView();
      const loginView = new LoginView();
      const registerView = new RegisterView();
      
      // Inisialisasi Presenter
      new HomePresenter({
        view: homeView,
        model: storyModel,
      });
      
      new AddStoryPresenter({
        view: addStoryView,
        model: storyModel,
      });
      
      new LoginPresenter({
        view: loginView,
        apiService,
        router,
      });
      
      new RegisterPresenter({
        view: registerView,
        apiService,
        router,
      });
      
      // Konfigurasi Router
      router
        .addRoute('/', () => {
          homeView.render();
        }, { requiresAuth: true })
        
        .addRoute('/tambah', () => {
          addStoryView.render();
        }, { requiresAuth: true })
        
        .addRoute('/peta', () => {
          // Tampilkan peta lokasi
          document.querySelector('#mainContent').innerHTML = `
            <section class="map-section">
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
          loginView.render();
        }, { guestOnly: true })
        
        .addRoute('/daftar', () => {
          registerView.render();
        }, { guestOnly: true })
        
        .setFallback(() => {
          console.error('Halaman tidak ditemukan');
          router.navigateTo('/');
        });
      
      // Inisialisasi router
      router.init();
      
      // Setup skip link
      this._setupSkipLink();
      
      // Setup navigation toggle
      this._setupNavigation();
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
        this._updateAuthNavItem();
      });
    },
    
    _updateAuthNavItem() {
      const authNavItem = document.getElementById('authNavItem');
      const authNavText = document.getElementById('authNavText');
      
      if (authNavItem) {
        const isLoggedIn = localStorage.getItem('token') !== null;
        
        if (isLoggedIn) {
          authNavItem.innerHTML = `<a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Keluar</a>`;
          
          // Add logout functionality
          document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            router.navigateTo('/masuk');
            document.dispatchEvent(new Event('authChanged'));
          });
        } else {
          authNavItem.innerHTML = `<a href="#/masuk"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a>`;
        }
      }
    }
  };
  
  app.init();
});