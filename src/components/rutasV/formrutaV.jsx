import { useState, useEffect } from 'react';
import { actualizarRuta, crearRuta } from '../../services/rutaServiceV';
import { getViajes } from '../../services/viaje/viajeService';
import { getOperadores } from '../../services/OperadorService';
import styles from './RutaForm.module.css';

const RutaForm = ({ 
    ruta = {
        numeroRuta: '',
        nombreCliente: '',
        turnos: [''], 
        horarios: [''],
        rutaSalida: [''],
        rutaDestino: [''],
        unidades: [''],
        operadores: [''],
        _id: null
    }, 
    onCancel, 
    onSuccess  
}) => {
    const [numeroRuta, setNumeroRuta] = useState(ruta.numeroRuta || '');
    const [nombreCliente, setNombreCliente] = useState(ruta.nombreCliente || '');
    const [turnos, setTurnos] = useState(ruta.turnos || ['']);
    const [horarios, setHorarios] = useState(ruta.horarios || ['']);
    const [rutaSalida, setRutaSalida] = useState(ruta.rutaSalida || ['']);
    const [rutaDestino, setRutaDestino] = useState(ruta.rutaDestino || ['']);
    const [unidades, setUnidades] = useState(ruta.unidades || ['']);
    const [operadores, setOperadores] = useState(ruta.operadores || ['']);
    const [error, setError] = useState('');

    // New state for available options
    const [availableUnidades, setAvailableUnidades] = useState([]);
    const [availableOperadores, setAvailableOperadores] = useState([]);

    // Fetch available units and operators on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Fetch viajes for unit numbers - Updated to use numeroRuta
                const viajesData = await getViajes();
                const uniqueUnidades = [...new Set(viajesData.map(viaje => viaje.numeroRuta))]
                    .filter(numero => numero) // Filter out any null/undefined values
                    .sort((a, b) => a - b); // Sort numerically
                setAvailableUnidades(uniqueUnidades);

                // Fetch operators
                const operadoresData = await getOperadores();
                const operadorNames = operadoresData.map(operador => operador.nombre);
                setAvailableOperadores(operadorNames);
            } catch (error) {
                console.error("Error fetching options:", error);
                setError('Error al cargar las opciones disponibles');
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        if (ruta?._id) {
            setNumeroRuta(ruta.numeroRuta || '');
            setNombreCliente(ruta.nombreCliente || '');
            setTurnos(ruta.turnos || ['']);
            setHorarios(ruta.horarios || ['']);
            setRutaSalida(ruta.rutaSalida || ['']);
            setRutaDestino(ruta.rutaDestino || ['']);
            setUnidades(ruta.unidades || ['']);
            setOperadores(ruta.operadores || ['']);
        }
    }, [ruta]);

    const handleChange = (index, e, setter, stateArray) => {
        const updatedState = [...stateArray];
        updatedState[index] = e.target.value;
        setter(updatedState);
    };

    const agregarFila = () => {
        setTurnos([...turnos, '']);
        setHorarios([...horarios, '']);
        setRutaSalida([...rutaSalida, '']);
        setRutaDestino([...rutaDestino, '']);
        setUnidades([...unidades, '']);
        setOperadores([...operadores, '']);
    };

    const eliminarFila = (index) => {
        if (horarios.length > 1) {
            setTurnos(turnos.filter((_, i) => i !== index));
            setHorarios(horarios.filter((_, i) => i !== index));
            setRutaSalida(rutaSalida.filter((_, i) => i !== index));
            setRutaDestino(rutaDestino.filter((_, i) => i !== index));
            setUnidades(unidades.filter((_, i) => i !== index));
            setOperadores(operadores.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    
        const datosAEnviar = {
            numeroRuta,
            nombreCliente,
            turnos,
            horarios,
            rutaSalida,
            rutaDestino,
            unidades,  // Remove the Number mapping since we're now using route numbers
            operadores
        };

        try {
            if (ruta._id) {
                await actualizarRuta(ruta._id, datosAEnviar);
            } else {
                await crearRuta(datosAEnviar);
            }
            
            if (typeof onSuccess === 'function') {
                onSuccess();
            }
        } catch (error) {
            console.error("Error al guardar la ruta:", error);
            setError('Hubo un error al guardar la ruta. Por favor, intente nuevamente.');
        }
    };

    return (
        <div className={styles.rutaForm}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Número de Ruta:</label>
                    <input
                        type="number"
                        value={numeroRuta}
                        onChange={(e) => setNumeroRuta(e.target.value)}
                        required
                        className={styles.formControl}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Nombre del Cliente:</label>
                    <input
                        type="text"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                        required
                        className={styles.formControl}
                    />
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Turno</th>
                            <th>Horario</th>
                            <th>Ruta Salida</th>
                            <th>Ruta Destino</th>
                            <th>Unidad</th>
                            <th>Operador</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horarios.map((_, index) => (
                            <tr key={index}>
                                <td>
                                    <input 
                                        type="text" 
                                        value={turnos[index]} 
                                        onChange={(e) => handleChange(index, e, setTurnos, turnos)} 
                                        required 
                                        className={styles.formControl} 
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text" 
                                        value={horarios[index]} 
                                        onChange={(e) => handleChange(index, e, setHorarios, horarios)} 
                                        required 
                                        className={styles.formControl} 
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text" 
                                        value={rutaSalida[index]} 
                                        onChange={(e) => handleChange(index, e, setRutaSalida, rutaSalida)} 
                                        required 
                                        className={styles.formControl} 
                                    />
                                </td>
                                <td>
                                    <input 
                                        type="text" 
                                        value={rutaDestino[index]} 
                                        onChange={(e) => handleChange(index, e, setRutaDestino, rutaDestino)} 
                                        required 
                                        className={styles.formControl} 
                                    />
                                </td>
                                <td>
                                    <select 
                                        value={unidades[index]} 
                                        onChange={(e) => handleChange(index, e, setUnidades, unidades)}
                                        required 
                                        className={styles.formControl}
                                    >
                                        <option value="">Seleccionar unidad</option>
                                        {availableUnidades.map((unidad) => (
                                            <option key={unidad} value={unidad}>
                                                {unidad}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select 
                                        value={operadores[index]} 
                                        onChange={(e) => handleChange(index, e, setOperadores, operadores)}
                                        required 
                                        className={styles.formControl}
                                    >
                                        <option value="">Seleccionar operador</option>
                                        {availableOperadores.map((operador) => (
                                            <option key={operador} value={operador}>
                                                {operador}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <button 
                                        type="button" 
                                        onClick={() => eliminarFila(index)} 
                                        className={styles.btnDanger} 
                                        disabled={horarios.length === 1}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={agregarFila} className={styles.btnSecondary}>Agregar Fila</button>
                    <button type="submit" className={styles.btnPrimary}>Guardar</button>
                    <button type="button" onClick={onCancel} className={styles.btnOutlineSecondary}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};

export default RutaForm;