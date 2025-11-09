const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !options.skipAuth) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401 && !options.skipAuth) {
      // Token expired, try to refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry the original request
        return this.request(endpoint, options);
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    });
    return response;
  }

  async register(userData) {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true,
    });
  }

  async getCurrentUser() {
    return this.request('/users/me/');
  }

  // Houses
  async getHouses() {
    return this.request('/houses/');
  }

  async createHouse(houseData) {
    return this.request('/houses/', {
      method: 'POST',
      body: JSON.stringify(houseData),
    });
  }

  async getHouseDebts(houseId) {
    return this.request(`/houses/${houseId}/member_debts/`);
  }

  async getShoppingList(houseId) {
    return this.request(`/houses/${houseId}/shopping_list/`);
  }

  // Drinks
  async getDrinks() {
    return this.request('/drinks/');
  }

  async createDrink(drinkData) {
    return this.request('/drinks/', {
      method: 'POST',
      body: JSON.stringify(drinkData),
    });
  }

  async updateDrink(drinkId, drinkData) {
    return this.request(`/drinks/${drinkId}/`, {
      method: 'PATCH',
      body: JSON.stringify(drinkData),
    });
  }

  async deleteDrink(drinkId) {
    return this.request(`/drinks/${drinkId}/`, {
      method: 'DELETE',
    });
  }

  async restockDrink(drinkId, quantity) {
    return this.request(`/drinks/${drinkId}/restock/`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  }

  // Consumptions
  async logConsumption(consumptionData) {
    return this.request('/consumptions/', {
      method: 'POST',
      body: JSON.stringify(consumptionData),
    });
  }

  async getRecentConsumptions() {
    return this.request('/consumptions/recent/');
  }
}

export const api = new ApiClient();
