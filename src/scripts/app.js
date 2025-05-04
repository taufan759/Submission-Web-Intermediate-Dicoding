document.addEventListener('DOMContentLoaded', () => {
    const app = new AppPresenter({
      view: new AppView(),
      model: storyModel,
      router: router
    });
    
    app.start();
  });


const app = {
  async init() {
    
  
    const homeView = new HomeView();
    const addStoryView = new AddStoryView();
    const loginView = new LoginView();
    const registerView = new RegisterView();
    
   
    new HomePresenter({
      view: homeView,
      apiService,
    });
    
    new AddStoryPresenter({
      view: addStoryView,
      apiService,
    });
    
    new LoginPresenter({
      view: loginView,
      apiService,
      router,
    });
    
    new RegisterPresenter({
      view: registerView,
      apiService,
      router,
    });
    
    // Router configuration
    router
      .addRoute('/', () => {
        homeView.render();
      }, { requiresAuth: true })  
      
      .addRoute('/add-story', () => {
        addStoryView.render();
      }, { requiresAuth: true })  
      
      .addRoute('/login', () => {
        loginView.render();
      }, { guestOnly: true })    
      
      .addRoute('/register', () => {
        registerView.render();
      }, { guestOnly: true })     
      
      .setFallback(() => {
        console.error('Halaman tidak ditemukan');
        router.navigateTo('/');
      });
    
    
    router.init();
  }
};


// kode revisi no 3
const mainContent = document.querySelector('#mainContent');
const skipLink = document.querySelector('.skip-link');

if (mainContent && skipLink) {
  skipLink.addEventListener('click', function (event) {
    event.preventDefault(); // Cegah halaman refresh
    skipLink.blur();        // Hilangkan fokus
    mainContent.focus();    // Fokus ke konten utama
    mainContent.scrollIntoView(); // Scroll ke konten utama
  });
}



document.addEventListener('DOMContentLoaded', () => {
  app.init();
});