class HomeView {
  constructor() {
    this._container = document.querySelector('#mainContent');
    this._map = null;
    this._markers = [];
  }

  renderPage() {
    this._container.innerHTML = `
      <section class="welcome-section container">
        <h2>Peta Bicara, Cerita Bermakna</h2>
        <p>Dengarkan kisah-kisah yang lahir dari berbagai penjuru Indonesia dan negara lainnya.
        Setiap titik di peta menyimpan sepotong harapan, kenangan, dan suara hati yang tak ingin dilupakan.
        "Karena setiap tempat punya cerita dan setiap cerita layak untuk didengar."</p>
      </section>
      
      <section class="container">
        <div class="stories-container" id="storiesContainer">
          <div class="loading-indicator">
            <i class="fas fa-spinner" aria-hidden="true"></i>
            <span>Memuat cerita...</span>
          </div>
        </div>
      </section>
      
      <section class="container">
        <div class="map-container">
          <h2>Peta Cerita</h2>
          <div id="storyMap"></div>
        </div>
      </section>
    `;

    this._container.classList.add('fadeIn');
    this._initMap();
  }

  _initMap() {
    this._map = L.map('storyMap').setView([-2.5489, 118.0149], 5);
  
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
  
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
  
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    openStreetMap.addTo(this._map);
  
    const baseMaps = {
      "<i class='fas fa-map'></i> OpenStreetMap": openStreetMap,
      "<i class='fas fa-globe'></i> Satelit": satellite,
      "<i class='fas fa-mountain'></i> Topografi": topo
    };
  
    L.control.layers(baseMaps).addTo(this._map);
  
    
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-control-layers-base {
        display: flex !important;
        gap: 12px;
        flex-wrap: wrap;
        padding: 10px;
      }
  
      .leaflet-control-layers-base label {
        display: flex !important;
        align-items: center;
        gap: 10px;
        background-color: #ffffff;
        border: 2px solid #ccc;
        border-radius: 10px;
        padding: 8px 14px;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        font-weight: 500;
        transition: all 0.3s ease;
        font-size: 0.95rem;
      }
  
      .leaflet-control-layers-base label:hover {
        background-color: #f0f4ff;
        border-color: #66f;
      }
  
      .leaflet-control-layers-base input[type="radio"]:checked + span {
        color: #1a73e8;
        font-weight: bold;
      }
  
      .leaflet-control-layers-base input[type="radio"] {
        accent-color: #1a73e8;
      }
  
      .leaflet-control {
        font-family: 'Segoe UI', sans-serif;
      }
  
      .leaflet-control-layers label span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
    `;
    document.head.appendChild(style);
  }
  
  showStories(stories) {
    const storiesContainer = document.getElementById('storiesContainer');
    storiesContainer.innerHTML = '';

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <p>Belum ada cerita yang dibagikan. Jadilah yang pertama!</p>
        </div>
      `;
      return;
    }

    stories.forEach(story => {
      const storyElement = document.createElement('story-card');
      storyElement.story = story;
      storiesContainer.appendChild(storyElement);
    });

    this._addStoriesToMap(stories);
  }

  _addStoriesToMap(stories) {
    this._markers.forEach(marker => this._map.removeLayer(marker));
    this._markers = [];

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);
        const popupContent = `
          <div class="map-popup">
            <img src="${story.photoUrl}" alt="Gambar cerita dari ${story.name}">
            <h3>${story.name}</h3>
            <p>${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}</p>
          </div>
        `;
        marker.bindPopup(popupContent);
        this._markers.push(marker);
      }
    });
  }

  showLoading() {
    const storiesContainer = document.getElementById('storiesContainer');
    storiesContainer.innerHTML = `
      <div class="loading-indicator" style="display: block;">
        <i class="fas fa-spinner" aria-hidden="true"></i>
        <span>Memuat cerita...</span>
      </div>
    `;
  }

  showError(message) {
    const storiesContainer = document.getElementById('storiesContainer');
    storiesContainer.innerHTML = `
      <div class="error message">
        <p>${message}</p>
      </div>
    `;
  }
}
