import React, { useState } from 'react';
import { createTurno } from '../../services/clientesServive';
import styles from './clienteforms.module.css';

const FormCliente = () => {
  const [empresa, setEmpresa] = useState('');
  const [turnos, setTurnos] = useState([
    { clave: '', turno: '', lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTurno = () => {
    setTurnos([
      ...turnos,
      { clave: '', turno: '', lunes: '', martes: '', miercoles: '', jueves: '', viernes: '', sabado: '', domingo: '' },
    ]);
  };

  const handleRemoveTurno = (index) => {
    setTurnos(turnos.filter((_, i) => i !== index));
  };

  const handleTurnoChange = (index, field, value) => {
    const updatedTurnos = turnos.map((turno, i) =>
      i === index ? { ...turno, [field]: value } : turno
    );
    setTurnos(updatedTurnos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      for (const turno of turnos) {
        for (const dia of ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']) {
          if (!turno[dia]) {
            setError('Todos los campos de los días deben estar completos.');
            setLoading(false);
            return;
          }
        }
      }

      const turnosConHorarios = turnos.map(turno => ({
        ...turno,
        horarios: {
          lunes: turno.lunes,
          martes: turno.martes,
          miercoles: turno.miercoles,
          jueves: turno.jueves,
          viernes: turno.viernes,
          sabado: turno.sabado,
          domingo: turno.domingo,
        }
      }));

      const data = await createTurno(empresa, turnosConHorarios);
      console.log('Formulario enviado:', data);
      alert('Empresa y turnos guardados correctamente!');
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setError('Hubo un error al guardar los turnos');
    } finally {
      setLoading(false);
    }
  };

  // Nuevo estilo basado en la imagen
  return (
    <div className={styles.formContainer}>
      <div className={styles.container}>
        <h2 style={{ textAlign: 'center', margin: '20px 0', color: '#333' }}>Agregar Empresa y Turnos</h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Nombre de la empresa:
            </label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Turnos:</h3>
          
          {turnos.map((turno, index) => (
            <div key={index} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Clave:</label>
                  <input
                    type="number"
                    value={turno.clave}
                    onChange={(e) => handleTurnoChange(index, 'clave', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Turno:</label>
                  <input
                    type="text"
                    value={turno.turno}
                    onChange={(e) => handleTurnoChange(index, 'turno', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
                  <div key={dia}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}:
                    </label>
                    <input
                      type="text"
                      value={turno[dia]}
                      onChange={(e) => handleTurnoChange(index, dia, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveTurno(index)}
                style={{
                  marginTop: '15px',
                  padding: '8px 15px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Eliminar Turno
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddTurno}
            style={{
              display: 'block',
              margin: '20px 0',
              padding: '10px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Agregar otro turno
          </button>

          {error && (
            <div style={{ color: 'red', margin: '15px 0', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#cccccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormCliente;