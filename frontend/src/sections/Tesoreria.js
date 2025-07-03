import React, { useEffect, useRef, useCallback, useState } from 'react';
import TesoreriaService from '../services/TesoreriaService';
import { useAuth } from '../context/AuthContext';
import styles from './Tesoreria.module.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Configuración de la toolbar y formatos
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'blockquote', 'code-block'], // 'image' removido solo para descripción
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ]
};

const quillModulesComprobante = {
  toolbar: [
    ['image']
  ]
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'blockquote', 'code-block',
  'color', 'background'
];

export default function Tesoreria() {
  const { token } = useAuth();
  const [state, setState] = useState({
    transacciones: [],
    loading: true,
    error: '',
    creando: false,
    editando: null,
    tipo: 'ingreso',
    categoria: '',
    monto: '',
    descripcion: '',
    comprobante: '',
    fecha: '', // <-- aquí
    mensaje: '',
    chartData: { ingresos: 0, egresos: 0 }
  });

  const tipoRef = useRef(null);

  const cargarTransacciones = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await TesoreriaService.getTransacciones(token);
      const ingresos = data.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + Math.abs(t.monto), 0);
      const egresos = data.filter(t => t.tipo === 'egreso').reduce((acc, t) => acc + Math.abs(t.monto), 0);
      setState(prev => ({
        ...prev,
        transacciones: data,
        chartData: { ingresos, egresos },
        loading: false
      }));
    } catch {
      setState(prev => ({ ...prev, error: 'No se pudieron cargar las transacciones', loading: false }));
    }
  }, [token]);

  useEffect(() => {
    cargarTransacciones();
  }, [cargarTransacciones]);

  const limpiarFormulario = () => {
    setState(prev => ({
      ...prev,
      creando: false,
      editando: null,
      tipo: 'ingreso',
      categoria: '',
      monto: '',
      descripcion: '',
      comprobante: '',
      fecha: '', // <-- aquí
      mensaje: ''
    }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, mensaje: '' }));
    if (!state.categoria || !state.monto || !state.descripcion) {
      setState(prev => ({ ...prev, mensaje: 'Completa todos los campos obligatorios.' }));
      return;
    }
    const montoNum = Math.abs(parseFloat(state.monto));
    if (state.tipo === 'ingreso' && montoNum === 0) {
      setState(prev => ({ ...prev, mensaje: 'El monto de un ingreso debe ser mayor a cero.' }));
      return;
    }
    if (state.tipo === 'egreso' && montoNum === 0) {
      setState(prev => ({ ...prev, mensaje: 'El monto de un egreso debe ser mayor a cero.' }));
      return;
    }
    const transaccionPayload = {
      tipo: state.tipo,
      categoria: state.categoria,
      monto: montoNum,
      descripcion: state.descripcion,
      comprobante: state.comprobante
    };
    if (state.fecha) transaccionPayload.fecha = state.fecha; // solo si hay fecha

    try {
      if (state.editando) {
        await TesoreriaService.updateTransaccion(state.editando, transaccionPayload, token);
        setState(prev => ({ ...prev, mensaje: 'Transacción actualizada correctamente.' }));
      } else {
        await TesoreriaService.createTransaccion(transaccionPayload, token);
        setState(prev => ({ ...prev, mensaje: 'Transacción agregada correctamente.' }));
      }
      limpiarFormulario();
      cargarTransacciones();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo registrar la transacción.' }));
    }
  };

  const handleEditar = (t) => {
    setState(prev => ({
      ...prev,
      creando: true,
      editando: t.id,
      tipo: t.tipo,
      categoria: t.categoria,
      monto: Math.abs(t.monto),
      descripcion: t.descripcion,
      comprobante: t.comprobante || '',
      fecha: t.fecha ? t.fecha.slice(0, 10) : '', // formato yyyy-mm-dd
      mensaje: ''
    }));
    setTimeout(() => {
      if (tipoRef.current) tipoRef.current.focus();
    }, 0);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta transacción?')) return;
    try {
      await TesoreriaService.deleteTransaccion(id, token);
      cargarTransacciones();
    } catch (error) {
      setState(prev => ({ ...prev, mensaje: error.message || 'No se pudo eliminar la transacción.' }));
    }
  };

  return (
    <section>
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8
}}>
  <h2 style={{ margin: 0 }}>Tesorería</h2>
  <div
    style={{
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: state.chartData.ingresos - state.chartData.egresos >= 0 ? '#388e3c' : '#d32f2f',
      background: '#f5f5f5',
      borderRadius: 6,
      padding: '0.5rem 1.2rem'
    }}
  >
    Saldo actual: ${ (state.chartData.ingresos - state.chartData.egresos).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
  </div>
</div>
      {!state.creando && (
        <button
          onClick={() => setState(prev => ({
            ...prev,
            creando: true,
            editando: null,
            tipo: 'ingreso',
            categoria: '',
            monto: '',
            descripcion: '',
            comprobante: '',
            fecha: '', // <-- aquí
            mensaje: ''
          }))}
          className={styles.tesoreriaBtn}
        >
          Agregar comprobante
        </button>
      )}

      {state.creando && (
        <form onSubmit={handleGuardar} className={styles.tesoreriaForm}>
          <h3>{state.editando ? 'Editar Comprobante' : 'Agregar Comprobante'}</h3>
          <label>
            Fecha:
            <input
              type="date"
              value={state.fecha}
              onChange={e => setState(prev => ({ ...prev, fecha: e.target.value }))}
              className={styles.tesoreriaInput}
            />
          </label>
          <label>
            Tipo:
            <select
              ref={tipoRef}
              value={state.tipo}
              onChange={e => setState(prev => ({ ...prev, tipo: e.target.value }))}
              className={styles.tesoreriaInput}
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </label>
          <label>
            Categoría:
            <input
              type="text"
              value={state.categoria}
              onChange={e => setState(prev => ({ ...prev, categoria: e.target.value }))}
              required
              className={styles.tesoreriaInput}
            />
          </label>
          <label>
            Monto:
            <input
              type="number"
              value={state.monto}
              onChange={e => setState(prev => ({ ...prev, monto: e.target.value }))}
              required
              step="0.01"
              className={styles.tesoreriaInput}
            />
          </label>
          <label>
            Descripción:
            <ReactQuill
              theme="snow"
              value={state.descripcion}
              onChange={value => setState(prev => ({ ...prev, descripcion: value }))}
              modules={quillModules}
              formats={quillFormats}
              className={styles.tesoreriaInput}
            />
          </label>
          <label>
            Comprobante (adjuntar imagen o archivo):
            <ReactQuill
              theme="snow"
              value={state.comprobante}
              onChange={value => setState(prev => ({ ...prev, comprobante: value }))}
              modules={quillModulesComprobante}
              formats={quillFormats}
              className={styles.tesoreriaInput}
            />
          </label>
          <button type="submit" className={styles.tesoreriaBtn}>
            {state.editando ? 'Guardar' : 'Agregar'}
          </button>
          <button
            type="button"
            onClick={limpiarFormulario}
            className={styles.tesoreriaBtn}
            style={{ marginLeft: 8, background: '#bdbdbd', color: '#222' }}
          >
            Cancelar
          </button>
          {state.mensaje && <div className={styles.tesoreriaMensajeError}>{state.mensaje}</div>}
        </form>
      )}

      <h3>Relación de Ingresos y Egresos</h3>
      {state.loading ? (
        <p>Cargando transacciones...</p>
      ) : (
        <table className={styles.tesoreriaTabla}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th>Comprobante</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {state.transacciones
              .slice() // copia para no mutar el estado
              .sort((a, b) => {
                // Ordena por fecha ascendente (menor a mayor)
                if (!a.fecha) return -1;
                if (!b.fecha) return 1;
                return a.fecha.localeCompare(b.fecha);
              })
              .map(t => (
                <tr key={t.id}>
                  <td>
                    {/* Muestra la fecha en formato YYYY-MM-DD para evitar desfase */}
                    {t.fecha ? t.fecha.slice(0, 10) : ''}
                  </td>
                  <td>{t.tipo}</td>
                  <td>{t.categoria}</td>
                  <td className={t.tipo === 'egreso' ? styles.tesoreriaEgreso : styles.tesoreriaIngreso}>
                    {t.tipo === 'egreso' ? '-' : '+'}$
                    {Math.abs(t.monto).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span dangerouslySetInnerHTML={{ __html: t.descripcion }} />
                  </td>
                  <td>
                    {t.comprobante ? (
                      <span dangerouslySetInnerHTML={{ __html: t.comprobante }} />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.tesoreriaBtn}
                      style={{ padding: '0.3rem 0.8rem', marginRight: 6, fontSize: '0.95rem' }}
                      onClick={() => handleEditar(t)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.tesoreriaBtn}
                      style={{ background: '#d32f2f', padding: '0.3rem 0.8rem', fontSize: '0.95rem' }}
                      onClick={() => handleEliminar(t.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 32 }}>Gráfico Ingresos vs Egresos</h3>
      <div className={styles.tesoreriaGrafico}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div
            className={styles.tesoreriaGraficoBar}
            style={{
              background: '#388e3c',
              height: `${state.chartData.ingresos === 0 && state.chartData.egresos === 0 ? 0 : (state.chartData.ingresos / Math.max(state.chartData.ingresos, state.chartData.egresos)) * 120}px`
            }}
          />
          <div>Ingresos</div>
          <div className={styles.tesoreriaGraficoLabel}>
            ${state.chartData.ingresos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div
            className={styles.tesoreriaGraficoBar}
            style={{
              background: '#d32f2f',
              height: `${state.chartData.ingresos === 0 && state.chartData.egresos === 0 ? 0 : (state.chartData.egresos / Math.max(state.chartData.ingresos, state.chartData.egresos)) * 120}px`
            }}
          />
          <div>Egresos</div>
          <div className={styles.tesoreriaGraficoLabel}>
            ${state.chartData.egresos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </section>
  );
}