import { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Link, useLocation } from 'react-router-dom'
import {
    FaCalendarAlt, FaCheck, FaTimes,
    FaClock, FaCoins, FaUser, FaDog, FaClipboardList, FaHandshake,
    FaSearch, FaInfoCircle, FaPhone, FaEnvelope, FaSpinner, FaPlay, FaStop, FaExclamationTriangle
} from 'react-icons/fa'
import { getAuthHeaders } from '../helpers/authHeaders'
import { Modal } from '../components/Modal'
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../helpers/formStyles'
import storeProfile from '../context/storeProfile'
import storeAuth from '../context/storeAuth'
import { LoadingScreen } from '../components/LoadingScreen'
import { useConfirm } from '../context/ConfirmContext'

const API = import.meta.env.VITE_BACKEND_URL

const SERVICIOS_OPCIONES = ['PASEO', 'CUIDADO', 'ADIESTRAMIENTO', 'VETERINARIA', 'BAÑO', 'OTROS']
const SERVICIOS_ICONS = { PASEO: '🐕', CUIDADO: '🏠', ADIESTRAMIENTO: '🎓', VETERINARIA: '🩺', BAÑO: '🛁', OTROS: '✨' }

export const PanelServiciosCuidador = () => {
    const confirm = useConfirm()
    const { user } = storeProfile()
    const { rol } = storeAuth()
    const location = useLocation()

    const [perfil, setPerfil] = useState(null)
    const [loadingPerfil, setLoadingPerfil] = useState(true)
    const [isComplete, setIsComplete] = useState(false)
    const [missingFields, setMissingFields] = useState([])

    // Pestaña activa ('disponibles' o 'asignados')
    const [activeTab, setActiveTab] = useState('disponibles')

    // Estados para Servicios Disponibles (Anuncios ABIERTO)
    const [anuncios, setAnuncios] = useState([])
    const [loadingAnuncios, setLoadingAnuncios] = useState(true)
    const [filtroCategoria, setFiltroCategoria] = useState('TODOS')
    const [busqueda, setBusqueda] = useState('')
    const [modalDetalleAnuncio, setModalDetalleAnuncio] = useState(null)
    const [tarifaPostulacion, setTarifaPostulacion] = useState('')
    const [postulando, setPostulando] = useState(false)

    // Lista de ids de anuncios a los que el cuidador ya se postuló
    const [postuladosIds, setPostuladosIds] = useState([])

    // Estados para Servicios Asignados (Contratos de Servicio)
    const [servicios, setServicios] = useState([])
    const [loadingServicios, setLoadingServicios] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState('PENDIENTE')

    // ── Cargar y Validar Perfil de Cuidador ─────────────────────────────────
    const cargarPerfilYValidar = async () => {
        setLoadingPerfil(true)
        try {
            const res = await axios.get(`${API}/cuidadores/listar-cuidadores`, getAuthHeaders())
            const lista = Array.isArray(res.data) ? res.data : []
            const miPerfil = lista.find(c => c.usuario?._id === user?._id || c.usuario === user?._id)

            if (miPerfil) {
                setPerfil(miPerfil)
                setTarifaPostulacion(miPerfil.tarifa_hora || '')

                // Validar completitud
                const missing = []
                if (!miPerfil.biografia || !miPerfil.biografia.trim()) {
                    missing.push('Biografía (cuéntanos sobre ti y tu experiencia)')
                }
                if (!(miPerfil.tarifa_hora > 0)) {
                    missing.push('Tarifa por hora configurada (mayor a 0)')
                }
                if (!miPerfil.servicios_ofrecidos || miPerfil.servicios_ofrecidos.length === 0) {
                    missing.push('Al menos un servicio ofrecido en la lista')
                }

                setMissingFields(missing)
                setIsComplete(missing.length === 0)
            } else {
                setMissingFields(['Crear y configurar tu perfil de cuidador por primera vez'])
                setIsComplete(false)
            }
        } catch (error) {
            console.error('Error al validar perfil de cuidador:', error)
            toast.error('Error al validar la información de tu perfil')
        } finally {
            setLoadingPerfil(false)
        }
    }

    // ── Cargar Anuncios Abiertos de Dueños ───────────────────────────────────
    const cargarAnunciosAbiertos = async () => {
        setLoadingAnuncios(true)
        try {
            const res = await axios.get(`${API}/anuncios/listar`, getAuthHeaders())
            if (Array.isArray(res.data)) {
                // Filtrar solo los abiertos
                const abiertos = res.data.filter(a => a.estado === 'ABIERTO')
                setAnuncios(abiertos)
            }
        } catch (error) {
            console.error('Error al cargar anuncios:', error)
            toast.error('Error al cargar servicios disponibles')
        } finally {
            setLoadingAnuncios(false)
        }
    }

    // ── Cargar Servicios Asignados ───────────────────────────────────────────
    const cargarServiciosAsignados = async () => {
        setLoadingServicios(true)
        try {
            const res = await axios.get(`${API}/servicios/listar`, getAuthHeaders())
            if (res.data?.servicios) {
                setServicios(res.data.servicios)
            } else if (Array.isArray(res.data)) {
                setServicios(res.data)
            } else {
                setServicios([])
            }
        } catch (error) {
            console.error('Error al cargar contratos:', error)
            toast.error('Error al cargar tus servicios contratados/asignados')
        } finally {
            setLoadingServicios(false)
        }
    }

    // Cargar postulaciones registradas en LocalStorage
    const cargarPostulacionesLocales = () => {
        if (!user?._id) return
        const key = `petconnect_postulaciones_${user._id}`
        try {
            const stored = localStorage.getItem(key)
            if (stored) {
                setPostuladosIds(JSON.parse(stored))
            }
        } catch (e) {
            console.error('Error parsing local storage:', e)
        }
    }

    // Guardar una postulación en LocalStorage
    const registrarPostulacionLocal = (anuncioId) => {
        if (!user?._id) return
        const key = `petconnect_postulaciones_${user._id}`
        try {
            const stored = localStorage.getItem(key)
            const current = stored ? JSON.parse(stored) : []
            if (!current.includes(anuncioId)) {
                const updated = [...current, anuncioId]
                localStorage.setItem(key, JSON.stringify(updated))
                setPostuladosIds(updated)
            }
        } catch (e) {
            console.error('Error setting local storage:', e)
        }
    }

    // Inicializar
    useEffect(() => {
        if (user?._id) {
            cargarPerfilYValidar()
            cargarPostulacionesLocales()
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
                setFiltroEstado(estado)
            }
            // Limpiar estado
            window.history.replaceState({}, document.title)
        }
    }, [location])

    // Cargar datos según la pestaña activa y si el perfil está completo
    useEffect(() => {
        if (isComplete && user?._id) {
            if (activeTab === 'disponibles') {
                cargarAnunciosAbiertos()
            } else if (activeTab === 'asignados') {
                cargarServiciosAsignados()
            }
        }
    }, [activeTab, isComplete, user?._id])

    // ── Enviar Postulación a un Anuncio ──────────────────────────────────────
    const postularseAAnuncio = async (anuncioId) => {
        const tarifaNum = Number(tarifaPostulacion)
        if (isNaN(tarifaNum) || tarifaNum <= 0) {
            toast.error('Por favor ingresa una tarifa válida mayor a $0.')
            return
        }
        if (tarifaNum > 15) {
            toast.error('La tarifa por hora no puede exceder los $15.')
            return
        }

        setPostulando(true)
        try {
            const res = await axios.post(
                `${API}/postulaciones/postular/${anuncioId}`,
                { tarifa_por_hora: tarifaNum },
                getAuthHeaders()
            )
            toast.success(res.data?.msg || '¡Te has postulado con éxito!')
            registrarPostulacionLocal(anuncioId)
            setModalDetalleAnuncio(null)
            cargarAnunciosAbiertos()
        } catch (error) {
            const errMsg = error?.response?.data?.msg || ''
            if (errMsg.includes('Ya te has postulado') || error?.response?.status === 400 && errMsg.includes('postulado')) {
                toast.warning('Ya te habías postulado a este anuncio. Sincronizando estado local...')
                registrarPostulacionLocal(anuncioId)
                setModalDetalleAnuncio(null)
                cargarAnunciosAbiertos()
            } else {
                toast.error(errMsg || 'Error al postularse al servicio')
            }
        } finally {
            setPostulando(false)
        }
    }

    // ── Cambiar Estado de un Servicio ────────────────────────────────────────
    const cambiarEstadoServicio = async (servicioId, nuevoEstado, label) => {
        const ok = await confirm({
            title: '❓ Actualizar Estado del Servicio',
            message: `¿Seguro que deseas cambiar el estado de este servicio a "${label}"?`,
            confirmLabel: 'Confirmar Cambio',
            cancelLabel: 'Volver',
            variant: 'warning'
        })
        if (!ok) return
        try {
            await axios.patch(
                `${API}/servicios/actualizar-servicio/${servicioId}`,
                { estado: nuevoEstado },
                getAuthHeaders()
            )
            toast.success(`Servicio actualizado a ${label} con éxito.`)
            cargarServiciosAsignados()
        } catch (error) {
            console.error('Error al actualizar servicio:', error)
            toast.error(error?.response?.data?.msg || 'Error al actualizar el estado del servicio')
        }
    }

    // Helpers de formateo
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

    const renderServiciosBadges = (servs) => {
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

    // Filtros de Anuncios Disponibles
    const anunciosFiltrados = anuncios.filter(anuncio => {
        const matchesCategoria = filtroCategoria === 'TODOS' || anuncio.servicios?.includes(filtroCategoria)

        const desc = anuncio.descripcion?.toLowerCase() || ''
        const duenoNombre = `${anuncio.dueno_id?.nombre || ''} ${anuncio.dueno_id?.apellido || ''}`.toLowerCase()
        const matchesBusqueda = desc.includes(busqueda.toLowerCase()) || duenoNombre.includes(busqueda.toLowerCase())

        return matchesCategoria && matchesBusqueda
    })

    // Filtros de Servicios Asignados
    const serviciosFiltrados = servicios.filter(s => {
        if (filtroEstado === 'TODOS') return true
        return s.estado === filtroEstado
    })

    // ── Guardias de Renderizado ──────────────────────────────────────────────
    if (rol !== 'CUIDADOR') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-secondary">
                <p className="text-6xl animate-bounce">🔒</p>
                <h2 className="text-xl font-bold">Acceso Restringido</h2>
                <p className="text-secondary/60 text-sm">Esta sección es exclusiva para usuarios con perfil de Cuidador.</p>
            </div>
        )
    }

    if (loadingPerfil) {
        return <LoadingScreen message="Cargando y validando perfil de cuidador..." />
    }

    // Perfil Incompleto - Glassmorphic Blocker Card
    if (!isComplete) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 mt-4 pb-10">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
                    <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
                    <div className="relative flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white">
                            <FaExclamationTriangle className="text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold font-jaldi tracking-wide">¡Información de Perfil Obligatoria!</h1>
                            <p className="mt-1 opacity-90 text-sm">Debes completar tu perfil de cuidador para postularte a servicios.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md border border-amber-200/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                            <span className="text-amber-500">⚠️</span> Campos Faltantes Requeridos:
                        </h3>
                        <p className="text-secondary/70 text-sm leading-relaxed">
                            Para poder visualizar las ofertas de servicio de los dueños, enviar tus postulaciones y coordinar reservas, es indispensable configurar los siguientes aspectos en tu panel de cuidador:
                        </p>
                        <ul className="space-y-3">
                            {missingFields.map((field, idx) => (
                                <li key={idx} className="flex items-center gap-3 bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl text-sm font-semibold text-secondary/80">
                                    <span className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                        {idx + 1}
                                    </span>
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-secondary/15 pt-6 flex flex-col sm:flex-row items-center gap-4">
                        <Link
                            to="/dashboard/perfil-cuidador"
                            className="w-full sm:w-auto text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            🐾 Completar Perfil de Cuidador
                        </Link>
                        <p className="text-xs text-secondary/40 italic">
                            Una vez completados estos campos, el panel de servicios se desbloqueará de forma automática.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 mt-2 pb-10">
            {/* Cabecera Principal */}
            <div className="bg-gradient-to-r from-primary to-primary-hover rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                            <FaHandshake className="text-3xl text-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold font-jaldi tracking-wide">Panel de Servicios</h1>
                            <p className="mt-1 opacity-90 text-sm">Postúlate a solicitudes de dueños y gestiona tus servicios activos asignados.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-secondary/10 shadow-sm">
                <button
                    onClick={() => setActiveTab('disponibles')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'disponibles'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-secondary/60 hover:text-secondary hover:bg-secondary/5'
                        }`}
                >
                    <FaClipboardList /> Servicios Disponibles
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'disponibles' ? 'bg-white text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {anuncios.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('asignados')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${activeTab === 'asignados'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-secondary/60 hover:text-secondary hover:bg-secondary/5'
                        }`}
                >
                    <FaHandshake /> Mis Servicios Asignados
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'asignados' ? 'bg-white text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {servicios.length}
                    </span>
                </button>
            </div>

            {/* CONTENIDO PESTAÑA: DISPONIBLES */}
            {activeTab === 'disponibles' && (
                <div className="space-y-6">
                    {/* Barra de Filtros y Búsqueda */}
                    <div className="bg-white p-5 rounded-3xl border border-secondary/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Categorías */}
                        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                            <button
                                onClick={() => setFiltroCategoria('TODOS')}
                                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${filtroCategoria === 'TODOS'
                                    ? 'bg-secondary text-white border-secondary shadow-sm'
                                    : 'bg-base border-secondary/15 text-secondary/60 hover:border-secondary/40 hover:text-secondary'
                                    }`}
                            >
                                Todos
                            </button>
                            {SERVICIOS_OPCIONES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFiltroCategoria(cat)}
                                    className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex items-center gap-1 ${filtroCategoria === cat
                                        ? 'bg-secondary text-white border-secondary shadow-sm'
                                        : 'bg-base border-secondary/15 text-secondary/60 hover:border-secondary/40 hover:text-secondary'
                                        }`}
                                >
                                    <span>{SERVICIOS_ICONS[cat]}</span>
                                    <span>{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                                </button>
                            ))}
                        </div>

                        {/* Input búsqueda */}
                        <div className="relative w-full md:w-72">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                placeholder="Buscar por dueño o descripción..."
                                className="w-full pl-10 pr-4 py-2 bg-base border border-secondary/15 rounded-2xl text-xs focus:outline-none focus:border-primary text-secondary font-semibold"
                            />
                            <FaSearch className="absolute left-3.5 top-3 text-secondary/40 text-xs" />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda('')}
                                    className="absolute right-3.5 top-2.5 text-secondary/40 hover:text-secondary font-black text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {loadingAnuncios ? (
                        <LoadingScreen message="Buscando solicitudes de servicio disponibles..." />
                    ) : anunciosFiltrados.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-secondary/10 shadow-sm">
                            <p className="text-6xl mb-4">🛎️</p>
                            <h3 className="text-lg font-bold text-secondary mb-1">Sin solicitudes disponibles</h3>
                            <p className="text-secondary/50 text-sm">
                                {busqueda || filtroCategoria !== 'TODOS'
                                    ? 'Prueba modificando tus filtros o criterio de búsqueda.'
                                    : 'En este momento no hay anuncios de servicio abiertos de dueños.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {anunciosFiltrados.map(anuncio => {
                                const yaPostulado = postuladosIds.includes(anuncio._id)
                                return (
                                    <div key={anuncio._id} className="bg-white rounded-3xl border border-secondary/10 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                        <div>
                                            {/* Cabecera Tarjeta */}
                                            <div className="flex justify-between items-start gap-2 mb-3">
                                                <div className="text-[10px] text-secondary/40 font-bold bg-secondary/5 px-2.5 py-1 rounded-md">
                                                    DUEÑO: {anuncio.dueno_id?.nombre || 'PetOwner'} {anuncio.dueno_id?.apellido || ''}
                                                </div>
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
                                            <h4 className="font-bold text-secondary text-xs mb-1 uppercase tracking-wide">Descripción:</h4>
                                            <p className="text-secondary/70 text-sm bg-base/50 p-3 rounded-2xl border border-secondary/5 mb-4 italic leading-relaxed truncate">
                                                "{anuncio.descripcion}"
                                            </p>

                                            {/* Servicios Solicitados */}
                                            <h4 className="font-bold text-secondary text-xs mb-1 uppercase tracking-wide">Servicios requeridos:</h4>
                                            {renderServiciosBadges(anuncio.servicios || [])}

                                            {/* Mascotas */}
                                            <h4 className="font-bold text-secondary text-xs mt-4 mb-2 uppercase tracking-wide">Mascotas:</h4>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {anuncio.mascotas?.map(pet => (
                                                    <div key={pet._id || pet} className="flex items-center gap-2 bg-base px-3 py-1.5 rounded-full border border-secondary/10 shadow-xs">
                                                        <span className="text-sm">
                                                            {pet.tipo === 'PERRO' ? '🐕' : pet.tipo === 'GATO' ? '🐈' : '🐾'}
                                                        </span>
                                                        <span className="text-xs font-bold text-secondary">{pet.nombre}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Acciones de la Tarjeta */}
                                        <div className="border-t border-secondary/10 pt-4 mt-4 flex items-center justify-between gap-3">
                                            {yaPostulado ? (
                                                <span className="w-full text-center bg-green-50 text-green-700 font-bold border border-green-200 text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1">
                                                    Postulado ✔️
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setModalDetalleAnuncio(anuncio)}
                                                    className="w-full bg-primary text-white hover:bg-primary-hover text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5 animate-pulse"
                                                >
                                                    🐾 Ver Detalles e Inscribirse
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* CONTENIDO PESTAÑA: ASIGNADOS */}
            {activeTab === 'asignados' && (
                <div className="space-y-4">
                    {/* Filtros de Estado */}
                    <div className="flex flex-wrap gap-2 pb-2">
                        {['TODOS', 'PENDIENTE', 'ACTIVO', 'FINALIZADO', 'CANCELADO'].map(est => (
                            <button
                                key={est}
                                onClick={() => setFiltroEstado(est)}
                                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all ${filtroEstado === est
                                    ? 'bg-secondary text-white border-secondary shadow-sm'
                                    : 'bg-white border-secondary/15 text-secondary/60 hover:border-secondary/40 hover:text-secondary'
                                    }`}
                            >
                                {est === 'TODOS' ? 'Todos' : est.charAt(0) + est.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {loadingServicios ? (
                        <LoadingScreen message="Cargando tus servicios asignados..." />
                    ) : serviciosFiltrados.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-secondary/10 shadow-sm">
                            <p className="text-6xl mb-4">🤝</p>
                            <h3 className="text-lg font-bold text-secondary mb-1">Sin servicios contratados</h3>
                            <p className="text-secondary/50 text-sm">
                                {filtroEstado === 'TODOS'
                                    ? 'Tus postulaciones aceptadas por los dueños se verán reflejadas aquí.'
                                    : `No tienes servicios en estado ${filtroEstado.toLowerCase()}.`}
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
                                            {/* Cabecera Tarjeta */}
                                            <div className="flex justify-between items-start gap-2 mb-4">
                                                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${isPending ? 'bg-yellow-100 text-yellow-700' :
                                                    isActivo ? 'bg-green-100 text-green-700 animate-pulse' :
                                                        isFinalizado ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {serv.estado}
                                                </span>
                                            </div>

                                            {/* Info Dueño */}
                                            <div className="flex items-center gap-3 bg-base p-3 rounded-2xl border border-secondary/5 mb-4">
                                                <img
                                                    src={serv.dueno_id?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                                                    alt="owner avatar"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-sm bg-white"
                                                />
                                                <div>
                                                    <p className="text-xs font-extrabold text-secondary/50 uppercase tracking-wider">DUEÑO DEL SERVICIO:</p>
                                                    <h4 className="font-bold text-secondary text-sm">
                                                        {serv.dueno_id?.nombre} {serv.dueno_id?.apellido}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-[11px] text-secondary/60 mt-1">
                                                        {serv.dueno_id?.telefono && (
                                                            <span className="flex items-center gap-0.5">
                                                                <FaPhone className="text-[10px] text-primary" /> {serv.dueno_id?.telefono}
                                                            </span>
                                                        )}
                                                        {serv.dueno_id?.email && (
                                                            <span className="flex items-center gap-0.5">
                                                                <FaEnvelope className="text-[10px] text-primary" /> {serv.dueno_id?.email}
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
                                            {renderServiciosBadges(serv.servicios || [])}

                                            {/* Mascotas Requeridas */}
                                            <h4 className="font-bold text-secondary text-xs mt-4 mb-2 uppercase tracking-wide">Mascotas atendidas:</h4>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {serv.mascotas?.map(pet => (
                                                    <div key={pet._id || pet} className="flex items-center gap-2 bg-base px-3 py-1 rounded-full border border-secondary/5">
                                                        <span className="text-xs">
                                                            {pet.tipo === 'PERRO' ? '🐕' : pet.tipo === 'GATO' ? '🐈' : '🐾'}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-secondary">{pet.nombre}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Info Financiera y Acción Reactiva */}
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
                                                    onClick={() => cambiarEstadoServicio(serv._id, 'ACTIVO', 'ACTIVO / INICIADO')}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center gap-1.5"
                                                >
                                                    <FaPlay /> Iniciar Servicio
                                                </button>
                                            )}

                                            {isActivo && (
                                                <button
                                                    onClick={() => cambiarEstadoServicio(serv._id, 'FINALIZADO', 'FINALIZADO')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all duration-300 flex items-center gap-1.5"
                                                >
                                                    <FaStop /> Finalizar Servicio
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DETALLES DEL ANUNCIO Y POSTULACIÓN */}
            {modalDetalleAnuncio && (
                <Modal
                    title={`Solicitud de ${modalDetalleAnuncio.dueno_id?.nombre || 'Owner'} ${modalDetalleAnuncio.dueno_id?.apellido || ''}`}
                    onClose={() => setModalDetalleAnuncio(null)}
                >
                    <div className="space-y-5 text-left max-h-[70vh] overflow-y-auto pr-2">
                        {/* Contacto Dueño */}
                        <div className="bg-base p-4 rounded-2xl border border-secondary/5">
                            <h3 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-2">Contacto de Dueño:</h3>
                            <div className="flex flex-col gap-1.5 text-xs text-secondary font-bold">
                                <p>👤 Nombre: <span className="font-semibold text-secondary/70">{modalDetalleAnuncio.dueno_id?.nombre} {modalDetalleAnuncio.dueno_id?.apellido}</span></p>
                                <p>✉️ Correo: <span className="font-semibold text-secondary/70">{modalDetalleAnuncio.dueno_id?.email}</span></p>
                            </div>
                        </div>

                        {/* Detalles Mascotas */}
                        <div>
                            <h3 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-2">Mascotas a atender:</h3>
                            <div className="space-y-3">
                                {modalDetalleAnuncio.mascotas?.map((pet) => (
                                    <div key={pet._id || pet} className="border border-secondary/10 bg-white rounded-2xl p-4 flex gap-3 shadow-xs">
                                        <div className="text-3xl bg-base p-2 rounded-xl h-fit">
                                            {pet.tipo === 'PERRO' ? '🐕' : pet.tipo === 'GATO' ? '🐈' : '🐾'}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs flex-1 text-secondary font-bold">
                                            <p className="col-span-2 text-sm font-extrabold text-primary">{pet.nombre}</p>
                                            <p>Raza: <span className="font-semibold text-secondary/70">{pet.raza || 'Común'}</span></p>
                                            <p>Edad: <span className="font-semibold text-secondary/70">{pet.edad ? `${pet.edad} años` : 'No especificada'}</span></p>
                                            <p>Género: <span className="font-semibold text-secondary/70">{pet.genero === 'MACHO' ? 'Macho ♂' : pet.genero === 'HEMBRA' ? 'Hembra ♀' : 'No especificado'}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Descripción y Fechas */}
                        <div className="space-y-2.5">
                            <div>
                                <h3 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-1">Descripción de la Solicitud:</h3>
                                <p className="text-secondary/80 text-xs bg-base p-3.5 rounded-2xl border border-secondary/5 italic leading-relaxed">
                                    "{modalDetalleAnuncio.descripcion}"
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-1">Horario Requerido:</h3>
                                <div className="bg-base p-3.5 rounded-2xl border border-secondary/5 text-xs text-secondary font-bold space-y-1">
                                    <p>📅 Inicio: <span className="font-semibold text-secondary/70">{formatearFecha(modalDetalleAnuncio.horario?.fecha_inicio)}</span></p>
                                    <p>📅 Fin: <span className="font-semibold text-secondary/70">{formatearFecha(modalDetalleAnuncio.horario?.fecha_fin)}</span></p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-secondary/50 uppercase tracking-wider mb-1">Servicios Solicitados:</h3>
                                {renderServiciosBadges(modalDetalleAnuncio.servicios || [])}
                            </div>
                        </div>

                        {/* Formulario de Postulación */}
                        <div className="border-t border-secondary/15 pt-5 space-y-3">
                            <h3 className="text-sm font-black text-secondary">Postularse a este Anuncio</h3>
                            <p className="text-xs text-secondary/60">Define tu tarifa por hora para este servicio. Por defecto se ha cargado la tarifa base configurada en tu perfil.</p>

                            <div className="space-y-1.5">
                                <label className={labelCls}>Tu Tarifa por Hora ($) *</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3.5 text-secondary/40 font-extrabold text-sm">$</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={15}
                                        step={0.5}
                                        value={tarifaPostulacion}
                                        onChange={(e) => setTarifaPostulacion(e.target.value)}
                                        className={inputCls + ' pl-7'}
                                        placeholder="Ej: 10"
                                    />
                                </div>
                                <span className="text-[10px] text-secondary/40 block">Máximo permitido: $15 por hora según lineamientos del sitio.</span>
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setModalDetalleAnuncio(null)}
                                    className="border-2 border-secondary/15 text-secondary font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-secondary/10 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    disabled={postulando}
                                    onClick={() => postularseAAnuncio(modalDetalleAnuncio._id)}
                                    className="bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
                                >
                                    {postulando ? 'Inscribiendo...' : '🐾 Enviar Postulación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default PanelServiciosCuidador
