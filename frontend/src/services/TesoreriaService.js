import API_BASE_URL from '../config';

class TesoreriaService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/tesoreria`;
    }

    async getTransacciones(token) {
        try {
            const response = await fetch(this.baseUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudieron cargar las transacciones');
            return await response.json();
        } catch (error) {
            throw new Error('Error al cargar transacciones: ' + error.message);
        }
    }

    async getTransaccionById(id, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudo cargar la transacción');
            return await response.json();
        } catch (error) {
            throw new Error('Error al cargar transacción: ' + error.message);
        }
    }

    async createTransaccion(transaccion, token) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaccion)
            });
            if (!response.ok) throw new Error('No se pudo crear la transacción');
            return await response.json();
        } catch (error) {
            throw new Error('Error al crear transacción: ' + error.message);
        }
    }

    async updateTransaccion(id, transaccion, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaccion)
            });
            if (!response.ok) throw new Error('No se pudo actualizar la transacción');
            return await response.json();
        } catch (error) {
            throw new Error('Error al actualizar transacción: ' + error.message);
        }
    }

    async deleteTransaccion(id, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudo eliminar la transacción');
            return await response.json();
        } catch (error) {
            throw new Error('Error al eliminar transacción: ' + error.message);
        }
    }
}

export default new TesoreriaService();