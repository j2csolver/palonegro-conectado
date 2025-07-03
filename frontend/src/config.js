// Configuración de la URL base de la API según el entorno
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://palonegro-conectado-production.up.railway.app/api'  // URL de producción
  : 'http://localhost:4000/api';               // URL de desarrollo
export default API_BASE_URL;