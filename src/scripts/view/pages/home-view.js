class HomeView {
  constructor() {
    this.container = document.querySelector('#mainContent');
    this.map = null;
    this.markers = [];
    this.stories = [];
    this.storiesContainer = null;
    this.mapContainer = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    document.title = 'Ceritaku - Berbagi Cerita di Lokasi';
    this.container.className = 'view-transition-fade';
    
    this.container.innerHTML = `
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h2>Selamat Datang di Ceritaku</h2>
            <p>Bagikan cerita dari berbagai lokasi menarik. Jelajahi kisah-kisah di peta interaktif!</p>
          </div>
        </div>
      </section>

      <section class="map-toggle-section">
        <div class="container">
          <div class="view-toggle">
            <button id="listViewBtn" class="view-btn active" aria-pressed="true">
              <i class="fas fa-list" aria-hidden="true"></i> Daftar Cerita
            </button>
            <button id="mapViewBtn" class="view-btn" aria-pressed="false">
              <i class="fas fa-map" aria-hidden="true"></i> Peta Cerita
            </button>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <div id="storiesContainer" class="stories-grid"></div>
          <div id="mapContainer" class="map-container" style="display: none;">
            <div id="storyMap" class="story-map"></div>
          </div>
          <div id="loadingIndicator" class="loading-indicator">
            <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <span>Memuat cerita...</span>
          </div>
        </div>
      </section>
    `;

    this.storiesContainer = document.getElementById('storiesContainer');
    this.mapContainer = document.getElementById('mapContainer');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    
    // Set up view toggle
    this._setupViewToggle();
    
    // Load stories
    this.showLoading();
    this.presenter.loadStories();

    // Event listener for story location click
    this.container.addEventListener('story-location-click', (event) => {
      // Switch to map view
      this._switchToMapView();
      
      // Focus map on the story location
      const { lat, lon, name, description } = event.detail;
      this._focusMapOnLocation(lat, lon, name, description);
    });
  }

  _setupViewToggle() {
    const listViewBtn = document.getElementById('listViewBtn');
    const mapViewBtn = document.getElementById('mapViewBtn');
    
    listViewBtn.addEventListener('click', () => {
      this._switchToListView();
    });
    
    mapViewBtn.addEventListener('click', () => {
      this._switchToMapView();
    });
  }

  _switchToListView() {
    const listViewBtn = document.getElementById('listViewBtn');
    const mapViewBtn = document.getElementById('mapViewBtn');
    
    this.storiesContainer.style.display = 'grid';
    this.mapContainer.style.display = 'none';
    
    listViewBtn.classList.add('active');
    mapViewBtn.classList.remove('active');
    
    listViewBtn.setAttribute('aria-pressed', 'true');
    mapViewBtn.setAttribute('aria-pressed', 'false');
  }

  _switchToMapView() {
    const listViewBtn = document.getElementById('listViewBtn');
    const mapViewBtn = document.getElementById('mapViewBtn');
    
    this.storiesContainer.style.display = 'none';
    this.mapContainer.style.display = 'block';
    
    listViewBtn.classList.remove('active');
    mapViewBtn.classList.add('active');
    
    listViewBtn.setAttribute('aria-pressed', 'false');
    mapViewBtn.setAttribute('aria-pressed', 'true');
    
    // Initialize map if not already initialized
    if (!this.map) {
      this._initMap();
    }
  }

  _initMap() {
    if (!this.map) {
      // Initialize the map centered on Indonesia
      this.map = L.map('storyMap').setView([-2.5489, 118.0149], 5);
      
      // Add base tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
      
      // Add additional layer control (Satellite view)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });
      
      const baseMaps = {
        "Peta Jalan": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }),
        "Satelit": satelliteLayer
      };
      
      L.control.layers(baseMaps).addTo(this.map);
      
      // Add location control
      L.control.locate({
        position: 'topleft',
        strings: {
          title: "Tampilkan lokasi saya"
        },
        locateOptions: {
          enableHighAccuracy: true
        }
      }).addTo(this.map);
      
      // Add scale control
      L.control.scale({
        metric: true,
        imperial: false
      }).addTo(this.map);
      
      // Add story markers
      this._addStoryMarkers();
      
      // Force map to update size after becoming visible
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  _addStoryMarkers() {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
    
    // Add markers for stories with location
    this.stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        
        // Create popup with story info
        const popupContent = `
          <div class="map-popup">
            <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" class="popup-image">
            <h3>${story.name}</h3>
            <p>${story.description.length > 100 ? story.description.substring(0, 100) + '...' : story.description}</p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        this.markers.push(marker);
      }
    });
  }

  _focusMapOnLocation(lat, lon, name, description) {
    if (!this.map) return;
    
    // Pan to location with animation
    this.map.flyTo([lat, lon], 15, {
      animate: true,
      duration: 1
    });
    
    // Find and open the popup for this location
    this.markers.forEach(marker => {
      const markerLatLng = marker.getLatLng();
      if (markerLatLng.lat === lat && markerLatLng.lng === lon) {
        marker.openPopup();
      }
    });
  }

  displayStories(stories) {
    this.stories = stories;
    this.hideLoading();
    
    if (stories.length === 0) {
      this._showEmptyState();
      return;
    }
    
    this.storiesContainer.innerHTML = '';
    
    stories.forEach(story => {
      const storyCard = document.createElement('story-card');
      storyCard.story = story;
      this.storiesContainer.appendChild(storyCard);
    });
    
    // Add markers to map if it's initialized
    if (this.map) {
      this._addStoryMarkers();
    }
  }

  _showEmptyState() {
    this.storiesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-open fa-3x" aria-hidden="true"></i>
        <h3>Belum ada cerita</h3>
        <p>Jadilah yang pertama berbagi cerita menarik!</p>
        <a href="#/add-story" class="btn-primary">
          <i class="fas fa-plus" aria-hidden="true"></i> Tambah Cerita
        </a>
      </div>
    `;
  }

  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'flex';
    }
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }

  showError(message) {
    this.hideLoading();
    
    this.container.innerHTML += `
      <div class="message error">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <p>${message}</p>
      </div>
    `;
  }
}