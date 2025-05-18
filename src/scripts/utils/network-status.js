class NetworkStatus {
  constructor() {
    this._isOnline = window.navigator.onLine;
    this._listeners = [];
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Network status: ONLINE');
      this._isOnline = true;
      this._notifyListeners();
    });
    
    window.addEventListener('offline', () => {
      console.log('Network status: OFFLINE');
      this._isOnline = false;
      this._notifyListeners();
    });
  }
  
  isOnline() {
    return this._isOnline;
  }
  
  addListener(callback) {
    this._listeners.push(callback);
  }
  
  removeListener(callback) {
    this._listeners = this._listeners.filter(listener => listener !== callback);
  }
  
  _notifyListeners() {
    this._listeners.forEach(listener => {
      try {
        listener(this._isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }
}

const networkStatus = new NetworkStatus();
export default networkStatus;