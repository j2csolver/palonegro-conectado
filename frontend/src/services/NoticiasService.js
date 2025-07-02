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
}
export default new NoticiasService();