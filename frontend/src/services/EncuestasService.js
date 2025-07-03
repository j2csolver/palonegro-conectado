import API_BASE_URL from '../config';

class EncuestasService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/encuestas`;
  }

  // Obtener todas las encuestas
  async getEncuestas(token) {
    try {
      const response = await fetch(this.baseUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudieron cargar las encuestas');
      return await response.json();
    } catch (error) {
      throw new Error('Error al cargar encuestas: ' + error.message);
    }
  }

  // Obtener una encuesta por ID
  async getEncuestaById(encuestaId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudo cargar la encuesta');
      return await response.json();
    } catch (error) {
      throw new Error('Error al cargar la encuesta: ' + error.message);
    }
  }

  // Verificar si el usuario ya participó en la encuesta
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

  // Enviar respuestas a una encuesta
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

  // Cargar resultados de una encuesta
  async cargarResultados(encuestaId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}/resultados`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudieron cargar los resultados');
      return await response.json();
    } catch (error) {
      throw new Error('Error al cargar resultados: ' + error.message);
    }
  }

  // Crear una nueva encuesta
  async crearEncuesta({ titulo, activa, preguntas }, token) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, activa, preguntas })
      });
      if (!response.ok) throw new Error('No se pudo crear la encuesta');
      return await response.json();
    } catch (error) {
      throw new Error('Error al crear encuesta: ' + error.message);
    }
  }

  // Actualizar una encuesta existente
  async actualizarEncuesta(encuestaId, data, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('No se pudo actualizar la encuesta');
      return await response.json();
    } catch (error) {
      throw new Error('Error al actualizar encuesta: ' + error.message);
    }
  }

  // Eliminar una encuesta
  async eliminarEncuesta(encuestaId, token) {
    try {
      const response = await fetch(`${this.baseUrl}/${encuestaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('No se pudo eliminar la encuesta');
      return await response.json();
    } catch (error) {
      throw new Error('Error al eliminar encuesta: ' + error.message);
    }
  }
}

export default new EncuestasService();