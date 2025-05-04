class AppView {
    constructor() {
      this.homeView = new HomeView();
      this.addStoryView = new AddStoryView();
    }
    
    renderHomePage() {
      this.homeView.renderPage();
      return this.homeView;
    }
    
    renderAddStoryPage() {
      this.addStoryView.renderPage();
      return this.addStoryView;
    }
  }