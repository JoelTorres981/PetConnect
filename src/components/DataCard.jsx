// Componente de tarjeta de datos genérico y reutilizable para perfiles e información detallada.
// Props:
//   icon      — El elemento React del ícono (ej. <FaUserMd />)
//   label     — La etiqueta descriptiva (ej. "Tarifa por hora")
//   children  — Contenido o valor a mostrar dentro de la tarjeta
//   className — Clases CSS adicionales opcionales para personalizar el contenedor

export const DataCard = ({ icon, label, children, className = "" }) => (
    <div className={`flex items-start gap-4 bg-white p-4 rounded-2xl border border-secondary/10 shadow-sm
                    transition-transform hover:-translate-y-1 duration-300 ${className}`}>
        <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0 flex items-center justify-center">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-secondary/60 mb-1 truncate">{label}</p>
            {children}
        </div>
    </div>
);

export default DataCard;
