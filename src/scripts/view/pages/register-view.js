class RegisterView {
    constructor() {
        this.container = document.querySelector('#mainContent');
        this.onRegisterSubmit = null;
    }

    render() {
        this.container.innerHTML = `
            <section class="auth-section">
                <div class="container">
                    <h2 class="section-title">Daftar Akun Baru</h2>
                    <div class="auth-card">
                        <form id="registerForm">
                            <div class="form-group">
                                <label for="name">Nama</label>
                                <input type="text" id="name" name="name" required placeholder="Masukkan nama Anda">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required placeholder="Masukkan email Anda">
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required minlength="6" placeholder="Minimal 6 karakter">
                            </div>
                            <div class="form-actions">
                                <button type="submit" id="registerButton" class="btn btn-primary">
                                    <span class="button-text">Daftar</span>
                                    <div class="loader-container">
                                        <div class="loader"></div>
                                    </div>
                                </button>
                            </div>
                        </form>
                        <div class="auth-footer">
                            <p>Sudah punya akun? <a href="#/masuk" data-link>Masuk di Sini</a></p>
                        </div>
                    </div>
                </div>
            </section>
            <div id="alertContainer"></div>
        `;

        if (!document.getElementById('loaderStyles')) {
            const style = document.createElement('style');
            style.id = 'loaderStyles';
            style.textContent = `
                .loader-container {
                    display: none;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
                
                .loader {
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-top: 3px solid #ffffff;
                    border-radius: 50%;
                    width: 16px;
                    height: 16px;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .btn-loading .button-text {
                    visibility: hidden;
                }
                
                .btn-loading .loader-container {
                    display: block;
                }
                
                .btn-loading {
                    position: relative;
                    pointer-events: none;
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(style);
        }

        this._initListeners();
    }

    _initListeners() {
        const registerForm = document.querySelector('#registerForm');
        if (registerForm) {  // Tambahkan pemeriksaan
            registerForm.addEventListener('submit', async (event) => {
                event.preventDefault();
    
                const name = document.querySelector('#name').value;
                const email = document.querySelector('#email').value;
                const password = document.querySelector('#password').value;
    
                if (!name || !email || !password) {
                    this.showAlert('Semua field wajib diisi!');
                    return;
                }
    
                if (password.length < 6) {
                    this.showAlert('Password minimal 6 karakter!');
                    return;
                }
    
                this.showLoading(true);
    
                try {
                    if (this.onRegisterSubmit) {
                        await this.onRegisterSubmit(name, email, password);
                    } else {
                        console.error('Register handler belum terdaftar');
                        this.showAlert('Terjadi kesalahan sistem');
                        this.showLoading(false);
                    }
                } catch (error) {
                    this.showAlert(error.message || 'Terjadi kesalahan saat register');
                    this.showLoading(false);
                }
            });
        } else {
            console.error('Register form tidak ditemukan');
        }
    
        // Pastikan fungsi setelah render selesai
        setTimeout(() => {
            const loginLink = document.querySelector('a[href="#/masuk"]');
            if (loginLink) {
                loginLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    router.navigateTo('/masuk');
                });
            }
        }, 100);
    }

    showLoading(isLoading) {
        const button = document.getElementById('registerButton');
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    showAlert(message) {
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = `
            <div class="alert alert-danger" style="position: fixed; top: 20px; 
            left: 50%; transform: translateX(-50%); background-color: #f44336; 
            color: white; padding: 15px 25px; border-radius: 5px; box-shadow: 
            0 4px 6px rgba(0,0,0,0.1); font-size: 16px; animation: slideIn 0.5s ease-out;">
                ❌ ${message}
            </div>
        `;
        
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 3000);
    }

    showSuccess(message) {
        this.showLoading(false);
        
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = `
            <div class="alert alert-success" style="position: fixed; top: 20px; left: 50%; 
            transform: translateX(-50%); background-color: rgba(31, 134, 193, 0.82); color:
            white; padding: 15px 25px; border-radius: 5px; box-shadow: 
            0 4px 6px rgba(0,0,0,0.1); font-size: 16px; animation: slideIn 0.5s ease-out;">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 2000);
    }

    setRegisterSubmitHandler(handler) {
        this.onRegisterSubmit = handler;
    }
}