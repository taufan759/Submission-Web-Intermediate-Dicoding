class CameraHelper {
  constructor() {
    this.stream = null;
    this.photoBlob = null;
    this.currentLocation = {
      latitude: null,
      longitude: null
    };
  }

  async initCamera(videoElement) {
    try {
      // Stop any existing stream
      if (this.stream) {
        this.stopCamera();
      }

      // Request camera access with preferred settings
      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera when available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      videoElement.style.display = 'block';
      
      return true;
    } catch (error) {
      console.error('Camera access error:', error);
      this.showCameraError(error);
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  capturePhoto(videoElement, canvasElement) {
    if (!this.stream) return null;

    try {
      // Set canvas dimensions to match video
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      const context = canvasElement.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      // Convert to blob with MIME type image/jpeg
      return new Promise(resolve => {
        canvasElement.toBlob(blob => {
          this.photoBlob = blob;
          resolve(blob);
        }, 'image/jpeg', 0.85); // 85% quality
      });
    } catch (error) {
      console.error('Photo capture error:', error);
      return null;
    }
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser Anda'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          resolve(this.currentLocation);
        },
        error => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  getPhotoBlob() {
    return this.photoBlob;
  }

  showCameraError(error) {
    let message = 'Tidak dapat mengakses kamera.';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      message = 'Akses kamera ditolak. Mohon izinkan akses kamera di pengaturan browser Anda.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      message = 'Kamera tidak ditemukan pada perangkat Anda.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      message = 'Kamera Anda sedang digunakan oleh aplikasi lain.';
    } else if (error.name === 'OverconstrainedError') {
      message = 'Kamera Anda tidak mendukung resolusi yang diminta.';
    }
    
    alert(message);
  }
}

const cameraHelper = new CameraHelper();