import { useState, useEffect } from "react";
import { getPropietarios } from '../../services/propietarioService';
import { getRecargas, createRecarga } from '../../services/recargaService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from "./recarga.module.css";
import Menu from '../../components/header/DashboardHeader';

const RecargarCombustible = () => {
  // Fecha de hoy “limpia” (sin hora)
  const today = new Date();
  const formattedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  // Formulario principal
  const [formData, setFormData] = useState({
    costo: "",
    cantidad: "",
    proveedor: "",
    fecha: formattedToday
  });

  // Listado de propietarios
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Guardamos las recargas previas (para debug o para usar)
  const [recargas, setRecargas] = useState([]);

  // Mapa de balances
  const [balances, setBalances] = useState({});

  // Distribuciones de la nueva recarga
  const [distribuciones, setDistribuciones] = useState([
    {
      nombrePropietario: "",
      cantidadrepartirlitros: "",
      cantidadrepartirlitrosrestantes: ""
    }
  ]);

  // Litros restantes si no se reparten todos
  const [litrosRestantes, setLitrosRestantes] = useState(0);

  // Estado para evitar envíos múltiples
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Colores para el gráfico
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1"
  ];

  //---------------------------------------------------------------------------
  // 1. Cargar propietarios al montar
  //---------------------------------------------------------------------------
  useEffect(() => {
    const fetchPropietarios = async () => {
      try {
        const data = await getPropietarios();
        setPropietarios(data);
      } catch (error) {
        console.error("Error fetching propietarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropietarios();
  }, []);

  //---------------------------------------------------------------------------
  // 2. Cargar recargas y calcular balances (incluyendo ajuste de “préstamos”)
  //---------------------------------------------------------------------------
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await getRecargas();
        console.log("Respuesta de getRecargas:", response);

        let recargasData = [];
        if (Array.isArray(response)) {
          recargasData = response;
        } else if (response && Array.isArray(response.data)) {
          recargasData = response.data;
        } else {
          console.error("El formato de recargas no es un arreglo:", response);
          return;
        }

        setRecargas(recargasData);

        const latestBalances = {};

        recargasData.forEach((recarga) => {
          const recargaDate = new Date(recarga.fecha);
          if (Array.isArray(recarga.distribuciones)) {
            recarga.distribuciones.forEach((dist) => {
              const nombre = dist.nombrePropietario;
              const currentBalance =
                parseFloat(dist.cantidadrepartirlitrosrestantes) || 0;

              // Si no existe o si la fecha es más reciente, actualizamos
              if (
                !latestBalances[nombre] ||
                new Date(latestBalances[nombre].fecha) < recargaDate
              ) {
                latestBalances[nombre] = {
                  balance: currentBalance,
                  fecha: recarga.fecha
                };
              }
            });
          }
        });

        const balanceMapping = {};
        for (const key in latestBalances) {
          balanceMapping[key] = latestBalances[key].balance;
        }

        // Ajuste simplificado de préstamos
        if (balanceMapping["josemanuel"] < 0) {
          const deudaJM = Math.abs(balanceMapping["josemanuel"]);
          balanceMapping["manuel"] =
            (balanceMapping["manuel"] || 0) + deudaJM;
        }

        console.log("Balances calculados (con ajuste):", balanceMapping);
        setBalances(balanceMapping);
      } catch (error) {
        console.error("Error fetching recargas for balances:", error);
      }
    };

    fetchBalances();
  }, []);

  //---------------------------------------------------------------------------
  // 3. Calcular “litrosRestantes” en la nueva recarga
  //---------------------------------------------------------------------------
  useEffect(() => {
    const cantidadTotal = parseFloat(formData.cantidad) || 0;
    const cantidadDistribuida = distribuciones.reduce((total, item) => {
      return total + (parseFloat(item.cantidadrepartirlitros) || 0);
    }, 0);
    setLitrosRestantes(cantidadTotal - cantidadDistribuida);
  }, [formData.cantidad, distribuciones]);

  //---------------------------------------------------------------------------
  // 4. Manejo de formulario principal
  //---------------------------------------------------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  //---------------------------------------------------------------------------
  // 5. Manejo de cada fila de distribución
  //---------------------------------------------------------------------------
  const handleDistribucionChange = (index, e) => {
    const { name, value } = e.target;
    const newDistribuciones = [...distribuciones];

    newDistribuciones[index][name] = value;

    const inputCantidad = parseFloat(newDistribuciones[index].cantidadrepartirlitros) || 0;
    const propietario = newDistribuciones[index].nombrePropietario;
    const previousBalance = balances[propietario] || 0;

    newDistribuciones[index].cantidadrepartirlitrosrestantes =
      inputCantidad + previousBalance;

    setDistribuciones(newDistribuciones);
  };

  const addRow = () => {
    setDistribuciones([
      ...distribuciones,
      {
        nombrePropietario: "",
        cantidadrepartirlitros: "",
        cantidadrepartirlitrosrestantes: ""
      }
    ]);
  };

  const removeRow = (index) => {
    const newDistribuciones = distribuciones.filter((_, i) => i !== index);
    setDistribuciones(newDistribuciones);
  };

  //---------------------------------------------------------------------------
  // 6. Al guardar la nueva recarga
  //---------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validar que cada fila tenga una cantidad > 0
    const invalidDistribuciones = distribuciones.filter(
      (dist) =>
        !dist.cantidadrepartirlitros ||
        parseFloat(dist.cantidadrepartirlitros) <= 0
    );
    if (invalidDistribuciones.length > 0) {
      alert("Por favor, ingrese una cantidad válida para cada distribución.");
      setIsSubmitting(false);
      return;
    }

    const preparedDistribuciones = distribuciones.map((dist) => ({
      ...dist,
      cantidadrepartirlitrosrestantes:
        parseFloat(dist.cantidadrepartirlitros) + (balances[dist.nombrePropietario] || 0)
    }));

    const formDataWithDistribuciones = {
      ...formData,
      distribuciones: preparedDistribuciones
    };

    try {
      const newRecarga = await createRecarga(formDataWithDistribuciones);
      console.log("Recarga creada con éxito:", newRecarga);
      alert("Datos guardados con éxito");

      // Limpiar el formulario
      setFormData({
        costo: "",
        cantidad: "",
        proveedor: "",
        fecha: formattedToday
      });
      setDistribuciones([
        {
          nombrePropietario: "",
          cantidadrepartirlitros: "",
          cantidadrepartirlitrosrestantes: ""
        }
      ]);
    } catch (error) {
      console.error("Error al crear la recarga:", error);
      alert("Hubo un error al guardar la recarga");
    } finally {
      setIsSubmitting(false);
    }
  };

  //---------------------------------------------------------------------------
  // 7. Calcular la tabla de “distribución final” que se va a mostrar
  //---------------------------------------------------------------------------
  const getFinalDistribuciones = () => {
    return distribuciones.map((dist) => {
      const propietario = dist.nombrePropietario;
      const inputCantidad = parseFloat(dist.cantidadrepartirlitros) || 0;
      const previousBalance = balances[propietario] || 0;
      const litrosEfectivos = inputCantidad + previousBalance;
      return {
        propietario,
        inputCantidad,
        litrosEfectivos
      };
    });
  };

  const finalDistribuciones = getFinalDistribuciones();
  const totalLitrosEfectivos = finalDistribuciones.reduce(
    (acc, item) => acc + item.litrosEfectivos,
    0
  );

  const costPerLiter =
    parseFloat(formData.costo) / (parseFloat(formData.cantidad) || 1);

  const finalDistribucionesConDatos = finalDistribuciones.map((item) => {
    const porcentaje = totalLitrosEfectivos
      ? (item.litrosEfectivos / totalLitrosEfectivos) * 100
      : 0;
    const costo = item.litrosEfectivos * costPerLiter;
    return {
      ...item,
      porcentaje,
      costo
    };
  });

  //---------------------------------------------------------------------------
  // 8. Datos para el gráfico
  //---------------------------------------------------------------------------
  const prepararDatosGrafico = () => {
    const validData = finalDistribucionesConDatos.filter(
      (dist) => dist.litrosEfectivos > 0
    );

    const chartData = validData.map((dist) => ({
      name: dist.propietario,
      value: dist.litrosEfectivos
    }));

    if (litrosRestantes > 0) {
      chartData.push({
        name: "Sin asignar",
        value: litrosRestantes
      });
    }
    return chartData;
  };

  const chartData = prepararDatosGrafico();

  return (
    <div className={styles.mainContainer}>
      <div>
        <Menu />
      </div>

      <div className={styles.Container}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2>Recargar Combustible</h2>
            <p>Complete los siguientes campos. Los obligatorios están marcados con *.</p>
          </div>

          {/* Formulario principal */}
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="fecha">Fecha *</label>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  className={styles.formControl}
                  readOnly
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="costo">Costo *</label>
                <input
                  type="number"
                  id="costo"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  className={styles.formControl}
                  placeholder="$0.00"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cantidad">Cantidad (litros) *</label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className={styles.formControl}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="proveedor">Proveedor *</label>
              <input
                type="text"
                id="proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Nombre de la estación de servicio"
                required
              />
            </div>

            {/* Tabla de ingreso de distribuciones */}
            <div className={styles.formGroup}>
              <div className={styles.recargaHeader}>
                <h3>Recarga Actual</h3>
                <div className={styles.litrosRestantes}>
                  <label>Litros restantes:</label>
                  <input
                    type="number"
                    value={litrosRestantes}
                    className={styles.formControl}
                    readOnly
                  />
                </div>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Propietario *</th>
                    <th>Litros (a ingresar)</th>
                    <th>Litros Efectivos (saldo + ingresado)</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {distribuciones.map((dist, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          name="nombrePropietario"
                          value={dist.nombrePropietario}
                          onChange={(e) => handleDistribucionChange(index, e)}
                          className={styles.formControl}
                          required
                        >
                          <option value="">Seleccione un propietario</option>
                          {loading ? (
                            <option disabled>Cargando propietarios...</option>
                          ) : (
                            propietarios.map((propietario) => (
                              <option
                                key={propietario._id}
                                value={propietario.nombrePropietario}
                              >
                                {propietario.nombrePropietario}
                              </option>
                            ))
                          )}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          name="cantidadrepartirlitros"
                          value={dist.cantidadrepartirlitros}
                          onChange={(e) => handleDistribucionChange(index, e)}
                          className={styles.formControl}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={dist.cantidadrepartirlitrosrestantes || 0}
                          className={styles.formControl}
                          readOnly
                        />
                      </td>
                      <td>
                        {distribuciones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className={styles.removeButton}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="button" onClick={addRow} className={styles.addButton}>
                Agregar Propietario
              </button>
            </div>

            {/* Botón de guardar */}
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </form>
        </div>

        {/* Tabla final de distribución (para ver saldos y costos) */}
        <div style={{ marginTop: "2rem" }}>
          <h3>Distribución Final</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Litros Ingresados</th>
                <th>Litros Efectivos</th>
                <th>Porcentaje</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {finalDistribucionesConDatos.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.propietario}</td>
                  <td>{item.inputCantidad}</td>
                  <td>{item.litrosEfectivos}</td>
                  <td>{item.porcentaje.toFixed(2)}%</td>
                  <td>${item.costo.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gráfico de la distribución (opcional) */}
        {formData.cantidad && chartData.length > 0 && (
          <div className={styles.chartContainer}>
            <h3>Gráfico de Distribución</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} litros`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecargarCombustible;
