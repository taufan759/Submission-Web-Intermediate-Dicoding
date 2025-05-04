class Router {
  constructor() {
    this.routes = [];
    this.currentUrl = '';
    
    // Periksa perubahan hash dengan listener yang tepat
    window.addEventListener('hashchange', () => {
      console.log('Hash changed to:', window.location.hash);
      this._loadRoute();
    });
  }

  addRoute(url, callback, options = {}) {
    this.routes.push({
      url,
      callback,
      requiresAuth: options.requiresAuth || false,
      guestOnly: options.guestOnly || false
    });
    
    return this;
  }

  setFallback(callback) {
    this.fallbackCallback = callback;
    return this;
  }

  _loadRoute() {
    const hash = window.location.hash;
    const url = hash.slice(1) || '/';
    this.currentUrl = url;
    
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    console.log('Loading route:', url, 'Auth:', isAuthenticated); 

    const route = this.routes.find((route) => {
      return route.url === url;
    });

    if (route) {
      if (route.requiresAuth && !isAuthenticated) {
        console.log('Halaman memerlukan login. Mengalihkan ke halaman login...');
        this.navigateTo('/masuk');
        return;
      }
      
      if (route.guestOnly && isAuthenticated) {
        console.log('Halaman hanya untuk tamu. Mengalihkan ke beranda...');
        this.navigateTo('/');
        return;
      }
      
      try {
        route.callback();
      } catch (error) {
        console.error('Error in route callback:', error);
      }
    } else if (this.fallbackCallback) {
      console.log('Route tidak ditemukan, menggunakan fallback');
      this.fallbackCallback();
    }
  }

  navigateTo(url) {
    console.log('Navigating to:', url); 
    window.location.hash = url;
  }

  init() {
    console.log('Router initialized');
    // Jalankan _loadRoute saat inisialisasi
    this._loadRoute();
  }
}

const router = new Router();

// Make sure navigation links work
document.addEventListener('DOMContentLoaded', () => {
  console.log('Setting up navigation link handlers');
  
  // Handle all navigation links
  document.body.addEventListener('click', (e) => {
    // Find closest anchor tag
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href && href.startsWith('#/')) {
      e.preventDefault();
      console.log('Navigation link clicked:', href);
      const path = href.substring(1); // Remove the # character
      router.navigateTo(path);
    }
  });
});