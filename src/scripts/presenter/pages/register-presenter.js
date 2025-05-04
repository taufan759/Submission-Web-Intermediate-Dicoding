class RegisterPresenter {
    constructor({ view, apiService }) {
        this.view = view;
        this.apiService = apiService;
        
        this.view.setRegisterSubmitHandler(this.onRegisterSubmit.bind(this));
    }

    async onRegisterSubmit(name, email, password) {
        try {
            
            this.view.showLoading(true);
            
            await this.apiService.register(name, email, password);
            
            await this.apiService.login(email, password);

            document.dispatchEvent(new Event('authChanged'));

            this.view.showSuccess('✅ Berhasil mendaftar');
            
            router.navigateTo('/');
            
            return true;
        } catch (error) {
            this.view.showAlert(error.message);
            throw error;
        } finally {
            
            this.view.showLoading(false);
        }
    }
}