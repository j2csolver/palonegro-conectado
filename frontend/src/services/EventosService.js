import API_BASE_URL from '../config';

class EventosService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/eventos`;
  }

  async getEventos() {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('No se pudieron cargar los eventos');
    return await res.json();
  }

  async getEventoById(id) {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error('No se pudo cargar el evento');
    return await res.json();
  }

  async createEvento(evento, token) {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(evento)
    });
    if (!res.ok) throw new Error('No se pudo crear el evento');
    return await res.json();
  }

  async updateEvento(id, evento, token) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(evento)
    });
    if (!res.ok) throw new Error('No se pudo actualizar el evento');
    return await res.json();
  }

  async deleteEvento(id, token) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!res.ok) throw new Error('No se pudo eliminar el evento');
    return await res.json();
  }
}

export default new EventosService();