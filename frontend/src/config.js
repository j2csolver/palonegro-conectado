// Configuración de la URL base de la API según el entorno
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.palonegro-conectado.com/api'  // URL de producción (ajustar según corresponda)
  : 'http://localhost:4000/api';               // URL de desarrollo
export default API_BASE_URL;