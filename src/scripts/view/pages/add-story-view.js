class AddStoryView {
  constructor() {
    this._container = document.querySelector("#mainContent");
    this._map = null;
    this._marker = null;
    this._position = {
      lat: null,
      lon: null,
    };
    this._cameraActive = false;
    this._canvas = document.createElement("canvas");
    this._submitCallback = null;
  }

  renderPage() {
    console.log('Rendering add story page');
    this._container.innerHTML = `
      <div class="container">
        <div class="add-story-container">
          <h2><span class="text-primary">Tambah</span> <span class="text-secondary">Cerita Baru</span></h2>
          <form id="addStoryForm">
            <div id="messageContainer"></div>
            
            <div class="form-group">
              <label for="description">Cerita Anda</label>
              <textarea id="description" name="description" required placeholder="Ceritakan pengalaman atau cerita menarik Anda..."></textarea>
            </div>
            
            <div class="camera-section">
              <h3>Ambil Gambar</h3>
              <div class="camera-preview">
                <video id="cameraFeed" autoplay playsinline></video>
                <img id="capturedImage" alt="Gambar yang diambil">
              </div>
              <div class="camera-controls">
                <button type="button" id="startCameraBtn" class="btn">
                  <i class="fas fa-video" aria-hidden="true"></i> Mulai Kamera
                </button>
                <button type="button" id="captureBtn" class="btn" disabled>
                  <i class="fas fa-camera" aria-hidden="true"></i> Ambil Gambar
                </button>
                <button type="button" id="retakeBtn" class="btn" disabled>
                  <i class="fas fa-redo" aria-hidden="true"></i> Ambil Ulang
                </button>
              </div>
            </div>
            
            <div class="location-section">
              <h3>Pilih Lokasi</h3>
              <div id="pickLocationMap"></div>
              <div class="location-info">
                <p>Latitude: <span id="latValue">Belum dipilih</span></p>
                <p>Longitude: <span id="lonValue">Belum dipilih</span></p>
              </div>
              <p class="hint">Klik pada peta untuk menentukan lokasi cerita Anda.</p>
            </div>
            
            <div class="submit-section">
              <button type="submit" id="submitBtn" class="submit-btn">
                <i class="fas fa-paper-plane" aria-hidden="true"></i> Kirim Cerita
              </button>
            </div>
          </form>
          
          <div class="loading-indicator" id="loadingIndicator">
            <i class="fas fa-spinner" aria-hidden="true"></i>
            <span>Mengirim cerita...</span>
          </div>
        </div>
      </div>
    `;

    // Initialize components after rendering
    setTimeout(() => {
      this._initMap();
      this._initCameraButtons();
      this._initFormSubmit();
      console.log('Add story page components initialized');
    }, 100);
  }

  _initMap() {
    console.log('Initializing map');
    const mapContainer = document.getElementById("pickLocationMap");
    
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }
    
    try {
      this._map = L.map("pickLocationMap").setView([-2.5489, 118.0149], 5);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._map);
      
      this._map.on("click", (e) => {
        this._updateMarker(e.latlng.lat, e.latlng.lng);
      });
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  _updateMarker(lat, lon) {
    console.log('Updating marker position:', lat, lon);
    this._position.lat = lat;
    this._position.lon = lon;

    document.getElementById("latValue").textContent = lat.toFixed(6);
    document.getElementById("lonValue").textContent = lon.toFixed(6);

    if (this._marker) this._map.removeLayer(this._marker);

    this._marker = L.marker([lat, lon]).addTo(this._map);
    this._marker.bindPopup("Lokasi cerita Anda").openPopup();
  }

  _initCameraButtons() {
    console.log('Initializing camera buttons');
    const startCameraBtn = document.getElementById("startCameraBtn");
    const captureBtn = document.getElementById("captureBtn");
    const retakeBtn = document.getElementById("retakeBtn");
    const cameraFeed = document.getElementById("cameraFeed");
    const capturedImage = document.getElementById("capturedImage");

    if (!startCameraBtn || !captureBtn || !retakeBtn || !cameraFeed || !capturedImage) {
      console.error('Camera elements not found');
      return;
    }

    // Reset display
    cameraFeed.style.display = "none";
    capturedImage.style.display = "none";

    startCameraBtn.addEventListener("click", async () => {
      console.log('Start camera button clicked');
      if (!this._cameraActive) {
        startCameraBtn.disabled = true;
        cameraFeed.style.display = "block";
        capturedImage.style.display = "none";
        
        const cameraStarted = await cameraHelper.startCamera(cameraFeed);
        if (cameraStarted) {
          console.log('Camera started successfully');
          this._cameraActive = true;
          captureBtn.disabled = false;
          retakeBtn.disabled = true;
        } else {
          console.error('Failed to start camera');
          startCameraBtn.disabled = false;
          cameraFeed.style.display = "none";
          this._showMessage("Gagal memulai kamera. Pastikan kamera diizinkan.", "error");
        }
      }
    });

    captureBtn.addEventListener("click", () => {
      console.log('Capture button clicked');
      if (this._cameraActive) {
        const imageData = cameraHelper.captureImage(cameraFeed, this._canvas);
        if (imageData) {
          console.log('Image captured successfully');
          capturedImage.src = imageData;
          cameraFeed.style.display = "none";
          capturedImage.style.display = "block";
          captureBtn.disabled = true;
          retakeBtn.disabled = false;
          this._cameraActive = false;
        } else {
          console.error('Failed to capture image');
          this._showMessage("Gagal mengambil gambar. Coba lagi.", "error");
        }
      }
    });

    retakeBtn.addEventListener("click", async () => {
      console.log('Retake button clicked');
      capturedImage.style.display = "none";
      cameraFeed.style.display = "block";
      retakeBtn.disabled = true;
      
      const cameraStarted = await cameraHelper.startCamera(cameraFeed);
      if (cameraStarted) {
        console.log('Camera restarted successfully');
        this._cameraActive = true;
        captureBtn.disabled = false;
      } else {
        console.error('Failed to restart camera');
        startCameraBtn.disabled = false;
        cameraFeed.style.display = "none";
        this._showMessage("Gagal memulai kamera. Pastikan kamera diizinkan.", "error");
      }
    });
  }

  _initFormSubmit() {
    console.log('Initializing form submission');
    const form = document.getElementById("addStoryForm");
    
    if (!form) {
      console.error('AddStoryForm not found!');
      return;
    }
    
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log('Form submitted');

      const description = document.getElementById("description").value.trim();
      const capturedImage = document.getElementById("capturedImage");
      let hasError = false;

      // Validate description
      if (!description) {
        this._showMessage("Cerita tidak boleh kosong.", "error");
        hasError = true;
      }

      // Validate image
      if (!capturedImage.src || capturedImage.src === 'about:blank' || capturedImage.style.display === 'none') {
        this._showMessage("Gambar Anda belum diambil!", "error");
        hasError = true;
      }

      // Validate location
      const { lat, lon } = this._position;
      if (lat === null || lon === null) {
        this._showMessage("Pilih lokasi pada peta!", "error");
        hasError = true;
      }

      if (hasError) return;

      this.showLoading();

      try {
        console.log('Preparing to submit story');
        // Use cameraHelper to get the blob
        const photoBlob = await cameraHelper.getCapturedImageBlob();
        
        if (this._submitCallback) {
          console.log('Calling submit callback');
          await this._submitCallback(description, photoBlob, lat, lon);
        } else {
          console.error('Submit callback not set');
          this._showMessage('Terjadi kesalahan: handler belum terdaftar', 'error');
          this.hideLoading();
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        this._showMessage(`Error: ${error.message}`, "error");
        this.hideLoading();
      }
    });
  }

  setSubmitCallback(callback) {
    console.log('Setting submit callback');
    this._submitCallback = callback;
  }

  _showMessage(message, type = "success") {
    console.log(`Showing ${type} message:`, message);
    const messageContainer = document.getElementById("messageContainer");
    if (messageContainer) {
      messageContainer.innerHTML = `<div class="message ${type}"><p>${message}</p></div>`;
      // Auto-hide message after 3 seconds
      setTimeout(() => {
        messageContainer.innerHTML = "";
      }, 3000);
    }
  }

  showLoading() {
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "flex";
    }
  }

  hideLoading() {
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }

  showSuccess(message) {
    this._showMessage(message, "success");
    // Reset form
    const descriptionField = document.getElementById("description");
    const capturedImage = document.getElementById("capturedImage");
    
    if (descriptionField) {
      descriptionField.value = "";
    }
    
    if (capturedImage) {
      capturedImage.style.display = "none";
      capturedImage.src = "";
    }

    // Reset map marker
    if (this._marker) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }

    // Reset position
    this._position = { lat: null, lon: null };
    const latValueEl = document.getElementById("latValue");
    const lonValueEl = document.getElementById("lonValue");
    
    if (latValueEl && lonValueEl) {
      latValueEl.textContent = "Belum dipilih";
      lonValueEl.textContent = "Belum dipilih";
    }
  }

  showError(message) {
    this._showMessage(message, "error");
  }

  destroy() {
    console.log('Destroying add story view');
    if (this._cameraActive) {
      cameraHelper.stopCamera();
      this._cameraActive = false;
    }

    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}