// src/scripts/view/pages/not-found-view.js
class NotFoundView {
  constructor() {
    this._container = document.querySelector('#mainContent');
  }
  
  render() {
    console.log('Rendering 404 page');
    
    this._container.innerHTML = `
      <section class="not-found-page">
        <div class="container">
          <div class="not-found-content">
            <div class="not-found-icon">
              <i class="fas fa-map-marked-alt" aria-hidden="true"></i>
              <span class="not-found-code">404</span>
            </div>
            <h2>Halaman Tidak Ditemukan</h2>
            <p>Maaf, halaman yang Anda cari tidak dapat ditemukan. Sepertinya Anda tersesat dalam perjalanan.</p>
            <div class="not-found-actions">
              <a href="#/" class="btn btn-primary">
                <i class="fas fa-home" aria-hidden="true"></i> Kembali ke Beranda
              </a>
              <a href="#/peta" class="btn btn-secondary">
                <i class="fas fa-map" aria-hidden="true"></i> Lihat Peta
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
    
    this._addStyles();
  }
  
  _addStyles() {
    if (!document.getElementById('notFoundStyles')) {
      const style = document.createElement('style');
      style.id = 'notFoundStyles';
      style.textContent = `
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          text-align: center;
          padding: 2rem 1rem;
        }
        
        .not-found-content {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .not-found-icon {
          position: relative;
          font-size: 8rem;
          color: var(--color-primary, #4299e1);
          margin-bottom: 1rem;
          display: inline-block;
        }
        
        .not-found-code {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          font-weight: bold;
          color: white;
        }
        
        .not-found-page h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #2d3748;
        }
        
        .not-found-page p {
          font-size: 1.1rem;
          color: #4a5568;
          margin-bottom: 2rem;
        }
        
        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .not-found-icon {
            font-size: 6rem;
          }
          
          .not-found-code {
            font-size: 2.5rem;
          }
          
          .not-found-page h2 {
            font-size: 1.5rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

export default NotFoundView;