class AddStoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }
  
  init() {
    this.view.setSubmitCallback(this._handleSubmit.bind(this));
  }
  
  async _handleSubmit(title, description, photoBlob, lat, lon) {
    try {
      this.view.showLoading();
      
      const result = await this.model.addNewStory(title, description, photoBlob, lat, lon);
      
      this.view.hideLoading();
      this.view.showSuccess('Cerita berhasil dikirim!');
      
     
      setTimeout(() => {
        router.navigateTo('/');
      }, 1000);
      
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(`Gagal mengirim cerita: ${error.message}`);
    }
  }
}