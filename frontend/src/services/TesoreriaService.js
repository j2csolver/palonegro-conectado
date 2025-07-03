const API_URL = 'http://localhost:4000/api/tesoreria';

const TesoreriaService = {
  async getTransacciones(token) {
    const res = await fetch(API_URL, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('No se pudieron cargar las transacciones');
    return await res.json();
  },

  async getTransaccionById(id, token) {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('No se pudo cargar la transacción');
    return await res.json();
  },

  async createTransaccion(data, token) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('No se pudo crear la transacción');
    return await res.json();
  },

  async updateTransaccion(id, data, token) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('No se pudo actualizar la transacción');
    return await res.json();
  },

  async deleteTransaccion(id, token) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('No se pudo eliminar la transacción');
    return await res.json();
  }
};

export default TesoreriaService;