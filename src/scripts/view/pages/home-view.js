class HomeView {
  constructor() {
    this.container = document.querySelector('#mainContent');
    this.map = null;
    this.markers = [];
    this.stories = [];
  }

  render() {
    console.log('HomeView render called');
    document.title = 'PetaBicara - Cerita Bermakna';
    
    this.container.innerHTML = `
      <section class="featured-stories">
  <div class="container">
    <h2 class="section-title">Cerita Pilihan</h2>
    <div class="featured-grid">
      <!-- Featured story cards will be rendered here -->
      <div class="featured-placeholder">
        <div class="placeholder-icon">
          <i class="fas fa-map-marked-alt"></i>
        </div>
        <h3>Jelajahi Cerita dari Seluruh Indonesia</h3>
        <p>Temukan kisah menarik dari berbagai lokasi di nusantara. Bagikan pengalaman dan temukan tempat baru!</p>
      </div>
    </div>
  </div>
</section>

<section class="how-it-works">
  <div class="container">
    <h2 class="section-title">Cara Kerjanya</h2>
    <div class="steps-container">
      <div class="step-card">
        <div class="step-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <h3>1. Daftar Akun</h3>
        <p>Buat akun gratis untuk mulai berbagi cerita Anda</p>
      </div>
      <div class="step-card">
        <div class="step-icon">
          <i class="fas fa-map-pin"></i>
        </div>
        <h3>2. Pilih Lokasi</h3>
        <p>Tandai lokasi cerita Anda di peta interaktif</p>
      </div>
      <div class="step-card">
        <div class="step-icon">
          <i class="fas fa-book-open"></i>
        </div>
        <h3>3. Bagikan Cerita</h3>
        <p>Tulis dan unggah cerita Anda dengan foto</p>
      </div>
    </div>
  </div>
</section>

<section class="testimonials">
  <div class="container">
    <h2 class="section-title">Kata Pengguna</h2>
    <div class="testimonial-carousel">
      <div class="testimonial-card">
        <div class="testimonial-content">
          <p>"PetaBicara membantu saya menemukan tempat-tempat tersembunyi yang tidak pernah saya ketahui sebelumnya!"</p>
        </div>
        <div class="testimonial-author">
          <div class="author-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="author-info">
            <h4>Muhammad Taufan Akbar</h4>
            <p>Petualang</p>
          </div>
        </div>
      </div>
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
    console.log('Starting to load stories');
    this.showLoading();
    
    // If presenter is set, load stories
    if (this.presenter) {
      this.presenter.loadStories();
    } else {
      console.error('Presenter not set in HomeView');
      this.hideLoading();
      this.storiesContainer.innerHTML = '<p>Error: Unable to load stories</p>';
    }
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  // Rest of your methods...
  
  // Make sure this method exists and works correctly
  showStories(stories) {
    console.log('Showing stories:', stories);
    this.stories = stories;
    this.hideLoading();
    
    if (!stories || stories.length === 0) {
      this.storiesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open fa-3x" aria-hidden="true"></i>
          <h3>Belum ada cerita</h3>
          <p>Jadilah yang pertama berbagi cerita menarik!</p>
          <a href="#/tambah" class="btn btn-primary">
            <i class="fas fa-plus" aria-hidden="true"></i> Tambah Cerita
          </a>
        </div>
      `;
      return;
    }
    
    this.storiesContainer.innerHTML = '';
    
    stories.forEach(story => {
      const storyCard = document.createElement('story-card');
      storyCard.story = story;
      this.storiesContainer.appendChild(storyCard);
    });
  }

  // Make sure these methods exist
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
}