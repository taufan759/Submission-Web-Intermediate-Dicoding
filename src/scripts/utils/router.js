class Router {
  constructor() {
    this.routes = [];
    this.currentUrl = '';
    
    // Periksa perubahan hash dengan listener yang tepat
    window.addEventListener('hashchange', this._handleRouteChange.bind(this));
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

  _handleRouteChange() {
    console.log('Hash berubah ke:', window.location.hash); 
    this._loadRoute();
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
      
      route.callback();
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
    // Jalankan _loadRoute saat inisialisasi
    this._loadRoute();
  }
}

const router = new Router();