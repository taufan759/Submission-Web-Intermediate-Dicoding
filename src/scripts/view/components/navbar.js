class Navbar {
  constructor() {
    this._hamburgerButton = document.getElementById('hamburgerButton');
    this._navMenu = document.getElementById('navigation');
    this._activeLink = null; 
    
    this._init();
    this._renderNavItems();
    
   
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this._renderNavItems();
      }
    });
    
    
    document.addEventListener('authChanged', () => {
      this._renderNavItems();
    });
  }
  
  _init() {
    this._hamburgerButton.addEventListener('click', (event) => {
      this._toggleMenu();
    });
    
    
    document.addEventListener('click', (event) => {
      if (!this._hamburgerButton.contains(event.target) && 
          !this._navMenu.contains(event.target)) {
        this._navMenu.classList.remove('active');
      }
    });
    
    
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this._navMenu.classList.remove('active');
      }
    });
  }
  
  _renderNavItems() {
    
    if (!this._navMenu) return;
    
    
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    this._navMenu.innerHTML = `
      <style>
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px; 
        }
        
        @media (max-width: 768px) {
          .nav-list {
            width: 100%;
          }
        }
        
        @media (min-width: 769px) {
          .nav-list {
            flex-direction: row;
            gap: 20px; 
          }
        }
        
        .nav-item {
          margin: 0;
          padding: 0;
        }
        
       
        @media (max-width: 768px) {
          .nav-item {
            width: 100%;
          }
        }
        
        .nav-link {
          position: relative;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          padding: 8px 0; 
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
        }
        
     
        @media (max-width: 768px) {
          .nav-link {
            padding: 8px;
          }
        }
        
        
        .nav-link:hover {
          color: #ffffff;
          background: transparent;
          text-decoration: none;
        }
        
        .nav-link i {
          margin-right: 8px;
        }
        
      
        .nav-link-content {
          position: relative;
          display: inline-block;
        }
        
        .nav-link-content::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #ffffff;
          transition: width 0.3s ease;
        }
        
        .nav-link.active .nav-link-content::after {
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .nav-link-content::after {
            bottom: -5px;
            height: 2px;
          }
        }
      </style>
      <ul class="nav-list">
        <li class="nav-item">
          <a href="/" class="nav-link" data-link>
            <div class="nav-link-content">
              <i class="fas fa-home" aria-hidden="true"></i>
              <span>Beranda</span>
            </div>
          </a>
        </li>
        ${isAuthenticated ? `
        <li class="nav-item">
          <a href="/add-story" class="nav-link" data-link>
            <div class="nav-link-content">
              <i class="fas fa-plus" aria-hidden="true"></i>
              <span>Tambah Cerita</span>
            </div>
          </a>
        </li>
        ` : ''}
        <li class="nav-item">
          ${isAuthenticated ? `
          <a href="#" class="nav-link" id="logoutButton">
            <div class="nav-link-content">
              <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
              <span>Logout</span>
            </div>
          </a>
          ` : `
          <a href="/login" class="nav-link" data-link>
            <div class="nav-link-content">
              <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
              <span>Login</span>
            </div>
          </a>
          `}
        </li>
      </ul>
    `;
    
    
    const navLinks = this._navMenu.querySelectorAll('.nav-link[data-link]');
    
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      const url = link.getAttribute('href');
      
     
      if (url === currentPath) {
        link.classList.add('active');
        this._activeLink = link;
      }
      
      link.addEventListener('click', (event) => {
        event.preventDefault();
        
       
        if (this._activeLink) {
          this._activeLink.classList.remove('active');
        }
        
        
        link.classList.add('active');
        this._activeLink = link;
        
        const url = link.getAttribute('href');
        router.navigateTo(url);
        this._navMenu.classList.remove('active');
      });
    });
    
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        this._handleLogout();
        this._navMenu.classList.remove('active');
      });
    }
  }
  
  _handleLogout() {
   
    localStorage.removeItem('token');
    
    
    document.dispatchEvent(new Event('authChanged'));
    
    
    router.navigateTo('/login');
  }
  
  _toggleMenu() {
    this._navMenu.classList.toggle('active');
  }
}

const navbar = new Navbar();