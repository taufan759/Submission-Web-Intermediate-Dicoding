class LoginPresenter {
    constructor({ view, apiService, router }) {
        console.log('LoginPresenter constructor called');
        this.view = view;
        this.apiService = apiService;
        this.router = router || window.router;
        
        console.log('Setting login submit handler');
    this.view.setLoginSubmitHandler(this.onLoginSubmit.bind(this));
    console.log('Login submit handler set');
}
    
    init() {
        // Tidak ada yang perlu dilakukan di sini karena handler sudah diatur di constructor
    }

    async onLoginSubmit(email, password) {
        try {
            this.view.showLoading(true);
            
            // Tambahkan logging untuk debugging
            console.log('Attempting login with:', email);
            
            const result = await this.apiService.login(email, password);
            console.log('Login successful:', result);

            // Dispatch event untuk memberitahu komponen lain tentang perubahan status login
            document.dispatchEvent(new Event('authChanged'));

            this.view.showSuccess('✅ Berhasil login');

            // Beri waktu untuk menampilkan pesan sukses
            setTimeout(() => {
                this.router.navigateTo('/');
            }, 1000); 

            return true;
        } catch (error) {
            console.error('Login error:', error);
            this.view.showAlert(error.message);
            return false;
        } finally {
            this.view.showLoading(false);
        }
    }
}