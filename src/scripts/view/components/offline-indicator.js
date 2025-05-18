// src/scripts/view/components/offline-indicator.js
import networkStatus from '../../utils/network-status.js';

class OfflineIndicator {
  constructor() {
    this._element = null;
    this._init();
  }
  
  _init() {
    // Create the indicator element
    this._element = document.createElement('div');
    this._element.className = 'offline-indicator';
    this._element.setAttribute('aria-live', 'polite');
    
    // Add the indicator to the DOM
    document.body.appendChild(this._element);
    
    // Initial update
    this._updateStatus(networkStatus.isOnline());
    
    // Listen for changes
    networkStatus.addListener((isOnline) => {
      this._updateStatus(isOnline);
    });
  }
  
  _updateStatus(isOnline) {
    if (isOnline) {
      this._element.classList.remove('visible');
      this._element.innerHTML = '';
      
      // Show brief "back online" message
      const onlineMsg = document.createElement('div');
      onlineMsg.className = 'online-msg';
      onlineMsg.textContent = 'Kembali online';
      document.body.appendChild(onlineMsg);
      
      // Remove after 3 seconds
      setTimeout(() => {
        onlineMsg.classList.add('fade-out');
        setTimeout(() => {
          if (onlineMsg.parentNode) {
            onlineMsg.parentNode.removeChild(onlineMsg);
          }
        }, 500);
      }, 3000);
    } else {
      this._element.classList.add('visible');
      this._element.innerHTML = `
        <div class="offline-content">
          <i class="fas fa-wifi" aria-hidden="true"></i>
          <span>Anda sedang offline. Beberapa fitur mungkin terbatas.</span>
        </div>
      `;
    }
  }
}

// Create and export the singleton instance
const offlineIndicator = new OfflineIndicator();
export default offlineIndicator;