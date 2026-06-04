// Componente Modal genérico reutilizable para toda la aplicación.
// Props:
//   title    — título del encabezado
//   onClose  — función para cerrar
//   children — contenido interno

export const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7 relative">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-secondary/40 hover:text-secondary text-xl"
            >
                ✕
            </button>
            <h2 className="text-xl font-bold text-secondary mb-5">{title}</h2>
            {children}
        </div>
    </div>
)

export default Modal
