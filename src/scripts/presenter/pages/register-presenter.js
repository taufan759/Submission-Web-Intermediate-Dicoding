class LoginPresenter {
    constructor({ view, apiService, router }) {
        this.view = view;
        this.apiService = apiService;
        this.router = router || window.router;
        
        // Pastikan handler untuk login terdaftar
        this.view.setLoginSubmitHandler(this.onLoginSubmit.bind(this));
    }
    
    init() {
        // Metode ini mungkin dipanggil dari tempat lain
        console.log('LoginPresenter initialized');
    }

    async onLoginSubmit(email, password) {
        try {
            console.log('Login submit handler called');
            this.view.showLoading(true);
            
            // Beri delay kecil untuk UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = await this.apiService.login(email, password);
            console.log('Login success:', result);

            // Memicu event autentikasi berubah
            document.dispatchEvent(new Event('authChanged'));

            // Tampilkan pesan sukses
            this.view.showSuccess('✅ Berhasil login!');

            // Arahkan ke halaman utama setelah delay
            setTimeout(() => {
                this.router.navigateTo('/');
            }, 1000); 

            return true;
        } catch (error) {
            console.error('Login error in presenter:', error);
            this.view.showAlert(error.message || 'Terjadi kesalahan saat login');
            this.view.showLoading(false);
            throw error;
        }
    }
}