class Navbar {
  constructor() {
    this._bindEvents();
  }

  _bindEvents() {
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      const navToggle = document.getElementById('hamburgerButton');
      const navigation = document.getElementById('navigation');
      const authNavItem = document.getElementById('authNavItem');
      
      // Toggle navigation on hamburger button click
      if (navToggle && navigation) {
        navToggle.addEventListener('click', () => {
          navigation.classList.toggle('active');
          
          // Update ARIA attributes for accessibility
          const expanded = navigation.classList.contains('active');
          navToggle.setAttribute('aria-expanded', expanded);
          
          // Change icon based on state
          navToggle.innerHTML = expanded 
            ? '<i class="fa fa-times" aria-hidden="true"></i>' 
            : '<i class="fa fa-bars" aria-hidden="true"></i>';
        });
      }
      
      // Close navigation when clicking outside
      document.addEventListener('click', (event) => {
        if (navigation && navigation.classList.contains('active') && 
            !event.target.closest('#navigation') && 
            !event.target.closest('#hamburgerButton')) {
          navigation.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.innerHTML = '<i class="fa fa-bars" aria-hidden="true"></i>';
        }
      });
      
      // Update auth navigation item based on authentication state
      this.updateAuthNavItem();
      
      // Add event listener for hash changes to update active link
      window.addEventListener('hashchange', () => {
        this.updateActiveLink();
      });
      
      // Initialize active link
      this.updateActiveLink();
    });
  }
  
  updateAuthNavItem() {
    const authNavItem = document.getElementById('authNavItem');
    if (authNavItem) {
      const isLoggedIn = localStorage.getItem('token') !== null;
      
      if (isLoggedIn) {
        authNavItem.innerHTML = `
          <a href="#" id="logoutButton">
            <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout
          </a>
        `;
        
        // Add logout event listener
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
          logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('token');
            window.location.hash = '#/login';
            this.updateAuthNavItem();
          });
        }
      } else {
        authNavItem.innerHTML = `
          <a href="#/login">
            <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Login
          </a>
        `;
      }
    }
  }
  
  updateActiveLink() {
    const currentHash = window.location.hash || '#/';
    const navLinks = document.querySelectorAll('#navigation a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      if (href === currentHash) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }
}

const navbar = new Navbar();