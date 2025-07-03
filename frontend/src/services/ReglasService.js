import API_BASE_URL from '../config';

class ReglasService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/reglas`;
    }

    async getReglas() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('No se pudieron cargar las reglas');
            return await response.json();
        } catch (error) {
            throw new Error('Error al cargar reglas: ' + error.message);
        }
    }

    async createRegla(regla, token) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(regla)
            });
            if (!response.ok) throw new Error('No se pudo crear la regla');
            return await response.json();
        } catch (error) {
            throw new Error('Error al crear regla: ' + error.message);
        }
    }

    async updateRegla(id, regla, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(regla)
            });
            if (!response.ok) throw new Error('No se pudo actualizar la regla');
            return await response.json();
        } catch (error) {
            throw new Error('Error al actualizar regla: ' + error.message);
        }
    }

    async deleteRegla(id, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudo eliminar la regla');
            return await response.json();
        } catch (error) {
            throw new Error('Error al eliminar regla: ' + error.message);
        }
    }

    async getReglaById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            if (!response.ok) throw new Error('No se pudo cargar la regla');
            return await response.json();
        } catch (error) {
            throw new Error('Error al cargar la regla: ' + error.message);
        }
    }
}

export default new ReglasService();