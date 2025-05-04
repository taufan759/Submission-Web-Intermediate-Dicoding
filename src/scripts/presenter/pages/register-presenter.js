// Change in register-presenter.js
class RegisterPresenter {  // Changed from LoginPresenter
    constructor({ view, apiService, router }) {
        console.log('RegisterPresenter constructor called');
        this.view = view;
        this.apiService = apiService;
        this.router = router || window.router;
        
        // Log when setting the handler
        console.log('Setting register submit handler');
        this.view.setRegisterSubmitHandler(this.onRegisterSubmit.bind(this));
        console.log('Register submit handler set');
    }
    
    init() {
        console.log('RegisterPresenter initialized');
    }

    async onRegisterSubmit(name, email, password) {
        try {
            console.log('Register submit handler called');
            this.view.showLoading(true);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = await this.apiService.register(name, email, password);
            console.log('Register success:', result);

            this.view.showSuccess('✅ Pendaftaran berhasil! Silakan login.');

            setTimeout(() => {
                this.router.navigateTo('/masuk');
            }, 1000); 

            return true;
        } catch (error) {
            console.error('Register error in presenter:', error);
            this.view.showAlert(error.message || 'Terjadi kesalahan saat mendaftar');
            this.view.showLoading(false);
            throw error;
        }
    }
}