import React, { useEffect, useState } from 'react';
import TesoreriaService from '../services/TesoreriaService';
import { useAuth } from '../context/AuthContext';

export default function ResumenFinanciero() {
  const { token } = useAuth();
  const [resumen, setResumen] = useState({
    ingresosPorCategoria: {},
    egresosPorCategoria: {},
    totalIngresos: 0,
    totalEgresos: 0,
    loading: true,
    error: ''
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const transacciones = await TesoreriaService.getTransacciones(token);
        const ingresosPorCategoria = {};
        const egresosPorCategoria = {};
        let totalIngresos = 0;
        let totalEgresos = 0;

        transacciones.forEach(t => {
          if (t.tipo === 'ingreso') {
            ingresosPorCategoria[t.categoria] = (ingresosPorCategoria[t.categoria] || 0) + Math.abs(t.monto);
            totalIngresos += Math.abs(t.monto);
          } else if (t.tipo === 'egreso') {
            egresosPorCategoria[t.categoria] = (egresosPorCategoria[t.categoria] || 0) + Math.abs(t.monto);
            totalEgresos += Math.abs(t.monto);
          }
        });

        setResumen({
          ingresosPorCategoria,
          egresosPorCategoria,
          totalIngresos,
          totalEgresos,
          loading: false,
          error: ''
        });
      } catch {
        setResumen(prev => ({ ...prev, loading: false, error: 'No se pudo cargar el resumen financiero.' }));
      }
    };
    cargar();
  }, [token]);

  if (resumen.loading) return <p>Cargando resumen financiero...</p>;
  if (resumen.error) return <p style={{ color: 'red' }}>{resumen.error}</p>;

  return (
    <section>
      <h2>Resumen Financiero</h2>
      <h3>Ingresos por Categoría</h3>
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Categoría</th>
            <th style={{ textAlign: 'right' }}>Monto</th>
            <th style={{ textAlign: 'right' }}>%</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resumen.ingresosPorCategoria).map(([cat, monto]) => (
            <tr key={cat}>
              <td>{cat}</td>
              <td style={{ textAlign: 'right' }}>
                ${monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ textAlign: 'right' }}>
                {resumen.totalIngresos > 0
                  ? ((monto / resumen.totalIngresos) * 100).toFixed(1) + '%'
                  : '0%'}
              </td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', background: '#f5f5f5' }}>
            <td>Total Ingresos</td>
            <td style={{ textAlign: 'right' }}>
              ${resumen.totalIngresos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td />
          </tr>
        </tbody>
      </table>

      <h3>Egresos por Categoría</h3>
      <table style={{ width: '100%', marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Categoría</th>
            <th style={{ textAlign: 'right' }}>Monto</th>
            <th style={{ textAlign: 'right' }}>%</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resumen.egresosPorCategoria).map(([cat, monto]) => (
            <tr key={cat}>
              <td>{cat}</td>
              <td style={{ textAlign: 'right', color: '#d32f2f' }}>
                -${monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ textAlign: 'right' }}>
                {resumen.totalEgresos > 0
                  ? ((monto / resumen.totalEgresos) * 100).toFixed(1) + '%'
                  : '0%'}
              </td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', background: '#f5f5f5' }}>
            <td>Total Egresos</td>
            <td style={{ textAlign: 'right', color: '#d32f2f' }}>
              -${resumen.totalEgresos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td />
          </tr>
          <tr style={{ fontWeight: 'bold', background: '#e3f2fd' }}>
            <td>Saldo</td>
            <td style={{ textAlign: 'right', color: resumen.totalIngresos - resumen.totalEgresos >= 0 ? '#388e3c' : '#d32f2f' }}>
              ${ (resumen.totalIngresos - resumen.totalEgresos).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </section>
  );
}