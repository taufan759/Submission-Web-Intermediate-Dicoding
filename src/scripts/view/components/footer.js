class Footer {
  constructor() {
    this.render();
  }

  render() {
    const footerElement = document.querySelector('footer');
    
    if (footerElement) {
      footerElement.innerHTML = `
        <div class="container">
          <div class="footer-content">
            <p>&copy; ${new Date().getFullYear()} Ceritaku - Berbagi cerita, berbagi lokasi</p>
            <p>Dibuat dengan <i class="fas fa-heart" aria-hidden="true"></i> untuk submission Dicoding</p>
          </div>
        </div>
      `;
    }
  }
}

const footer = new Footer();