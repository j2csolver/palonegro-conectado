import API_BASE_URL from '../config';

class UserService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/users`;
    }

    async getUsuarios(token) {
        try {
            const response = await fetch(this.baseUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudieron cargar los usuarios');
            return await response.json();
        } catch (error) {
            throw new Error('Error al cargar usuarios: ' + error.message);
        }
    }

    async createUsuario(usuario, token) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(usuario)
            });
            if (!response.ok) throw new Error('No se pudo crear el usuario');
            return await response.json();
        } catch (error) {
            throw new Error('Error al crear usuario: ' + error.message);
        }
    }

    async updateUsuario(id, usuario, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(usuario)
            });
            if (!response.ok) throw new Error('No se pudo actualizar el usuario');
            return await response.json();
        } catch (error) {
            throw new Error('Error al actualizar usuario: ' + error.message);
        }
    }

    async deleteUsuario(id, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudo eliminar el usuario');
            return await response.json();
        } catch (error) {
            throw new Error('Error al eliminar usuario: ' + error.message);
        }
    }

    async cambiarPassword(id, nuevaPassword, token) {
        const response = await fetch(`${this.baseUrl}/cambiar-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id, nuevaPassword })
        });
        if (!response.ok) throw new Error('No se pudo cambiar la contraseña');
        return await response.json();
    }
}

export default new UserService();