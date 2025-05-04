class AppPresenter {
    constructor({ view, model, router }) {
      this.view = view;
      this.model = model;
      this.router = router;
      
      this._initRouter();
    }
    
    _initRouter() {
      this.router
        .addRoute('/', () => {
          document.body.classList.add('view-transition-fade');
          const homeView = this.view.renderHomePage();
          const homePresenter = new HomePresenter({
            view: homeView,
            model: this.model
          });
          homePresenter.init();
        })
        .addRoute('/add-story', () => {
          document.body.classList.add('view-transition-fade');
          const addStoryView = this.view.renderAddStoryPage();
          const addStoryPresenter = new AddStoryPresenter({
            view: addStoryView,
            model: this.model
          });
          addStoryPresenter.init();
        })
        .setFallback(() => {
          
          this.router.navigateTo('/');
        });
    }
    
    start() {
      this.router.init();
    }
  }