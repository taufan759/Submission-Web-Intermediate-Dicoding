class CameraHelper {
  constructor() {
    this.stream = null;
    this.capturedImage = null;
  }
  
  async startCamera(videoElement) {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        },
        audio: false
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      
      return true;
    } catch (error) {
      console.error('Error starting camera:', error);
      return false;
    }
  }
  
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
  }
  
  captureImage(videoElement, canvasElement) {
    const context = canvasElement.getContext('2d');
    
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    this.capturedImage = canvasElement.toDataURL('image/jpeg');
    
    this.stopCamera();
    
    return this.capturedImage;
  }
  
  getCapturedImageBlob() {
    return new Promise((resolve) => {
      if (!this.capturedImage) {
        resolve(null);
        return;
      }
      
     
      const base64 = this.capturedImage.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      resolve(blob);
    });
  }
}

const cameraHelper = new CameraHelper();