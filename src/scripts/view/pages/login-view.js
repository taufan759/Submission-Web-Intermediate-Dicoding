class LoginView {
    constructor() {
        this.container = document.querySelector('#mainContent');
        this.onLoginSubmit = null;
    }

    render() {
        this.container.innerHTML = `
            <section class="auth-section">
                <div class="container">
                    <h2 class="section-title">Login</h2>
                    <div class="auth-card">
                        <form id="loginForm">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required placeholder="Masukkan email Anda">
                            </div>
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required placeholder="Masukkan password Anda">
                            </div>
                            <div class="form-actions">
                                <button type="submit" id="loginButton" class="btn btn-primary">
                                    <span class="button-text">Login</span>
                                    <div class="loader-container">
                                        <div class="loader"></div>
                                    </div>
                                </button>
                            </div>
                        </form>
                        <div class="auth-footer">
                            <p>Belum punya akun? <a href="/register" data-link>Daftar Sekarang</a></p>
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
        const loginForm = document.querySelector('#loginForm');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            
           
            this.showLoading(true);

            try {
                if (this.onLoginSubmit) {
                    await this.onLoginSubmit(email, password);
                    this.showSuccess('✅ Berhasil login!');
                    
                    setTimeout(() => {
                        router.navigateTo('/'); 
                    }, 2000); 
                }
            } catch (error) {
                this.showAlert(error.message);
                
                this.showLoading(false);
            }
        });

        const registerLink = document.querySelector('a[href="/register"]');
        if (registerLink) {
            registerLink.addEventListener('click', (event) => {
                event.preventDefault();
                router.navigateTo('/register');
            });
        }
    }

    showLoading(isLoading) {
        const button = document.getElementById('loginButton');
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
            <div class="alert alert-danger" style="position: fixed; top: 20px; left: 50%; transform:
             translateX(-50%); background-color: #f44336; color: white; padding: 15px 25px;
              border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
              font-size: 16px; animation: slideIn 0.5s ease-out;">
                ❌ ${message}
            </div>
        `;
        
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 1000);
    }

    showSuccess(message) {
        
        this.showLoading(false);
        
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = `
            <div class="alert alert-success" style="position: fixed; top: 20px; left: 50%; 
            transform: translateX(-50%);background-color:rgba(31, 134, 193, 0.82); color:
             white; padding: 15px 25px; border-radius: 5px; box-shadow: 
             0 4px 6px rgba(0,0,0,0.1); font-size: 16px; animation: slideIn 0.5s ease-out;">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 2000);
    }

    setLoginSubmitHandler(handler) {
        this.onLoginSubmit = handler;
    }
}