class RegisterPresenter {
    constructor({ view, apiService, router }) {
        this.view = view;
        this.apiService = apiService;
        this.router = router || window.router;
        
        this.view.setRegisterSubmitHandler(this.onRegisterSubmit.bind(this));
    }
    
    init() {
        // Metode init kosong untuk konsistensi dengan presenter lain
    }

    async onRegisterSubmit(name, email, password) {
        try {
            this.view.showLoading(true);
            
            await this.apiService.register(name, email, password);
            
            await this.apiService.login(email, password);

            document.dispatchEvent(new Event('authChanged'));

            this.view.showSuccess('✅ Berhasil mendaftar');
            
            setTimeout(() => {
                this.router.navigateTo('/');
            }, 1000);
            
            return true;
        } catch (error) {
            this.view.showAlert(error.message);
            throw error;
        } finally {
            this.view.showLoading(false);
        }
    }
}