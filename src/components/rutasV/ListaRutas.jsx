import { useState, useEffect } from 'react';
import { obtenerRutas, eliminarRuta } from '../../services/rutaServiceV';
import RutaForm from '../../components/rutasV/formrutaV';

const RutasTable = () => {
    const [rutas, setRutas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rutaEditando, setRutaEditando] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const cargarRutas = async () => {
        setLoading(true);
        setError('');
        try {
            const rutasData = await obtenerRutas();
            setRutas(rutasData);
        } catch (error) {
            console.error('Error al obtener las rutas:', error);
            setError('Error al cargar las rutas. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarRutas();
    }, []);

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta ruta?')) {
            try {
                await eliminarRuta(id);
                await cargarRutas();
            } catch (error) {
                console.error('Error al eliminar la ruta:', error);
                setError('Error al eliminar la ruta. Por favor, intente nuevamente.');
            }
        }
    };

    const handleNuevaRuta = () => {
        setRutaEditando(null);
        setMostrarFormulario(true);
    };

    const handleActualizar = (ruta) => {
        setRutaEditando(ruta);
        setMostrarFormulario(true);
    };

    const handleFormSuccess = async () => {
        await cargarRutas();
        setRutaEditando(null);
        setMostrarFormulario(false);
    };

    const handleCancel = () => {
        setRutaEditando(null);
        setMostrarFormulario(false);
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="rutas-container">
            <h2 className="title">Gestión de Rutas</h2>

            {error && <div className="error-message">{error}</div>}

            {mostrarFormulario ? (
                <RutaForm
                    ruta={rutaEditando}
                    onCancel={handleCancel}
                    onSuccess={handleFormSuccess}
                />
            ) : (
                <>
                   
                    <div className="rutas-list">
                        {rutas.map((ruta) => (
                            <div key={ruta._id} className="ruta-card">
                                <h3 className="ruta-header">
                                    Ruta {ruta.numeroRuta}
                                </h3>
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Turno</th>
                                                <th>Horario</th>
                                                <th>Ruta Salida</th>
                                                <th>Ruta Destino</th>
                                                <th>Unidad</th>
                                                <th>Operador</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ruta.horarios.map((horario, index) => (
                                                <tr key={index}>
                                                    <td>{ruta.turnos[index]}</td>
                                                    <td>{horario}</td>
                                                    <td>{ruta.rutaSalida[index]}</td>
                                                    <td>{ruta.rutaDestino[index]}</td>
                                                    <td>{ruta.unidades[index]}</td>
                                                    <td>{ruta.operadores[index]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="ruta-actions">
                                    <button 
                                        onClick={() => handleActualizar(ruta)}
                                        className="btn btn-secondary"
                                    >
                                        Actualizar
                                    </button>
                                    <button 
                                        onClick={() => handleEliminar(ruta._id)}
                                        className="btn btn-danger"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RutasTable;
