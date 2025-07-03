import React, { useEffect, useState, useCallback, useRef } from 'react';
import NoticiasService from '../services/NoticiasService';
import { useAuth } from '../context/AuthContext';
import styles from './Noticias.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Configuración personalizada para la toolbar y los formatos permitidos, ahora con imagen y video
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video', 'blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ]
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'video', 'blockquote', 'code-block',
  'color', 'background'
];

export default function Noticias() {
  const { user, token } = useAuth();
  const [state, setState] = useState({
    noticias: [],
    loading: true,
    error: '',
    creando: false,
    editando: null,
    titulo: '',
    contenido: '',
    categoria: '',
    publicado: false,
    crearMensaje: ''
  });

  // Referencia al formulario para scroll automático
  const formRef = useRef(null);

  // Hacer scroll al formulario cuando se activa
  useEffect(() => {
    if (state.creando && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.creando]);

  const cargarNoticias = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      let data = await NoticiasService.getNoticias();
      // Si no es administrador, solo mostrar publicadas
      if (user?.rol !== 'Administrador') {
        data = data.filter(n => n.publicado);
      }
      setState(prev => ({ ...prev, noticias: data, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  }, [user?.rol]);

  useEffect(() => {
    cargarNoticias();
  }, [cargarNoticias]);

  // Crear o editar noticia
  const handleGuardar = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, crearMensaje: '' }));
    if (!state.titulo.trim() || !state.contenido.trim() || !state.categoria.trim()) {
      setState(prev => ({ ...prev, crearMensaje: 'Todos los campos son obligatorios.' }));
      return;
    }
    try {
      const noticiaPayload = {
        titulo: state.titulo,
        contenido: state.contenido,
        categoria: state.categoria,
        publicado: user?.rol === 'Administrador' ? state.publicado : false,
        autorId: user?.id
      };
      if (state.editando) {
        await NoticiasService.updateNoticia(state.editando, noticiaPayload, token);
        setState(prev => ({ ...prev, crearMensaje: 'Noticia actualizada correctamente.' }));
      } else {
        await NoticiasService.createNoticia(noticiaPayload, token);
        setState(prev => ({ ...prev, crearMensaje: 'Noticia creada correctamente.' }));
      }
      setState(prev => ({
        ...prev,
        creando: false,
        editando: null,
        titulo: '',
        contenido: '',
        categoria: '',
        publicado: false
      }));
      cargarNoticias();
    } catch (error) {
      setState(prev => ({ ...prev, crearMensaje: error.message || 'Error al guardar la noticia.' }));
    }
  };

  // Eliminar noticia
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta noticia?')) return;
    try {
      await NoticiasService.deleteNoticia(id, token);
      cargarNoticias();
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message || 'No se pudo eliminar la noticia.' }));
    }
  };

  // Iniciar edición
  const handleEditar = (noticia) => {
    setState(prev => ({
      ...prev,
      editando: noticia.id,
      creando: true,
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      categoria: noticia.categoria || '',
      publicado: typeof noticia.publicado === 'boolean' ? noticia.publicado : false,
      crearMensaje: ''
    }));
  };

  // Cancelar creación/edición
  const handleCancelar = () => {
    setState(prev => ({
      ...prev,
      creando: false,
      editando: null,
      titulo: '',
      contenido: '',
      categoria: '',
      publicado: false,
      crearMensaje: ''
    }));
  };

  return (
    <main>
      <section aria-label="Noticias de la comunidad">
        <h2>Noticias</h2>
        {user?.rol === 'Administrador' && !state.creando && (
          <button
            onClick={() => setState(prev => ({
              ...prev,
              creando: true,
              editando: null,
              titulo: '',
              contenido: '',
              categoria: '',
              publicado: false,
              crearMensaje: ''
            }))}
            className={styles.noticiasBtn}
          >
            Agregar noticia
          </button>
        )}

        {state.creando && (
          <form ref={formRef} onSubmit={handleGuardar} className={styles.noticiasForm}>
            <h3>{state.editando ? 'Editar noticia' : 'Agregar noticia'}</h3>
            <div className={styles.noticiasFormFields}>
              <label className={styles.noticiasLabel}>
                Título:
                <input
                  type="text"
                  value={state.titulo}
                  onChange={e => setState(prev => ({ ...prev, titulo: e.target.value }))}
                  className={styles.noticiasInput}
                  required
                  aria-required="true"
                />
              </label>
              <label className={styles.noticiasLabel}>
                Categoría:
                <input
                  type="text"
                  value={state.categoria}
                  onChange={e => setState(prev => ({ ...prev, categoria: e.target.value }))}
                  className={styles.noticiasInput}
                  required
                  aria-required="true"
                />
              </label>
              <label className={styles.noticiasLabel} style={{ marginTop: 8 }}>
                Contenido:
                <ReactQuill
                  theme="snow"
                  value={state.contenido}
                  onChange={value => setState(prev => ({ ...prev, contenido: value }))}
                  className={styles.noticiasTextarea}
                  modules={quillModules}
                  formats={quillFormats}
                />
              </label>
              {user?.rol === 'Administrador' && (
                <label className={styles.noticiasLabel} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={state.publicado}
                    onChange={e => setState(prev => ({ ...prev, publicado: e.target.checked }))}
                    style={{ marginRight: 8 }}
                  />
                  Publicado
                </label>
              )}
              <div>
                <button type="submit" className={styles.noticiasBtn}>
                  {state.editando ? 'Guardar cambios' : 'Crear noticia'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelar}
                  className={styles.noticiasBtn}
                  style={{ marginLeft: 8 }}
                >
                  Cancelar
                </button>
              </div>
              {state.crearMensaje && (
                <div style={{ marginTop: 8, color: state.crearMensaje.startsWith('Noticia') ? 'green' : 'red' }} role="alert" aria-live="polite">
                  {state.crearMensaje}
                </div>
              )}
            </div>
          </form>
        )}

        {state.loading && <p aria-live="polite">Cargando noticias...</p>}
        {state.error && <div style={{ color: 'red' }} role="alert" aria-live='assertive'>{state.error}</div>}
        {!state.loading && !state.error && state.noticias.length === 0 && (
          <p>No hay noticias disponibles en este momento.</p>
        )}
        {!state.loading && !state.error && state.noticias.length > 0 && (
          <ul>
            {state.noticias.map(noticia => (
              <li key={noticia.id}>
                <h3>{noticia.titulo}</h3>
                <div><strong>Categoría:</strong> {noticia.categoria}</div>
                <div>
                  <strong>Publicado:</strong> {noticia.publicado ? 'Sí' : 'No'}
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                  style={{ margin: '8px 0' }}
                />
                <small>{noticia.fecha ? new Date(noticia.fecha).toLocaleDateString() : ''}</small>
                {user?.rol === 'Administrador' && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => handleEditar(noticia)}
                      className={`${styles.noticiasBtn} ${styles.noticiasBtnSmall}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(noticia.id)}
                      className={`${styles.noticiasBtnRed} ${styles.noticiasBtnSmall}`}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}