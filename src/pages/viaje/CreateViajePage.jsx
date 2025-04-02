import React from 'react';
import FormViaje from '../../components/viaje/FormViaje'; // Asegúrate de que la ruta sea correcta

const CreateViajePage = () => {
  const handleViajeCreated = (newViaje) => {
    console.log('Nuevo viaje creado:', newViaje);
  };

  return (
    <div>
      
      <FormViaje onViajeCreated={handleViajeCreated} /> {/* Pasamos la función como prop */}
    </div>
  );
};

export default CreateViajePage;
