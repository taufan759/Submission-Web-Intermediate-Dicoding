class AddStoryPresenter {
  constructor({ view, apiService, router }) {
    this.view = view;
    this.apiService = apiService;
    this.router = router || window.router;
  }
  
  init() {
    this.view.setRegisterSubmitHandler(this.onRegisterSubmit.bind(this));
  }
  
  async onRegisterSubmit(name, email, password) {
    try {
      this.view.showLoading(true);
      
      await this.apiService.register(name, email, password);
      
      this.view.showSuccess('Pendaftaran berhasil! Silakan login.');
      
      setTimeout(() => {
        this.router.navigateTo('/masuk');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      this.view.showAlert(error.message);
      return false;
    } finally {
      this.view.showLoading(false);
    }
  }
}