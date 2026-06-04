// Componente de pantalla o sección de carga animada reutilizable.
// Props:
//   message — Mensaje descriptivo del estado de carga (ej. "Cargando perfil...")
//   inline  — Si es true, se renderiza con menor espacio vertical, ideal para subsecciones

import { FaSpinner } from 'react-icons/fa';

export const LoadingScreen = ({ message = "Cargando información...", inline = false }) => (
    <div className={`flex flex-col items-center justify-center text-secondary ${
        inline ? 'h-[200px] p-6' : 'min-h-[300px] h-full py-16'
    }`}>
        <div className="flex flex-col items-center gap-3">
            <FaSpinner className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-secondary/60 animate-pulse">{message}</p>
        </div>
    </div>
);

export default LoadingScreen;
