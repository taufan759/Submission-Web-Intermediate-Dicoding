class Router {
  constructor() {
    this.routes = [];
    this.currentUrl = '';
    
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
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this._loadRoute();
      });
    } else {
      this._loadRoute();
    }
  }

  _loadRoute() {
    const hash = window.location.hash;
    const url = hash.slice(1) || '/';
    this.currentUrl = url;
    
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    console.log('Current URL:', url); 

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
      this.fallbackCallback();
    }
  }

  navigateTo(url) {
    console.log('Mengarahkan ke:', url); 
    window.location.hash = url;
  }

  init() {
    this._handleRouteChange();
  }
}

const router = new Router();