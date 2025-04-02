import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MaintenanceModal = ({ show, handleClose, maintenances }) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content">
          
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Detalles de Mantenimiento</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={handleClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body">
            {maintenances.length === 0 ? (
              <p className="text-center text-muted">No hay datos de mantenimiento</p>
            ) : (
              maintenances.map((m, index) => (
                <div key={index} className="mb-4 border-bottom pb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Asignado:</strong> {m.asignado}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Fecha:</strong> {m.fecha}
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Hora:</strong> {m.hora}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Falla:</strong> {m.falla}
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Solución:</strong> {m.solucion}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Operador:</strong> {m.nombreOperador}
                      </p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Kilometraje:</strong> {m.kilometraje}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Total:</strong> {m.total}
                      </p>
                    </div>
                  </div>

                  {/* Horas Usadas */}
                  {m.horasUsadas && (
                    <div className="row">
                      <div className="col-md-6">
                        <p>
                          <strong>Inicio:</strong> {m.horasUsadas.inicio}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Fin:</strong> {m.horasUsadas.fin}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Refacciones */}
                  {m.refacciones && m.refacciones.length > 0 && (
                    <>
                      <h6 className="mt-3">Refacciones</h6>
                      {m.refacciones.map((r, i) => (
                        <div className="row mb-2" key={i}>
                          <div className="col-md-4">
                            <strong>{r.nombre}</strong>
                          </div>
                          <div className="col-md-4">
                            Costo: {r.costo}
                          </div>
                          <div className="col-md-4">
                            Descripción: {r.descripcion}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
