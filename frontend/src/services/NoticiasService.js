import API_BASE_URL from '../config';

class NoticiasService {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/noticias`;
    }

    async getNoticias() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('No se pudieron cargar las noticias');
            return await response.json();
        } catch (error) {
            throw new Error('Error al cargar noticias: ' + error.message);
        }
    }

    async createNoticia(noticia, token) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(noticia)
            });
            if (!response.ok) throw new Error('No se pudo crear la noticia');
            return await response.json();
        } catch (error) {
            throw new Error('Error al crear noticia: ' + error.message);
        }
    }

    async updateNoticia(id, noticia, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(noticia)
            });
            if (!response.ok) throw new Error('No se pudo actualizar la noticia');
            return await response.json();
        } catch (error) {
            throw new Error('Error al actualizar noticia: ' + error.message);
        }
    }

    async deleteNoticia(id, token) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('No se pudo eliminar la noticia');
            return await response.json();
        } catch (error) {
            throw new Error('Error al eliminar noticia: ' + error.message);
        }
    }
}

export default new NoticiasService();