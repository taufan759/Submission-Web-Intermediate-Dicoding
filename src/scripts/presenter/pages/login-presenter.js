class LoginPresenter {
    constructor({ view, apiService, router }) {
        console.log('LoginPresenter constructor called');
        this.view = view;
        this.apiService = apiService;
        this.router = router || window.router;
        
        // Set this presenter as the view's presenter
        this.view.setPresenter(this);
    }
    
    init() {
        console.log('LoginPresenter initialized');
    }

    async onLoginSubmit(email, password) {
        // Let the view validate the form first
        if (!this.view.validateForm(email, password)) {
            return false;
        }
        
        try {
            this.view.showLoading(true);
            
            // Use API service to login the user
            console.log('Attempting login with:', email);
            const result = await this.apiService.login(email, password);
            console.log('Login successful:', result);

            // Dispatch event for other components to know about auth change
            document.dispatchEvent(new Event('authChanged'));

            // Show success message in the view
            this.view.showSuccess('✅ Berhasil login');

            // Navigate to home page after a short delay
            setTimeout(() => {
                this.navigateToHome();
            }, 1000); 

            return true;
        } catch (error) {
            console.error('Login error:', error);
            this.view.showAlert(error.message || 'Terjadi kesalahan saat login');
            this.view.showLoading(false);
            return false;
        }
    }

    navigateToHome() {
        this.router.navigateTo('/');
    }

    navigateToRegister() {
        this.router.navigateTo('/daftar');
    }
}