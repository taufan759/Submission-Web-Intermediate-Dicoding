// src/scripts/utils/sw-register.js
const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in the browser');
    return;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/Submission-Web-Intermediate-Dicoding/sw.js');
    console.log('Service worker registered with scope:', registration.scope);
    
    // Send message to service worker to skip waiting if there's an update
    if (registration.waiting) {
      console.log('New service worker waiting');
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Listen for updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New service worker installed, but will activate on next page load');
              
              // Show user notification about the update
              const updateNotification = document.createElement('div');
              updateNotification.className = 'update-notification';
              updateNotification.innerHTML = `
                <p>Ada pembaruan tersedia untuk aplikasi ini.</p>
                <button id="updateNowBtn">Perbarui Sekarang</button>
              `;
              
              document.body.appendChild(updateNotification);
              
              document.getElementById('updateNowBtn').addEventListener('click', () => {
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
                updateNotification.remove();
                window.location.reload();
              });
            } else {
              console.log('Service Worker installed for the first time');
            }
          }
        };
      }
    };
    
    // Detect controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker activated, reloading for clean state');
      // Uncomment to force reload on controller change:
      // window.location.reload();
    });
    
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
};

export default swRegister;