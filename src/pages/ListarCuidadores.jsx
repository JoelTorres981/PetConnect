import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../helpers/authHeaders';
import { FaEnvelope, FaPhone, FaMoneyBillWave, FaClock, FaCalendarAlt, FaStar, FaBriefcase, FaSpinner } from 'react-icons/fa';
import portadaCuidadorFallback from '../assets/portadaCuidador.png';
import { Modal } from '../components/Modal';
import { ModalResenas } from '../components/ModalResenas'

const API = import.meta.env.VITE_BACKEND_URL;

const TarjetaCuidador = ({ cuidador, onVerResenas }) => {
    const { usuario, biografia, tarifa_hora, servicios_ofrecidos, portada_url } = cuidador;

    // Si el usuario no existe (inactivo/eliminado), no renderizamos la tarjeta
    if (!usuario) return null;

    return (
        <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col h-full relative group">
            {/* Foto de Portada */}
            <div className="relative h-32 w-full bg-primary/20">
                <img
                    src={portada_url || portadaCuidadorFallback}
                    alt="portada"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            {/* Avatar */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
                <img
                    src={usuario.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                />
            </div>

            {/* Contenido */}
            <div className="p-5 pt-12 flex-1 flex flex-col text-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-secondary mb-1">
                        {usuario.nombre} {usuario.apellido}
                    </h3>

                    {/* Contacto */}
                    <div className="flex justify-center gap-3 text-secondary/60 text-xs mb-4">
                        <a href={`mailto:${usuario.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <FaEnvelope /> {usuario.email}
                        </a>
                        {usuario.telefono && (
                            <a href={`tel:${usuario.telefono}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                <FaPhone /> {usuario.telefono}
                            </a>
                        )}
                    </div>

                    <p className="text-sm text-secondary/70 italic line-clamp-3 mb-4 flex-1">
                        "{biografia || 'Sin biografía disponible.'}"
                    </p>

                    {/* Detalles Grid */}
                    <div className="bg-base rounded-xl p-3 border border-secondary/5 mb-4 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-secondary/40 flex items-center gap-1"><FaMoneyBillWave /> Tarifa</span>
                        <span className="text-sm font-bold text-primary">${tarifa_hora?.toFixed(2)} / hr</span>
                    </div>

                    {/* Servicios */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-secondary/40 mb-2 flex items-center justify-center gap-1"><FaBriefcase /> Servicios</span>
                        <div className="flex flex-wrap justify-center gap-1">
                            {servicios_ofrecidos?.length > 0 ? (
                                servicios_ofrecidos.map((s, i) => (
                                    <span key={i} className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                        {s}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-secondary/40">Sin servicios</span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onVerResenas(cuidador)}
                    className="w-full mt-5 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                    ⭐ Ver Reseñas
                </button>
            </div>
        </div>
    );
};

export const ListarCuidadores = () => {
    const [cuidadores, setCuidadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalResenas, setModalResenas] = useState(null);

    const cargarCuidadores = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/cuidadores/listar-cuidadores`, getAuthHeaders());
            // Si la base de datos está vacía, puede retornar un msg en vez del arreglo
            if (Array.isArray(res.data)) {
                // Filtramos aquellos cuyo usuario esté inactivo/eliminado (usuario === null)
                const validos = res.data.filter(c => c.usuario !== null);
                setCuidadores(validos);
            } else {
                setCuidadores([]);
            }
        } catch (error) {
            toast.error('Error al cargar la lista de cuidadores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCuidadores();
    }, []);

    return (
        <div>
            {/* Encabezado */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary mb-1">🧑‍⚕️ Cuidadores Disponibles</h1>
                <p className="text-sm text-secondary/60">
                    Encuentra el cuidador perfecto para tu mascota. Explora sus perfiles y tarifas.
                </p>
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <p className="text-4xl animate-spin">⏳</p>
                    <p className="text-secondary/50 animate-pulse text-sm">Cargando cuidadores...</p>
                </div>
            ) : cuidadores.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-secondary/10 shadow-sm">
                    <p className="text-6xl mb-4">🧑‍⚕️</p>
                    <h3 className="text-lg font-bold text-secondary mb-2">No hay cuidadores disponibles</h3>
                    <p className="text-secondary/50 text-sm">En este momento no contamos con cuidadores registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                    {cuidadores.map(c => (
                        <TarjetaCuidador key={c._id} cuidador={c} onVerResenas={setModalResenas} />
                    ))}
                </div>
            )}

            {modalResenas && (
                <ModalResenas
                    cuidadorId={modalResenas.usuario?._id}
                    nombre={modalResenas.usuario?.nombre}
                    apellido={modalResenas.usuario?.apellido}
                    onClose={() => setModalResenas(null)}
                />
            )}
        </div>
    );
};

export default ListarCuidadores;
