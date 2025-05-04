class StoryCard extends HTMLElement {
  constructor() {
    super();
  }
  
  set story(story) {
    this._story = story;
    this.render();
  }
  
  render() {
    
    const date = new Date(this._story.createdAt);
    const formattedDate = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    
    const title = this._story.title || this._story.name;
    
    this.innerHTML = `
      <article class="story-card">
        <img src="${this._story.photoUrl}" alt="Gambar cerita ${title}" class="story-image">
        <div class="story-content">
          <h3 class="story-title">${title}</h3>
          <p class="story-description">${this._story.description}</p>
          <div class="story-info">
            <div class="story-author">
              <i class="fas fa-user" aria-hidden="true"></i>
              <span>${this._story.name}</span>
            </div>
            <div class="story-date">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              <span>${formattedDate}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }
}

customElements.define('story-card', StoryCard);