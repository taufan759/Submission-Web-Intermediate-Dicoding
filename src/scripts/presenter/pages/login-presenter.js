class LoginPresenter {
    constructor({ view, apiService }) {
        this.view = view;
        this.apiService = apiService;
        
        this.view.setLoginSubmitHandler(this.onLoginSubmit.bind(this));
    }

    async onLoginSubmit(email, password) {
        try {
            
            this.view.showLoading(true);
            
            await this.apiService.login(email, password);

            document.dispatchEvent(new Event('authChanged'));

            this.view.showSuccess('✅ Berhasil login');

            setTimeout(() => {
                router.navigateTo('/');
            }, 1000); 

            return true;
        } catch (error) {
            this.view.showAlert(error.message);
            throw error;
        } finally {
            // Menyembunyikan loading
            this.view.showLoading(false);
        }
    }
}