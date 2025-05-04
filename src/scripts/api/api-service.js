class ApiService {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to register: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();
      if (responseJson.error) throw new Error(responseJson.message);

      localStorage.setItem('token', responseJson.loginResult.token);
      return responseJson;
    } catch (error) {
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

  async getAllStories() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      const response = await fetch(`${this.baseUrl}/stories?location=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseJson = await response.json();
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson.listStory;
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  }

  async addNewStory(description, photoBlob, lat, lon) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoBlob, 'photo.jpg');
      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseJson = await response.json();
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to add story: ${error.message}`);
    }
  }

  
  async _guestLogin() {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'key@gemoy.com',
          password: 'password123',
        }),
      });

      const responseJson = await response.json();
      if (!responseJson.error) {
        localStorage.setItem('token', responseJson.loginResult.token);
      } else {
        await this._registerGuestAccount();
      }
    } catch (error) {
      console.error('Guest login failed:', error);
      await this._registerGuestAccount();
    }
  }

  async _registerGuestAccount() {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'key',
          email: 'key@gemoy.com',
          password: 'password123',
        }),
      });

      const responseJson = await response.json();
      if (!responseJson.error) await this._guestLogin();
    } catch (error) {
      console.error('Guest registration failed:', error);
    }
  }
}

const apiService = new ApiService();
