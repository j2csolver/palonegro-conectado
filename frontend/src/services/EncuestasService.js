import API_BASE_URL from '../config';
class EncuestasService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/encuestas`;
  }
  async getEncuestas(token) {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('No se pudieron cargar las encuestas');
      return await response.json();
    } catch (error) {
      throw new Error('Error al cargar encuestas: ' + error.message);
    }
  }
  async verificarParticipacion(encuestaId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}/participacion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudo verificar la participación');
      return await response.json();
    } catch (error) {
      throw new Error('Error al verificar participación: ' + error.message);
    }
  }
  async enviarRespuestas(encuestaId, respuestas, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas })
      });
      if (!response.ok) {
        if (response.status === 409) throw new Error('Ya has participado en esta encuesta');
        throw new Error('No se pudo registrar el voto');
      }
      return await response.json();
    } catch (error) {
      throw new Error('Error al enviar respuestas: ' + error.message);
    }
  }
  async cargarResultados(encuestaId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}/resultados`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('No se pudieron cargar los resultados');
      }
      return await response.json();
    } catch (error) {
      throw new Error('Error al cargar resultados: ' + error.message);
    }
  }
}
export default new EncuestasService();