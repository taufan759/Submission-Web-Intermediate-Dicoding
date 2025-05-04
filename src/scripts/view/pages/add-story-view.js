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
  }

  renderPage() {
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
              <h3>Ambil Gambar dengan Kamera</h3>
              <div class="camera-preview">
                <video id="cameraFeed" autoplay playsinline></video>
                <img id="capturedImage" alt="Gambar yang diambil">
              </div>
              <div class="camera-controls">
                <button type="button" id="startCameraBtn">
                  <i class="fas fa-video" aria-hidden="true"></i> Mulai Kamera
                </button>
                <button type="button" id="captureBtn" disabled>
                  <i class="fas fa-camera" aria-hidden="true"></i> Ambil Gambar
                </button>
                <button type="button" id="retakeBtn" disabled>
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

    this._container.classList.add("fadeIn");

    this._initMap();
    this._initCameraButtons();
    this._initFormSubmit();
  }

  _initMap() {
    this._map = L.map("pickLocationMap").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    this._map.on("click", (e) => {
      this._updateMarker(e.latlng.lat, e.latlng.lng);
    });
  }

  _updateMarker(lat, lon) {
    this._position.lat = lat;
    this._position.lon = lon;

    document.getElementById("latValue").textContent = lat.toFixed(6);
    document.getElementById("lonValue").textContent = lon.toFixed(6);

    if (this._marker) this._map.removeLayer(this._marker);

    this._marker = L.marker([lat, lon]).addTo(this._map);
    this._marker.bindPopup("Lokasi cerita Anda").openPopup();

    document.getElementById("latValue").classList.remove("text-error");
    const latErrorMsg = document.querySelector("#latValue + .field-error");
    if (latErrorMsg) latErrorMsg.remove();
  }

  _initCameraButtons() {
    const startCameraBtn = document.getElementById("startCameraBtn");
    const captureBtn = document.getElementById("captureBtn");
    const retakeBtn = document.getElementById("retakeBtn");
    const cameraFeed = document.getElementById("cameraFeed");
    const capturedImage = document.getElementById("capturedImage");

    startCameraBtn.addEventListener("click", async () => {
      if (!this._cameraActive) {
        const cameraStarted = await cameraHelper.startCamera(cameraFeed);
        if (cameraStarted) {
          this._cameraActive = true;
          startCameraBtn.disabled = true;
          captureBtn.disabled = false;
          retakeBtn.disabled = true;
          cameraFeed.style.display = "block";
          capturedImage.style.display = "none";
        } else {
          this._showMessage("Gagal memulai kamera. Pastikan kamera diizinkan.", "error");
        }
      }
    });

    captureBtn.addEventListener("click", () => {
      if (this._cameraActive) {
        const imageData = cameraHelper.captureImage(cameraFeed, this._canvas);
        capturedImage.src = imageData;
        cameraFeed.style.display = "none";
        capturedImage.style.display = "block";
        startCameraBtn.disabled = false;
        captureBtn.disabled = true;
        retakeBtn.disabled = false;
        this._cameraActive = false;
      }
    });

    retakeBtn.addEventListener("click", async () => {
      capturedImage.style.display = "none";
      cameraFeed.style.display = "block";
      retakeBtn.disabled = true;
      const cameraStarted = await cameraHelper.startCamera(cameraFeed);
      if (cameraStarted) {
        this._cameraActive = true;
        startCameraBtn.disabled = true;
        captureBtn.disabled = false;
      } else {
        startCameraBtn.disabled = false;
        this._showMessage("Gagal memulai kamera. Pastikan kamera diizinkan.", "error");
      }
    });
  }

  _initFormSubmit() {
    const form = document.getElementById("addStoryForm");
    const descriptionField = document.getElementById("description");
    const capturedImage = document.getElementById("capturedImage");
    const latValue = document.getElementById("latValue");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = descriptionField.value.trim();
      const loadingIndicator = document.getElementById("loadingIndicator");
      let hasError = false;

      descriptionField.classList.remove("input-error");
      latValue.classList.remove("text-error");
      capturedImage.classList.remove("img-error");
      document.querySelectorAll(".field-error").forEach(el => el.remove());

      if (!description) {
        descriptionField.classList.add("input-error");
        descriptionField.insertAdjacentHTML("afterend", `<small class="field-error text-error">Cerita tidak boleh kosong.</small>`);
        hasError = true;
      }

      if (!cameraHelper.capturedImage) {
        capturedImage.classList.add("img-error");
        capturedImage.insertAdjacentHTML("afterend", `<small class="field-error text-error">Gambar Anda belum diambil!</small>`);
        hasError = true;
      }

      const { lat, lon } = this._position;
      if (lat === null || lon === null) {
        latValue.classList.add("text-error");
        latValue.insertAdjacentHTML("afterend", `<small class="field-error text-error">Pilih lokasi pada peta!</small>`);
        hasError = true;
      }

      if (hasError) return;

      loadingIndicator.style.display = "block";

      try {
        const photoBlob = await cameraHelper.getCapturedImageBlob();
        if (this._submitCallback) {
          await this._submitCallback(description, photoBlob, lat, lon);
        }
      } catch (error) {
        this._showMessage(`Error: ${error.message}`, "error");
      } finally {
        loadingIndicator.style.display = "none";
      }
    });
  }

  setSubmitCallback(callback) {
    this._submitCallback = callback;
  }

  _showMessage(message, type = "success") {
    const messageContainer = document.getElementById("messageContainer");
    messageContainer.innerHTML = `<div class="message ${type}"><p>${message}</p></div>`;
    setTimeout(() => {
      messageContainer.innerHTML = "";
    }, 2000);
  }

  showLoading() {
    document.getElementById("loadingIndicator").style.display = "block";
  }

  hideLoading() {
    document.getElementById("loadingIndicator").style.display = "none";
  }

  showSuccess(message) {
    this._showMessage(message, "success");
    document.getElementById("description").value = "";
    document.getElementById("capturedImage").style.display = "none";

    if (this._marker) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }

    document.getElementById("latValue").textContent = "Belum dipilih";
    document.getElementById("lonValue").textContent = "Belum dipilih";
    this._position = { lat: null, lon: null };
  }

  showError(message) {
    this._showMessage(message, "error");
  }

  destroy() {
    cameraHelper.stopCamera();
    this._cameraActive = false;

    const startBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const retakeBtn = document.getElementById('retakeBtn');
    const videoEl = document.getElementById('cameraFeed');
    const imgEl = document.getElementById('capturedImage');

    if (startBtn && captureBtn && retakeBtn) {
      startBtn.disabled = false;
      captureBtn.disabled = true;
      retakeBtn.disabled = true;
    }

    if (videoEl) {
      videoEl.style.display = 'none';
      videoEl.srcObject = null;
    }

    if (imgEl) {
      imgEl.style.display = 'none';
    }
  }
}

// Inisialisasi dan handle navigasi
const addStoryViewInstance = new AddStoryView();
addStoryViewInstance.renderPage();
window.addStoryViewInstance = addStoryViewInstance;

window.addEventListener("hashchange", () => {
  if (window.addStoryViewInstance) {
    window.addStoryViewInstance.destroy();
  }
});
