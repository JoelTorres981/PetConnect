import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'
import { getAuthHeaders } from '../helpers/authHeaders'
import { FaBell } from 'react-icons/fa'

const NotificationBell = () => {
    const { rol } = storeAuth()
    const { user } = storeProfile()

    const isPetSitter = rol === "CUIDADOR"
    const isOwner = rol === "DUEÑO"

    if (!isOwner && !isPetSitter) return null

    const [bellOpen, setBellOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [readNotifIds, setReadNotifIds] = useState([])
    const bellRef = useRef(null)

    // Cargar historial de notificaciones y IDs leídos de localStorage al iniciar o cambiar usuario
    useEffect(() => {
        if (user?._id) {
            const readKey = `petconnect_read_notifications_${user._id}`
            const historyKey = `petconnect_notifications_history_${user._id}`
            try {
                // Cargar IDs leídos
                const storedRead = localStorage.getItem(readKey)
                if (storedRead) {
                    setReadNotifIds(JSON.parse(storedRead))
                } else {
                    setReadNotifIds([])
                }

                // Cargar historial de notificaciones
                const storedHistory = localStorage.getItem(historyKey)
                if (storedHistory) {
                    const parsed = JSON.parse(storedHistory)
                    const formatted = parsed.map(n => ({
                        ...n,
                        date: new Date(n.date)
                    }))
                    setNotifications(formatted)
                } else {
                    setNotifications([])
                }
            } catch (e) {
                console.error('Error al inicializar localStorage de notificaciones:', e)
            }
        }
    }, [user?._id])

    useEffect(() => {
        if (!user?._id) return

        const fetchNotifications = async () => {
            const tempNotifications = []
            const API = import.meta.env.VITE_BACKEND_URL

            try {
                // 1. Si es DUEÑO, cargar Compromisos Sanitarios y Cambios en Servicios
                if (isOwner) {
                    // Cargar Compromisos Sanitarios
                    try {
                        const resComp = await axios.get(`${API}/compromisos-sanitarios/listar`, getAuthHeaders())
                        if (Array.isArray(resComp.data)) {
                            resComp.data.forEach(c => {
                                if (Array.isArray(c.recordatorios_enviados) && c.recordatorios_enviados.length > 0) {
                                    c.recordatorios_enviados.forEach(d => {
                                        const labelMap = { 7: '7 días antes', 3: '3 días antes', 0: 'El mismo día' }
                                        const colorMap = { 7: 'bg-blue-100 text-blue-700', 3: 'bg-orange-100 text-orange-700', 0: 'bg-red-100 text-red-600' }
                                        const typeLabel = c.tipo === 'VACUNA' ? 'Vacuna' : c.tipo === 'DESPARASITACION' ? 'Desparasitación' : 'Salud'
                                        tempNotifications.push({
                                            id: `comp_${c._id}_${d}`,
                                            type: 'COMPROMISO',
                                            title: `Salud: ${c.mascota_id?.nombre || 'Mascota'}`,
                                            message: `Correo enviado para la ${typeLabel} de ${c.mascota_id?.nombre} (${labelMap[d] || `${d} días`}).`,
                                            date: new Date(c.updatedAt || c.createdAt),
                                            icon: c.tipo === 'VACUNA' ? '💉' : '💊',
                                            link: '/dashboard/compromisos-sanitarios',
                                            state: { tab: 'compromisos' },
                                            badgeText: labelMap[d] || `${d}d`,
                                            badgeColor: colorMap[d] || 'bg-gray-100 text-gray-700'
                                        })
                                    })
                                }
                            })
                        }
                    } catch (e) {
                        console.error('Error fetching compromisos:', e)
                    }

                    // Cargar Servicios
                    try {
                        const resServ = await axios.get(`${API}/servicios/listar`, getAuthHeaders())
                        const list = resServ.data?.servicios || (Array.isArray(resServ.data) ? resServ.data : [])
                        list.forEach(s => {
                            if (s.estado === 'ACTIVO') {
                                tempNotifications.push({
                                    id: `serv_${s._id}_ACTIVO`,
                                    type: 'SERVICIO',
                                    title: 'Servicio Iniciado 🚀',
                                    message: `El cuidador ${s.cuidador_id?.nombre || 'Cuidador'} ha iniciado el servicio para ${s.mascotas?.map(m => m.nombre).join(', ')}.`,
                                    date: new Date(s.updatedAt || s.createdAt),
                                    icon: '🚀',
                                    link: '/dashboard/servicios',
                                    state: { tab: 'servicios', estado: 'ACTIVO' },
                                    badgeText: 'Activo',
                                    badgeColor: 'bg-green-100 text-green-700'
                                })
                            } else if (s.estado === 'FINALIZADO') {
                                tempNotifications.push({
                                    id: `serv_${s._id}_FINALIZADO`,
                                    type: 'SERVICIO',
                                    title: 'Servicio Finalizado 🎓',
                                    message: `El cuidador ${s.cuidador_id?.nombre || 'Cuidador'} ha completado el servicio para ${s.mascotas?.map(m => m.nombre).join(', ')}.`,
                                    date: new Date(s.updatedAt || s.createdAt),
                                    icon: '🎓',
                                    link: '/dashboard/servicios',
                                    state: { tab: 'servicios', estado: 'FINALIZADO' },
                                    badgeText: 'Finalizado',
                                    badgeColor: 'bg-blue-100 text-blue-700'
                                })
                            } else if (s.estado === 'CANCELADO') {
                                tempNotifications.push({
                                    id: `serv_${s._id}_CANCELADO`,
                                    type: 'SERVICIO',
                                    title: 'Servicio Cancelado ✕',
                                    message: `El servicio de ${s.cuidador_id?.nombre || 'Cuidador'} ha sido cancelado.`,
                                    date: new Date(s.updatedAt || s.createdAt),
                                    icon: '✕',
                                    link: '/dashboard/servicios',
                                    state: { tab: 'servicios', estado: 'CANCELADO' },
                                    badgeText: 'Cancelado',
                                    badgeColor: 'bg-red-100 text-red-700'
                                })
                            }
                        })
                    } catch (e) {
                        console.error('Error fetching servicios owner:', e)
                    }
                }

                // 2. Si es CUIDADOR, cargar Nuevos Anuncios Abiertos y Servicios Asignados
                if (isPetSitter) {
                    // Cargar Nuevos Anuncios (Abiertos)
                    try {
                        const resAnun = await axios.get(`${API}/anuncios/listar`, getAuthHeaders())
                        if (Array.isArray(resAnun.data)) {
                            const abiertos = resAnun.data.filter(a => a.estado === 'ABIERTO')
                            abiertos.forEach(a => {
                                tempNotifications.push({
                                    id: `anun_${a._id}_abierto`,
                                    type: 'ANUNCIO',
                                    title: 'Nueva Solicitud Disponible 🛎️',
                                    message: `El dueño ${a.dueno_id?.nombre || 'Dueño'} solicita ${a.servicios?.join(', ')} para ${a.mascotas?.map(m => m.nombre).join(', ')}.`,
                                    date: new Date(a.createdAt),
                                    icon: '🛎️',
                                    link: '/dashboard/servicios-cuidador',
                                    state: { tab: 'disponibles' },
                                    badgeText: 'Nuevo',
                                    badgeColor: 'bg-purple-100 text-purple-700 font-extrabold'
                                })
                            })
                        }
                    } catch (e) {
                        console.error('Error fetching anuncios:', e)
                    }

                    // Cargar Servicios Asignados (Contratos)
                    try {
                        const resServ = await axios.get(`${API}/servicios/listar`, getAuthHeaders())
                        const list = resServ.data?.servicios || (Array.isArray(resServ.data) ? resServ.data : [])
                        list.forEach(s => {
                            if (s.estado === 'PENDIENTE') {
                                tempNotifications.push({
                                    id: `serv_${s._id}_PENDIENTE`,
                                    type: 'SERVICIO',
                                    title: '¡Postulación Aceptada! 🤝',
                                    message: `El dueño ${s.dueno_id?.nombre || 'Dueño'} aceptó tu postulación para atender a ${s.mascotas?.map(m => m.nombre).join(', ')}.`,
                                    date: new Date(s.createdAt),
                                    icon: '🤝',
                                    link: '/dashboard/servicios-cuidador',
                                    state: { tab: 'asignados', estado: 'PENDIENTE' },
                                    badgeText: 'Asignado',
                                    badgeColor: 'bg-yellow-100 text-yellow-700 font-extrabold'
                                })
                            } else if (s.estado === 'CANCELADO') {
                                tempNotifications.push({
                                    id: `serv_${s._id}_CANCELADO`,
                                    type: 'SERVICIO',
                                    title: 'Servicio Cancelado por Dueño ✕',
                                    message: `El dueño ha cancelado el contrato del servicio para ${s.mascotas?.map(m => m.nombre).join(', ')}.`,
                                    date: new Date(s.updatedAt || s.createdAt),
                                    icon: '✕',
                                    link: '/dashboard/servicios-cuidador',
                                    state: { tab: 'asignados', estado: 'CANCELADO' },
                                    badgeText: 'Cancelado',
                                    badgeColor: 'bg-red-100 text-red-700'
                                })
                            }
                        })
                    } catch (e) {
                        console.error('Error fetching servicios sitter:', e)
                    }
                }

                // 3. Fusión con el historial en LocalStorage para garantizar que "siempre se queden las notificaciones pasadas"
                const historyKey = `petconnect_notifications_history_${user._id}`
                let historicalList = []
                try {
                    const stored = localStorage.getItem(historyKey)
                    if (stored) {
                        historicalList = JSON.parse(stored).map(h => ({
                            ...h,
                            date: new Date(h.date)
                        }))
                    }
                } catch (err) {
                    console.error('Error al leer historial para fusionar:', err)
                }

                // Fusionar nuevas con históricas
                const mergedMap = new Map()
                historicalList.forEach(item => {
                    mergedMap.set(item.id, item)
                })
                tempNotifications.forEach(item => {
                    mergedMap.set(item.id, item)
                })

                const finalNotifications = Array.from(mergedMap.values())
                finalNotifications.sort((a, b) => b.date.getTime() - a.date.getTime())

                try {
                    localStorage.setItem(historyKey, JSON.stringify(finalNotifications))
                } catch (err) {
                    console.error('Error al persistir historial fusionado:', err)
                }

                setNotifications(finalNotifications)

            } catch (error) {
                console.error('Error compiling notifications:', error)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 15000)
        return () => clearInterval(interval)

    }, [isOwner, isPetSitter, user?._id])

    // Marcar todo como leído en localStorage
    const markAllAsRead = () => {
        if (!user?._id || notifications.length === 0) return
        const key = `petconnect_read_notifications_${user._id}`
        try {
            const stored = localStorage.getItem(key)
            const currentRead = stored ? JSON.parse(stored) : []
            const newRead = Array.from(new Set([...currentRead, ...notifications.map(n => n.id)]))
            localStorage.setItem(key, JSON.stringify(newRead))
            setReadNotifIds(newRead)
        } catch (error) {
            console.error('Error saving read notifications:', error)
        }
    }

    const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length

    // Cerrar dropdown al click fuera
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={() => {
                    setBellOpen(v => {
                        const next = !v
                        if (next) markAllAsRead()
                        return next
                    })
                }}
                className="relative p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                aria-label="Notificaciones"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {bellOpen && (
                <div className="fixed left-4 right-4 top-[64px] w-auto max-w-none md:absolute md:left-auto md:right-0 md:top-12 md:w-96 md:max-w-sm bg-white rounded-2xl shadow-2xl border border-secondary/10 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-secondary/10">
                        <p className="text-sm font-bold text-secondary flex items-center gap-2">
                            <FaBell className="text-primary" /> Notificaciones
                        </p>
                        <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {unreadCount} nuevas
                        </span>
                    </div>

                    {/* Lista */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-secondary/5">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <p className="text-4xl mb-2">🔔</p>
                                <p className="text-secondary font-bold text-xs">Sin notificaciones</p>
                                <p className="text-[10px] text-secondary/40 mt-1">Te avisaremos cuando haya novedades.</p>
                            </div>
                        ) : (
                            notifications.map(n => {
                                const esLeida = readNotifIds.includes(n.id)
                                return (
                                    <Link
                                        key={n.id}
                                        to={n.link}
                                        state={n.state}
                                        onClick={() => setBellOpen(false)}
                                        className={`px-4 py-3.5 hover:bg-secondary/5 transition-colors block text-left relative ${
                                            !esLeida ? 'bg-primary/[0.02] border-l-2 border-primary' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-lg p-2 bg-secondary/5 rounded-xl block h-fit mt-0.5">
                                                {n.icon}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <p className="text-xs font-black text-secondary truncate">{n.title}</p>
                                                    {n.badgeText && (
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${n.badgeColor}`}>
                                                            {n.badgeText}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-secondary/70 leading-relaxed break-words">{n.message}</p>
                                                <p className="text-[10px] text-secondary/40 font-bold mt-1.5 flex items-center gap-1">
                                                    📅 {n.date.toLocaleDateString('es-ES', { 
                                                        day: 'numeric', 
                                                        month: 'short', 
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 bg-secondary/5 border-t border-secondary/10">
                        <Link
                            to={isOwner ? "/dashboard/compromisos-sanitarios" : "/dashboard/servicios-cuidador"}
                            onClick={() => setBellOpen(false)}
                            className="text-xs text-primary font-semibold hover:underline block text-center"
                        >
                            {isOwner ? "Ver todos los compromisos →" : "Ver mis servicios →"}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
