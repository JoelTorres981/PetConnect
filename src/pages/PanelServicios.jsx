import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
    FaCalendarAlt, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes,
    FaClock, FaCoins, FaUser, FaDog, FaClipboardList, FaHandshake,
    FaSearch, FaInfoCircle, FaPhone, FaEnvelope, FaSpinner, FaStar
} from 'react-icons/fa'
import { getAuthHeaders } from '../helpers/authHeaders'
import { Modal } from '../components/Modal'
import { ModalResenas } from '../components/ModalResenas'
import { ClockTimePicker } from '../components/ClockTimePicker'
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../helpers/formStyles'
import storeProfile from '../context/storeProfile'
import { LoadingScreen } from '../components/LoadingScreen'
import { useConfirm } from '../context/ConfirmContext'

const API = import.meta.env.VITE_BACKEND_URL

const SERVICIOS_OPCIONES = ['PASEO', 'CUIDADO', 'ADIESTRAMIENTO', 'VETERINARIA', 'BAÑO', 'OTROS']
const SERVICIOS_ICONS = { PASEO: '🐕', CUIDADO: '🏠', ADIESTRAMIENTO: '🎓', VETERINARIA: '🩺', BAÑO: '🛁', OTROS: '✨' }

export const PanelServicios = () => {
    const confirm = useConfirm()
    const { user } = storeProfile()
    const location = useLocation()
    const [activeTab, setActiveTab] = useState('anuncios') // 'anuncios' o 'servicios'

    // Estados para Anuncios
    const [anuncios, setAnuncios] = useState([])
    const [loadingAnuncios, setLoadingAnuncios] = useState(true)
    const [filtroAnuncio, setFiltroAnuncio] = useState('ABIERTAS') // 'ABIERTAS', 'CERRADAS', 'TODAS'
    const [modalCrear, setModalCrear] = useState(false)
    const [modalEditar, setModalEditar] = useState(null)
    const [modalPostulaciones, setModalPostulaciones] = useState(null)
    const [postulaciones, setPostulaciones] = useState([])
    const [loadingPostulaciones, setLoadingPostulaciones] = useState(false)

    // Estados para Ver Detalles del Cuidador Postulado
    const [cuidadoresList, setCuidadoresList] = useState([])
    const [modalDetalleCuidador, setModalDetalleCuidador] = useState(null)


    // Estados para Servicios
    const [servicios, setServicios] = useState([])
    const [loadingServicios, setLoadingServicios] = useState(true)
    const [filtroServicio, setFiltroServicio] = useState('PENDIENTE')
    const [modalCalificar, setModalCalificar] = useState(null)
    const [calificacion, setCalificacion] = useState(5)
    const [comentario, setComentario] = useState('')
    const [enviandoResena, setEnviandoResena] = useState(false)
    const [serviciosResenados, setServiciosResenados] = useState([])
    const [modalResenas, setModalResenas] = useState(null)

    // Mascotas del dueño
    const [mascotas, setMascotas] = useState([])

    // Cargar Mascotas
    const cargarMascotas = async () => {
        try {
            const res = await axios.get(`${API}/mascotas/listar`, getAuthHeaders())
            // Solo mascotas activas
            setMascotas((res.data || []).filter(m => m.estado))
        } catch (error) {
            console.error('Error al cargar mascotas:', error)
        }
    }

    // Cargar Anuncios (y filtrar por el dueño actual)
    const cargarAnuncios = async () => {
        setLoadingAnuncios(true)
        try {
            const res = await axios.get(`${API}/anuncios/listar`, getAuthHeaders())
            if (Array.isArray(res.data)) {
                // Filtrar anuncios que pertenezcan a este dueño
                const filtrados = res.data.filter(a => {
                    const duenoId = a.dueno_id?._id || a.dueno_id
                    return duenoId === user?._id
                })
                setAnuncios(filtrados)
            }
        } catch (error) {
            toast.error('Error al cargar tus solicitudes de servicio')
        } finally {
            setLoadingAnuncios(false)
        }
    }

    // Cargar cuáles servicios ya fueron reseñados
    const checkServiciosResenados = async (servsList) => {
        if (!servsList || servsList.length === 0) return
        const finalizados = servsList.filter(s => s.estado === 'FINALIZADO')
        if (finalizados.length === 0) return

        const cuidadoresIds = [...new Set(finalizados.map(s => s.cuidador_id?._id || s.cuidador_id))]

        const resenadosList = []
        for (const cId of cuidadoresIds) {
            try {
                const res = await axios.get(`${API}/resenas/${cId}`, getAuthHeaders())
                if (res.data?.resenas) {
                    res.data.resenas.forEach(r => {
                        const rServId = r.servicio_id?._id || r.servicio_id
                        const rDuenoId = r.dueno_id?._id || r.dueno_id
                        if (rDuenoId === user?._id) {
                            resenadosList.push(rServId)
                        }
                    })
                }
            } catch (error) {
                console.error("Error al verificar reseñas del cuidador:", cId, error)
            }
        }
        setServiciosResenados(resenadosList)
    }

    // Cargar Servicios
    const cargarServicios = async () => {
        setLoadingServicios(true)
        try {
            const res = await axios.get(`${API}/servicios/listar`, getAuthHeaders())
            let list = []
            if (res.data?.servicios) {
                list = res.data.servicios
            } else if (Array.isArray(res.data)) {
                list = res.data
            }
            setServicios(list)
            if (user?._id) {
                checkServiciosResenados(list)
            }
        } catch (error) {
            toast.error('Error al cargar tus servicios contratados')
        } finally {
            setLoadingServicios(false)
        }
    }

    // Cargar postulaciones para un anuncio
    const cargarPostulaciones = async (anuncioId) => {
        setLoadingPostulaciones(true)
        try {
            const res = await axios.get(`${API}/postulaciones/listar/${anuncioId}`, getAuthHeaders())
            setPostulaciones(res.data || [])
        } catch (error) {
            toast.error('Error al cargar las postulaciones')
        } finally {
            setLoadingPostulaciones(false)
        }
    }

    // Cargar Cuidadores
    const cargarCuidadores = async () => {
        try {
            const res = await axios.get(`${API}/cuidadores/listar-cuidadores`, getAuthHeaders())
            if (Array.isArray(res.data)) {
                setCuidadoresList(res.data)
            }
        } catch (error) {
            console.error('Error al cargar cuidadores:', error)
        }
    }

    // Inicialización
    useEffect(() => {
        if (user?._id) {
            cargarMascotas()
            cargarAnuncios()
            cargarServicios()
            cargarCuidadores()
        }
    }, [user?._id])

    // Redirección y enfoque desde notificaciones
    useEffect(() => {
        if (location.state) {
            const { tab, estado } = location.state
            if (tab) {
                setActiveTab(tab)
            }
            if (estado) {
                setFiltroServicio(estado)
            }
            // Limpiar estado
            window.history.replaceState({}, document.title)
        }
    }, [location])


    // Manejar eliminación de anuncio
    const eliminarAnuncio = async (id) => {
        const ok = await confirm({
            title: '🗑️ Cancelar Solicitud de Cuidado',
            message: '¿Seguro que deseas cancelar y eliminar esta solicitud de servicio? Esta acción quitará el anuncio de la lista de búsquedas.',
            confirmLabel: 'Eliminar Solicitud',
            cancelLabel: 'Volver',
            variant: 'danger'
        })
        if (!ok) return
        try {
            await axios.delete(`${API}/anuncios/eliminar/${id}`, getAuthHeaders())
            toast.success('Solicitud de servicio eliminada correctamente')
            cargarAnuncios()
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al eliminar la solicitud')
        }
    }

    // Manejar cancelación de servicio
    const cancelarServicio = async (id) => {
        const ok = await confirm({
            title: '⚠️ Cancelar Contrato de Servicio',
            message: '¿Seguro que deseas cancelar este servicio contratado? Se le notificará inmediatamente al cuidador asignado sobre esta acción.',
            confirmLabel: 'Cancelar Servicio',
            cancelLabel: 'Volver',
            variant: 'danger'
        })
        if (!ok) return
        try {
            await axios.patch(`${API}/servicios/actualizar-servicio/${id}`, { estado: 'CANCELADO' }, getAuthHeaders())
            toast.success('Servicio contratado cancelado con éxito')
            cargarServicios()
            cargarAnuncios() // Recargar anuncios ya que puede haberse reabierto o cambiado el estado
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al cancelar el servicio')
        }
    }

    // Enviar reseña/calificación del servicio
    const handleEnviarResena = async (e) => {
        e.preventDefault()
        const comentarioLimpio = comentario.trim()
        if (comentarioLimpio.length < 10) {
            toast.warning('El comentario debe tener al menos 10 caracteres')
            return
        }
        if (comentarioLimpio.length > 300) {
            toast.warning('El comentario no puede superar los 300 caracteres')
            return
        }
        setEnviandoResena(true)
        try {
            const res = await axios.post(`${API}/resenas/crear/${modalCalificar._id}`, {
                calificacion,
                comentario: comentarioLimpio
            }, getAuthHeaders())
            toast.success(res.data?.msg || 'Reseña registrada con éxito')
            setServiciosResenados(prev => [...prev, modalCalificar._id])
            setModalCalificar(null)
            setComentario('')
            setCalificacion(5)
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al registrar la reseña')
        } finally {
            setEnviandoResena(false)
        }
    }



    // Aceptar postulación
    const aceptarPostulacion = async (postulacionId) => {
        const ok = await confirm({
            title: '💡 Contratar Cuidador',
            message: '¿Seguro que deseas aceptar a este cuidador? Esto generará un contrato de servicio formal, cerrará la solicitud y dará de baja a los demás postulantes.',
            confirmLabel: 'Aceptar y Contratar',
            cancelLabel: 'Cancelar',
            variant: 'primary'
        })
        if (!ok) return
        try {
            await axios.patch(`${API}/postulaciones/aceptar-postulacion/${postulacionId}`, {}, getAuthHeaders())
            toast.success('¡Postulación aceptada! Servicio contratado con éxito.')
            setModalPostulaciones(null)
            cargarAnuncios()
            cargarServicios()
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al aceptar la postulación')
        }
    }

    // Formatear Fecha
    const formatearFecha = (fechaString) => {
        if (!fechaString) return ''
        const f = new Date(fechaString)
        return f.toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Emojis de Servicios
    const renderServiciosList = (servs) => {
        return (
            <div className="flex flex-wrap gap-1.5 mt-2">
                {servs.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {SERVICIOS_ICONS[s] || '✨'} {s}
                    </span>
                ))}
            </div>
        )
    }

    // Filtrar servicios
    const serviciosFiltrados = servicios.filter(s => {
        if (filtroServicio === 'TODOS') return true
        return s.estado === filtroServicio
    })

    // Filtrar y ordenar anuncios (solicitudes)
    const anunciosFiltrados = anuncios.filter(a => {
        if (filtroAnuncio === 'ABIERTAS') return a.estado === 'ABIERTO'
        if (filtroAnuncio === 'CERRADAS') return a.estado !== 'ABIERTO'
        return true
    }).sort((a, b) => {
        // Mostrar ABIERTO primero
        if (a.estado === 'ABIERTO' && b.estado !== 'ABIERTO') return -1
        if (a.estado !== 'ABIERTO' && b.estado === 'ABIERTO') return 1
        return 0
    })

    return (
        <div className="max-w-6xl mx-auto space-y-6 mt-2 pb-10">
            {/* Cabecera Principal */}
            <div className="bg-gradient-to-r from-primary to-primary-hover rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                            <FaClipboardList className="text-3xl text-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold font-jaldi tracking-wide">Panel de Servicios</h1>
                            <p className="mt-1 opacity-90 text-sm">Gestiona tus solicitudes de cuidado y revisa tus servicios contratados.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (mascotas.length === 0) {
                                toast.warning('Primero debes registrar al menos una mascota activa en la sección "Mis Mascotas"')
                                return
                            }
                            setModalCrear(true)
                        }}
                        className="bg-white text-primary hover:bg-base text-sm font-bold px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 self-start sm:self-center"
                    >
                        <FaPlus /> Nueva Solicitud
                    </button>
                </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-secondary/10 shadow-sm">
                <button
                    onClick={() => setActiveTab('anuncios')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'anuncios'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-secondary/60 hover:text-secondary hover:bg-secondary/5'
                        }`}
                >
                    <FaClipboardList /> Mis Solicitudes (Anuncios)
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'anuncios' ? 'bg-white text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {anuncios.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('servicios')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'servicios'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-secondary/60 hover:text-secondary hover:bg-secondary/5'
                        }`}
                >
                    <FaHandshake /> Servicios Contratados
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'servicios' ? 'bg-white text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {servicios.length}
                    </span>
                </button>
            </div>

            {/* CONTENIDO PESTAÑA: ANUNCIOS */}
            {activeTab === 'anuncios' && (
                <div className="space-y-4">
                    {/* Filtros de Estado para Solicitudes */}
                    {!loadingAnuncios && anuncios.length > 0 && (
                        <div className="flex flex-wrap gap-2 pb-2">
                            {['ABIERTAS', 'CERRADAS', 'TODAS'].map(est => (
                                <button
                                    key={est}
                                    onClick={() => setFiltroAnuncio(est)}
                                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${filtroAnuncio === est
                                            ? 'bg-secondary text-white border-secondary shadow-sm'
                                            : 'bg-white border-secondary/15 text-secondary/60 hover:border-secondary/40 hover:text-secondary'
                                        }`}
                                >
                                    {est === 'ABIERTAS' ? 'Abiertas' : est === 'CERRADAS' ? 'Cerradas' : 'Todas'}
                                </button>
                            ))}
                        </div>
                    )}

                    {loadingAnuncios ? (
                        <LoadingScreen message="Cargando tus solicitudes..." />
                    ) : anuncios.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-secondary/10 shadow-sm">
                            <p className="text-6xl mb-4">🛎️</p>
                            <h3 className="text-lg font-bold text-secondary mb-1">No tienes solicitudes publicadas</h3>
                            <p className="text-secondary/50 text-sm mb-6">Crea una solicitud para que los cuidadores de la comunidad puedan postularse.</p>
                            <button
                                onClick={() => {
                                    if (mascotas.length === 0) {
                                        toast.warning('Primero debes registrar una mascota activa')
                                        return
                                    }
                                    setModalCrear(true)
                                }}
                                className={btnPrimary}
                            >
                                + Crear Nueva Solicitud
                            </button>
                        </div>
                    ) : anunciosFiltrados.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-secondary/10 shadow-sm">
                            <p className="text-6xl mb-4">🔍</p>
                            <h3 className="text-lg font-bold text-secondary mb-1">Sin solicitudes</h3>
                            <p className="text-secondary/50 text-sm">
                                No tienes solicitudes en estado {filtroAnuncio.toLowerCase()}.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {anunciosFiltrados.map(anuncio => {
                                const tieneCuidador = !!anuncio.cuidador_seleccionado
                                const esAbierto = anuncio.estado === 'ABIERTO'

                                return (
                                    <div key={anuncio._id} className="bg-white rounded-3xl border border-secondary/10 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden">

                                        {/* Estado del anuncio */}
                                        <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-transparent to-transparent" />

                                        <div>
                                            <div className="flex justify-between items-start gap-2 mb-3">
                                                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${esAbierto ? 'bg-green-100 text-green-700' : 'bg-secondary/10 text-secondary/60'
                                                    }`}>
                                                    {anuncio.estado}
                                                </span>
                                                <div className="text-xs text-secondary/40 font-bold flex items-center gap-1">
                                                    <FaCalendarAlt /> Creado el {new Date(anuncio.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Fechas Solicitadas */}
                                            <div className="bg-base rounded-2xl p-3 border border-secondary/5 mb-4 text-xs space-y-1">
                                                <p className="text-secondary/50 font-bold">HORARIO SOLICITADO:</p>
                                                <p className="text-secondary font-bold">
                                                    📅 <span className="text-primary font-black">Inicio:</span> {formatearFecha(anuncio.horario?.fecha_inicio)}
                                                </p>
                                                <p className="text-secondary font-bold">
                                                    📅 <span className="text-primary font-black">Fin:</span> {formatearFecha(anuncio.horario?.fecha_fin)}
                                                </p>
                                            </div>

                                            {/* Descripción */}
                                            <h4 className="font-bold text-secondary text-sm mb-1 uppercase tracking-wide">Descripción:</h4>
                                            <p className="text-secondary/70 text-sm bg-base/50 p-3 rounded-2xl border border-secondary/5 mb-4 italic leading-relaxed">
                                                "{anuncio.descripcion}"
                                            </p>

                                            {/* Servicios Solicitados */}
                                            <h4 className="font-bold text-secondary text-sm mb-1 uppercase tracking-wide">Servicios:</h4>
                                            {renderServiciosList(anuncio.servicios || [])}

                                            {/* Mascotas */}
                                            <h4 className="font-bold text-secondary text-sm mt-4 mb-2 uppercase tracking-wide">Mascotas en el servicio:</h4>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {anuncio.mascotas?.map(pet => (
                                                    <div key={pet._id} className="flex items-center gap-2 bg-base px-3 py-1.5 rounded-full border border-secondary/10 shadow-xs">
                                                        <span className="text-sm">
                                                            {pet.tipo === 'PERRO' ? '🐕' : pet.tipo === 'GATO' ? '🐈' : '🐾'}
                                                        </span>
                                                        <span className="text-xs font-bold text-secondary">{pet.nombre}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="border-t border-secondary/10 pt-4 mt-4 flex flex-wrap gap-2">
                                            {esAbierto ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setModalPostulaciones(anuncio._id)
                                                            cargarPostulaciones(anuncio._id)
                                                        }}
                                                        className="flex-1 min-w-[130px] bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-primary-hover shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5"
                                                    >
                                                        👥 Postulaciones
                                                    </button>
                                                    <button
                                                        onClick={() => setModalEditar(anuncio)}
                                                        className="py-2.5 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1"
                                                        title="Editar Solicitud"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarAnuncio(anuncio._id)}
                                                        className="py-2.5 px-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1"
                                                        title="Eliminar Solicitud"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-2xl border border-secondary/5">
                                                    <span className="text-secondary/50 font-bold">Cerrado por contratación</span>
                                                    <span className="text-primary font-bold flex items-center gap-1">
                                                        🤝 Cuidador Asignado
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO PESTAÑA: SERVICIOS */}
            {activeTab === 'servicios' && (
                <div className="space-y-4">
                    {/* Filtros de Estado */}
                    <div className="flex flex-wrap gap-2 pb-2">
                        {['TODOS', 'PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO'].map(est => (
                            <button
                                key={est}
                                onClick={() => setFiltroServicio(est)}
                                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${filtroServicio === est
                                        ? 'bg-secondary text-white border-secondary shadow-sm'
                                        : 'bg-white border-secondary/15 text-secondary/60 hover:border-secondary/40 hover:text-secondary'
                                    }`}
                            >
                                {est === 'TODOS' ? 'Todos' : est.charAt(0) + est.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {loadingServicios ? (
                        <LoadingScreen message="Cargando tus servicios contratados..." />
                    ) : serviciosFiltrados.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-secondary/10 shadow-sm">
                            <p className="text-6xl mb-4">🤝</p>
                            <h3 className="text-lg font-bold text-secondary mb-1">Sin servicios contratados</h3>
                            <p className="text-secondary/50 text-sm">
                                {filtroServicio === 'TODOS'
                                    ? 'Acepta una postulación en tus solicitudes para contratar un cuidador.'
                                    : `No tienes servicios en estado ${filtroServicio.toLowerCase()}.`}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {serviciosFiltrados.map(serv => {
                                const isPending = serv.estado === 'PENDIENTE'
                                const isActivo = serv.estado === 'ACTIVO'
                                const isFinalizado = serv.estado === 'FINALIZADO'
                                const isCancelado = serv.estado === 'CANCELADO'

                                return (
                                    <div key={serv._id} className="bg-white rounded-3xl border border-secondary/10 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">

                                        <div>
                                            {/* Cabecera Tarjeta Servicio */}
                                            <div className="flex justify-between items-start gap-2 mb-4">
                                                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${isPending ? 'bg-yellow-100 text-yellow-700' :
                                                        isActivo ? 'bg-green-100 text-green-700' :
                                                            isFinalizado ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'
                                                     }`}>
                                                    {serv.estado}
                                                </span>
                                            </div>

                                            {/* Info Cuidador */}
                                            <div className="flex items-center gap-3 bg-base p-3 rounded-2xl border border-secondary/5 mb-4">
                                                <img
                                                    src={serv.cuidador_id?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                                                    alt="cuidador"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                                                />
                                                <div>
                                                    <p className="text-xs font-extrabold text-secondary/50 uppercase tracking-wider">CUIDADOR CONTRATADO:</p>
                                                    <h4 className="font-bold text-secondary text-sm">
                                                        {serv.cuidador_id?.nombre} {serv.cuidador_id?.apellido}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-[11px] text-secondary/60 mt-1">
                                                        {serv.cuidador_id?.telefono && (
                                                            <span className="flex items-center gap-0.5">
                                                                <FaPhone className="text-[10px] text-primary" /> {serv.cuidador_id?.telefono}
                                                            </span>
                                                        )}
                                                        {serv.cuidador_id?.email && (
                                                            <span className="flex items-center gap-0.5">
                                                                <FaEnvelope className="text-[10px] text-primary animate-pulse" /> {serv.cuidador_id?.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fechas de Servicio */}
                                            <div className="bg-base/60 rounded-2xl p-3 border border-secondary/5 mb-4 text-xs space-y-1">
                                                <p className="text-secondary/50 font-bold">HORARIO DEL CONTRATO:</p>
                                                <p className="text-secondary font-bold">
                                                    📅 <span className="text-primary font-black">Desde:</span> {formatearFecha(serv.horario?.fecha_inicio)}
                                                </p>
                                                <p className="text-secondary font-bold">
                                                    📅 <span className="text-primary font-black">Hasta:</span> {formatearFecha(serv.horario?.fecha_fin)}
                                                </p>
                                            </div>

                                            {/* Servicios Requeridos */}
                                            <h4 className="font-bold text-secondary text-xs mb-1 uppercase tracking-wide">Servicios contratados:</h4>
                                            {renderServiciosList(serv.servicios || [])}

                                            {/* Mascotas Requeridas */}
                                            <h4 className="font-bold text-secondary text-xs mt-4 mb-2 uppercase tracking-wide">Mascotas atendidas:</h4>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {serv.mascotas?.map(pet => (
                                                    <div key={pet._id} className="flex items-center gap-2 bg-base px-3 py-1 rounded-full border border-secondary/5">
                                                        <span className="text-xs">
                                                            {pet.tipo === 'PERRO' ? '🐕' : pet.tipo === 'GATO' ? '🐈' : '🐾'}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-secondary">{pet.nombre}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Info Financiera y Acción */}
                                        <div className="border-t border-secondary/10 pt-4 mt-4 flex items-center justify-between gap-4">
                                            <div className="text-xs">
                                                <p className="text-secondary/50 font-bold">COSTO TOTAL:</p>
                                                <p className="text-secondary font-black text-lg flex items-center gap-1.5">
                                                    <span className="text-green-600 font-extrabold">${serv.total}</span>
                                                    <span className="text-[10px] text-secondary/40 font-normal">
                                                        (${serv.tarifa_por_hora}/h · {serv.horas?.toFixed(1)}h)
                                                    </span>
                                                </p>
                                            </div>

                                            {isPending && (
                                                <button
                                                    onClick={() => cancelarServicio(serv._id)}
                                                    className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all duration-300 flex items-center gap-1"
                                                >
                                                    ✕ Cancelar
                                                </button>
                                            )}

                                            {isFinalizado && (
                                                serviciosResenados.includes(serv._id) ? (
                                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 py-2.5 px-4 bg-green-50 rounded-xl">
                                                        ✓ Calificado
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setModalCalificar(serv)
                                                            setCalificacion(5)
                                                            setComentario('')
                                                        }}
                                                        className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center gap-1"
                                                    >
                                                        ⭐ Calificar
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL CREAR ANUNCIO */}
            {modalCrear && (
                <ModalFormAnuncio
                    mascotas={mascotas}
                    onClose={() => setModalCrear(false)}
                    onSuccess={() => {
                        setModalCrear(false)
                        cargarAnuncios()
                    }}
                />
            )}

            {/* MODAL EDITAR ANUNCIO */}
            {modalEditar && (
                <ModalFormAnuncio
                    mascotas={mascotas}
                    anuncio={modalEditar}
                    onClose={() => setModalEditar(null)}
                    onSuccess={() => {
                        setModalEditar(null)
                        cargarAnuncios()
                    }}
                />
            )}

            {/* MODAL VER POSTULACIONES */}
            {modalPostulaciones && (
                <Modal title="Postulaciones Recibidas" onClose={() => setModalPostulaciones(null)}>
                    {loadingPostulaciones ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <FaSpinner className="text-3xl text-primary animate-spin" />
                            <p className="text-xs text-secondary/50">Cargando postulantes...</p>
                        </div>
                    ) : postulaciones.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-4xl mb-2">👤</p>
                            <p className="text-secondary font-bold text-sm">Ningún cuidador se ha postulado todavía.</p>
                            <p className="text-xs text-secondary/50 mt-1">Espera un poco o revisa si tu descripción y servicios son claros.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            <p className="text-xs text-secondary/50 font-bold uppercase tracking-wider mb-2">
                                {postulaciones.length} CUIDADORES INTERESADOS:
                            </p>
                            {postulaciones.map(post => (
                                <div key={post._id} className="border border-secondary/15 rounded-2xl p-4 bg-white hover:border-primary/30 transition-all flex flex-col justify-between gap-3 shadow-xs">
                                    <div className="flex items-start gap-3">
                                        <img
                                            src={post.cuidador_id?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                                            alt="avatar"
                                            className="w-12 h-12 rounded-full object-cover border"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-secondary text-sm">
                                                {post.cuidador_id?.nombre} {post.cuidador_id?.apellido}
                                            </h4>
                                            <p className="text-xs font-black text-green-600 mt-0.5">
                                                Tarifa: ${post.tarifa_por_hora} / hora
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-1 pt-2 border-t border-secondary/5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const cPerfil = cuidadoresList.find(c => {
                                                    const cUserId = c.usuario?._id || c.usuario
                                                    return cUserId === post.cuidador_id?._id
                                                })
                                                setModalDetalleCuidador({
                                                    ...cPerfil,
                                                    userDetails: post.cuidador_id,
                                                    tarifaPostulacion: post.tarifa_por_hora
                                                })
                                            }}
                                            className="bg-secondary/10 hover:bg-secondary hover:text-white text-secondary text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-1"
                                        >
                                            🔎 Ver Perfil
                                        </button>
                                        <button
                                            onClick={() => aceptarPostulacion(post._id)}
                                            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1"
                                        >
                                            <FaCheck /> Aceptar Cuidador
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            )}

            {/* MODAL DETALLES DEL CUIDADOR */}
            {modalDetalleCuidador && (
                <Modal 
                    title={`Perfil de ${modalDetalleCuidador.userDetails?.nombre || 'Cuidador'} ${modalDetalleCuidador.userDetails?.apellido || ''}`}
                    onClose={() => setModalDetalleCuidador(null)}
                >
                    <div className="space-y-5 text-left max-h-[70vh] overflow-y-auto pr-2">
                        {/* Portada / Banner si existe */}
                        {modalDetalleCuidador.portada_url && (
                            <img
                                src={modalDetalleCuidador.portada_url}
                                alt="portada"
                                className="w-full h-32 object-cover rounded-2xl border"
                            />
                        )}

                        {/* Encabezado Cuidador */}
                        <div className="flex items-center gap-4 bg-base p-4 rounded-2xl border border-secondary/5">
                            <img
                                src={modalDetalleCuidador.userDetails?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                                alt="avatar"
                                className="w-16 h-16 rounded-full object-cover border-2 border-primary bg-white"
                            />
                            <div>
                                <h3 className="text-base font-black text-secondary">
                                    {modalDetalleCuidador.userDetails?.nombre} {modalDetalleCuidador.userDetails?.apellido}
                                </h3>
                                <p className="text-xs text-secondary/50 font-semibold mt-1">📧 {modalDetalleCuidador.userDetails?.email}</p>
                                {modalDetalleCuidador.userDetails?.telefono && (
                                    <p className="text-xs text-secondary/50 font-semibold mt-0.5">📞 {modalDetalleCuidador.userDetails?.telefono}</p>
                                )}
                            </div>
                        </div>

                        {/* Comparación Tarifas */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 border border-green-200 p-3.5 rounded-2xl text-center">
                                <span className="text-[10px] text-green-700 font-black uppercase">Tarifa Postulada:</span>
                                <p className="text-xl font-black text-green-600 mt-1">${modalDetalleCuidador.tarifaPostulacion} / h</p>
                            </div>
                            <div className="bg-base border border-secondary/10 p-3.5 rounded-2xl text-center">
                                <span className="text-[10px] text-secondary/40 font-bold uppercase">Tarifa Base Estándar:</span>
                                <p className="text-xl font-bold text-secondary/70 mt-1">${modalDetalleCuidador.tarifa_hora || 0} / h</p>
                            </div>
                        </div>

                        {/* Biografía */}
                        <div>
                            <h4 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-1">Sobre el Cuidador (Biografía):</h4>
                            <p className="text-secondary/80 text-xs bg-base p-3.5 rounded-2xl border border-secondary/5 italic leading-relaxed whitespace-pre-line">
                                "{modalDetalleCuidador.biografia || 'Sin biografía disponible.'}"
                            </p>
                        </div>

                        {/* Servicios Ofrecidos */}
                        <div>
                            <h4 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-1.5">Servicios que Ofrece:</h4>
                            {Array.isArray(modalDetalleCuidador.servicios_ofrecidos) && modalDetalleCuidador.servicios_ofrecidos.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {modalDetalleCuidador.servicios_ofrecidos.map(s => (
                                        <span key={s} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                            {SERVICIOS_ICONS[s] || '✨'} {s}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-secondary/40 italic">No especificado</p>
                            )}
                        </div>



                        {/* Botón de cierre */}
                        <div className="flex justify-between items-center pt-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setModalResenas(modalDetalleCuidador.userDetails)}
                                className="bg-secondary/15 hover:bg-secondary hover:text-white text-secondary font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1"
                            >
                                ⭐ Ver Reseñas
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalDetalleCuidador(null)}
                                className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {modalCalificar && (
                <Modal
                    title={`Calificar Servicio de ${modalCalificar.cuidador_id?.nombre || 'Cuidador'} ${modalCalificar.cuidador_id?.apellido || ''}`}
                    onClose={() => setModalCalificar(null)}
                >
                    <form onSubmit={handleEnviarResena} className="space-y-5 text-left">
                        {/* Selector de Estrellas */}
                        <div className="text-center space-y-2">
                            <label className="text-sm font-extrabold text-secondary/60 uppercase tracking-wider block">
                                ¿Cómo calificarías el servicio?
                            </label>
                            <div className="flex gap-2 justify-center my-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setCalificacion(star)}
                                        className="text-4xl focus:outline-none transition-transform active:scale-95 duration-200"
                                    >
                                        <FaStar
                                            className={
                                                star <= calificacion
                                                    ? 'text-yellow-400 drop-shadow-sm'
                                                    : 'text-secondary/20'
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {calificacion} {calificacion === 1 ? 'Estrella' : 'Estrellas'}
                            </span>
                        </div>

                        {/* Comentario */}
                        <div className="space-y-1">
                            <label className={labelCls}>Comentario / Opinión *</label>
                            <textarea
                                className={inputCls + ' resize-none'}
                                placeholder="Describe tu experiencia con el cuidador (mínimo 10 caracteres)..."
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                maxLength={300}
                                rows={4}
                                required
                            />
                            <p className="text-right text-xs text-secondary/40">
                                {comentario.trim().length} / 300 (mínimo 10 caracteres)
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-3 pt-3 border-t border-secondary/10">
                            <button
                                type="button"
                                onClick={() => setModalCalificar(null)}
                                className={btnCancel + ' flex-1'}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={enviandoResena}
                                className={btnPrimary + ' flex-1 shadow-md'}
                            >
                                {enviandoResena ? 'Enviando...' : 'Guardar Calificación'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {modalResenas && (
                <ModalResenas
                    cuidadorId={modalResenas._id}
                    nombre={modalResenas.nombre}
                    apellido={modalResenas.apellido}
                    onClose={() => setModalResenas(null)}
                />
            )}
        </div>
    )
}

// ── Modal de Formulario para Anuncios ──────────────────────────────
const ModalFormAnuncio = ({ mascotas, anuncio, onClose, onSuccess }) => {
    const isEdit = !!anuncio

    // Helpers to format dates and times
    const formatToInputDateOnly = (isoString) => {
        if (!isoString) return ''
        const d = new Date(isoString)
        if (isNaN(d.getTime())) return ''
        const offset = d.getTimezoneOffset()
        const localTime = new Date(d.getTime() - (offset * 60 * 1000))
        return localTime.toISOString().slice(0, 10) // YYYY-MM-DD
    }

    const formatToInputTime = (isoString) => {
        if (!isoString) return '08:00'
        const d = new Date(isoString)
        if (isNaN(d.getTime())) return '08:00'
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
    }

    const formatToDisplayTime = (time24) => {
        if (!time24) return '12:00 AM'
        const [hStr, mStr] = time24.split(':')
        const h = parseInt(hStr, 10)
        const isPm = h >= 12
        let displayHour = h % 12
        if (displayHour === 0) displayHour = 12
        const formattedHour = String(displayHour).padStart(2, '0')
        const formattedMinute = mStr.padStart(2, '0')
        return `${formattedHour}:${formattedMinute} ${isPm ? 'PM' : 'AM'}`
    }

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            descripcion: anuncio?.descripcion || '',
            fecha_inicio_date: formatToInputDateOnly(anuncio?.horario?.fecha_inicio),
            fecha_fin_date: formatToInputDateOnly(anuncio?.horario?.fecha_fin)
        }
    })

    const [petsSel, setPetsSel] = useState(anuncio?.mascotas?.map(m => m._id || m) || [])
    const [servsSel, setServsSel] = useState(anuncio?.servicios || [])

    // Time states and picker state
    const [timeInicio, setTimeInicio] = useState(anuncio?.horario?.fecha_inicio ? formatToInputTime(anuncio.horario.fecha_inicio) : '08:00')
    const [timeFin, setTimeFin] = useState(anuncio?.horario?.fecha_fin ? formatToInputTime(anuncio.horario.fecha_fin) : '18:00')
    const [pickerOpen, setPickerOpen] = useState(null) // 'inicio' | 'fin' | null

    const togglePet = (id) => {
        setPetsSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const toggleServ = (s) => {
        setServsSel(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    }

    const onSubmit = async (data) => {
        if (petsSel.length === 0) {
            toast.error('Debes seleccionar al menos una mascota')
            return
        }
        if (servsSel.length === 0) {
            toast.error('Debes seleccionar al menos un servicio')
            return
        }

        // Combine date and time to construct full ISO strings
        const startDt = new Date(`${data.fecha_inicio_date}T${timeInicio}`)
        const endDt = new Date(`${data.fecha_fin_date}T${timeFin}`)

        if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
            toast.error('Las fechas y horas especificadas no son válidas')
            return
        }

        if (!isEdit && startDt < new Date()) {
            toast.error('La fecha y hora de inicio no puede estar en el pasado')
            return
        }

        if (endDt <= startDt) {
            toast.error('La fecha y hora de fin debe ser posterior a la de inicio')
            return
        }

        const payload = {
            mascotas: petsSel,
            servicios: servsSel,
            descripcion: data.descripcion,
            horario: {
                fecha_inicio: `${data.fecha_inicio_date}T${timeInicio}`,
                fecha_fin: `${data.fecha_fin_date}T${timeFin}`
            }
        }

        try {
            if (isEdit) {
                await axios.patch(`${API}/anuncios/actualizar/${anuncio._id}`, payload, getAuthHeaders())
                toast.success('Solicitud de servicio actualizada')
            } else {
                await axios.post(`${API}/anuncios/publicar`, payload, getAuthHeaders())
                toast.success('Solicitud de servicio publicada con éxito')
            }
            onSuccess()
        } catch (error) {
            toast.error(error?.response?.data?.msg || 'Error al procesar la solicitud')
        }
    }

    // Configurar fechas límites (Date only)
    const hoyLocal = new Date()
    const hoyDateOnlyFormatted = new Date(hoyLocal.getTime() - (hoyLocal.getTimezoneOffset() * 60 * 1000)).toISOString().slice(0, 10)

    return (
        <Modal title={isEdit ? 'Editar Solicitud de Servicio' : 'Nueva Solicitud de Servicio'} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">

                {/* Selección de Mascotas */}
                <div>
                    <label className={labelCls}>¿Para qué mascotas solicitas el servicio? *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {mascotas.map(pet => {
                            const selected = petsSel.includes(pet._id)
                            return (
                                <button
                                    key={pet._id}
                                    type="button"
                                    onClick={() => togglePet(pet._id)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${selected
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-base border-secondary/10 text-secondary/60 hover:border-primary/30'
                                        }`}
                                >
                                    <span className="text-base">
                                        {pet.tipo === 'PERRO' ? '🐕' : pet.tipo === 'GATO' ? '🐈' : '🐾'}
                                    </span>
                                    <span className="truncate">{pet.nombre}</span>
                                </button>
                            )
                        })}
                    </div>
                    {mascotas.length === 0 && (
                        <p className="text-xs text-error mt-1 font-bold">No tienes mascotas activas disponibles.</p>
                    )}
                </div>

                {/* Selección de Servicios */}
                <div>
                    <label className={labelCls}>Servicios requeridos *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                        {SERVICIOS_OPCIONES.map(serv => {
                            const selected = servsSel.includes(serv)
                            return (
                                <button
                                    key={serv}
                                    type="button"
                                    onClick={() => toggleServ(serv)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${selected
                                            ? 'bg-primary/10 border-primary text-primary shadow-xs'
                                            : 'bg-base border-secondary/10 text-secondary/60 hover:border-primary/30'
                                        }`}
                                >
                                    <span className="text-base">{SERVICIOS_ICONS[serv]}</span>
                                    <span>{serv.charAt(0) + serv.slice(1).toLowerCase()}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Rango de Horarios (Date & Circular Clock Time Picker) */}
                <div className="space-y-4 bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                    <h3 className="text-xs font-black text-secondary/50 uppercase tracking-wider">Fechas y Horas del Servicio</h3>
                    
                    {/* Inicio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Fecha de Inicio *</label>
                            <input
                                type="date"
                                className={`${inputCls} cursor-pointer`}
                                min={hoyDateOnlyFormatted}
                                onClick={(e) => e.target.showPicker()}
                                {...register('fecha_inicio_date', {
                                    required: 'La fecha de inicio es obligatoria'
                                })}
                            />
                            {errors.fecha_inicio_date && <p className={errCls}>{errors.fecha_inicio_date.message}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Hora de Inicio *</label>
                            <button
                                type="button"
                                onClick={() => setPickerOpen('inicio')}
                                className={`${inputCls} cursor-pointer flex items-center justify-between text-left h-[38px]`}
                            >
                                <span className="font-semibold text-secondary">{formatToDisplayTime(timeInicio)}</span>
                                <FaClock className="text-primary/60 text-xs" />
                            </button>
                        </div>
                    </div>

                    {/* Fin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Fecha Fin *</label>
                            <input
                                type="date"
                                className={`${inputCls} cursor-pointer`}
                                min={hoyDateOnlyFormatted}
                                onClick={(e) => e.target.showPicker()}
                                {...register('fecha_fin_date', {
                                    required: 'La fecha de fin es obligatoria'
                                })}
                            />
                            {errors.fecha_fin_date && <p className={errCls}>{errors.fecha_fin_date.message}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Hora Fin *</label>
                            <button
                                type="button"
                                onClick={() => setPickerOpen('fin')}
                                className={`${inputCls} cursor-pointer flex items-center justify-between text-left h-[38px]`}
                            >
                                <span className="font-semibold text-secondary">{formatToDisplayTime(timeFin)}</span>
                                <FaClock className="text-primary/60 text-xs" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className={labelCls}>Indicaciones / Descripción detallada *</label>
                    <textarea
                        rows={3}
                        className={inputCls + ' resize-none'}
                        placeholder="Ej: Necesito que paseen a Fido 2 horas y lo alimenten. Es un perro muy dócil..."
                        {...register('descripcion', {
                            required: 'La descripción es obligatoria',
                            minLength: { value: 10, message: 'Ingresa al menos 10 caracteres' }
                        })}
                    />
                    {errors.descripcion && <p className={errCls}>{errors.descripcion.message}</p>}
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4 border-t border-secondary/10">
                    <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1 shadow-md'}>
                        {isSubmitting ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Publicar Solicitud')}
                    </button>
                </div>
            </form>

            {/* Modal de Reloj Radial para Selección de Hora */}
            {pickerOpen && (
                <ClockTimePicker
                    initialTime={pickerOpen === 'inicio' ? timeInicio : timeFin}
                    onSave={(newTime) => {
                        if (pickerOpen === 'inicio') setTimeInicio(newTime)
                        else setTimeFin(newTime)
                        setPickerOpen(null)
                    }}
                    onClose={() => setPickerOpen(null)}
                />
            )}
        </Modal>
    )
}

export default PanelServicios
