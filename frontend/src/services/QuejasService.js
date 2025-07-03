import API_BASE_URL from '../config';

class QuejasService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/quejas`;
  }

  async getQuejas(token) {
    const response = await fetch(this.baseUrl, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('No se pudieron cargar las quejas');
    return await response.json();
  }

  async createQueja(queja, token) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(queja)
    });
    if (!response.ok) throw new Error('No se pudo crear la queja');
    return await response.json();
  }

  async updateQueja(id, queja, token) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(queja)
    });
    if (!response.ok) throw new Error('No se pudo actualizar la queja');
    return await response.json();
  }

  async deleteQueja(id, token) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('No se pudo eliminar la queja');
    return await response.json();
  }

  async getQuejaById(id, token) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('No se pudo cargar la queja');
    return await response.json();
  }
}

export default new QuejasService();