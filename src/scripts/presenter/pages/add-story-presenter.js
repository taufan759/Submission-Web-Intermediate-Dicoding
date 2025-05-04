class AddStoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    console.log('AddStoryPresenter created');
  }
  
  init() {
    console.log('AddStoryPresenter initialized');
    this.view.setSubmitCallback(this.onAddStory.bind(this));
  }
  
  async onAddStory(description, photoBlob, lat, lon) {
    try {
      console.log('AddStoryPresenter.onAddStory called with:', { description, lat, lon });
      
      if (!description || !photoBlob) {
        throw new Error('Cerita dan foto wajib diisi');
      }
      
      const result = await this.model.addNewStory(description, photoBlob, lat, lon);
      console.log('Story added successfully:', result);
      
      this.view.showSuccess('Cerita berhasil ditambahkan!');
      
      setTimeout(() => {
        router.navigateTo('/');
      }, 1500);
      
      return true;
    } catch (error) {
      console.error('Add story error:', error);
      this.view.showError(error.message || 'Gagal menambahkan cerita');
      return false;
    }
  }
}