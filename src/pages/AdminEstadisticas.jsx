import { useState, useEffect } from 'react'
import axios from 'axios'
import { getAuthHeaders } from '../helpers/authHeaders'

const API = import.meta.env.VITE_BACKEND_URL

// ── Tarjeta de métrica ─────────────────────────────────────────────
const StatCard = ({ emoji, label, value, sub, color }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-secondary/10 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
        <div className={`text-3xl w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0 ${color} transition-transform duration-300 hover:scale-110`}>
            {emoji}
        </div>
        <div>
            <p className="text-2xl font-bold text-secondary">{value ?? '—'}</p>
            <p className="text-sm font-semibold text-secondary/70">{label}</p>
            {sub && <p className="text-xs text-secondary/40 mt-0.5">{sub}</p>}
        </div>
    </div>
)

// ── Barra de progreso simple ───────────────────────────────────────
const BarraProgreso = ({ label, value, total, color }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-secondary/70 font-medium">{label}</span>
                <span className="text-secondary font-bold">{value} <span className="text-secondary/40 font-normal">({pct}%)</span></span>
            </div>
            <div className="w-full bg-secondary/10 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

// ── Página principal ───────────────────────────────────────────────
export const AdminEstadisticas = () => {
    const [datos, setDatos] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const cargar = async () => {
            setLoading(true)
            setError(null)
            try {
                const [admRes, duenosRes, cuidadoresRes, mascRes, servRes] = await Promise.allSettled([
                    axios.get(`${API}/administrador/usuarios?rol=ADMINISTRADOR`, getAuthHeaders()),
                    axios.get(`${API}/administrador/usuarios?rol=DUEÑO`, getAuthHeaders()),
                    axios.get(`${API}/administrador/usuarios?rol=CUIDADOR`, getAuthHeaders()),
                    axios.get(`${API}/mascotas/listar`, getAuthHeaders()),
                    axios.get(`${API}/servicios/listar`, getAuthHeaders()),
                ])

                const administradores = admRes.status === 'fulfilled' ? (admRes.value.data.usuarios || []) : []
                const duenos         = duenosRes.status === 'fulfilled' ? (duenosRes.value.data.usuarios || []) : []
                const cuidadores     = cuidadoresRes.status === 'fulfilled' ? (cuidadoresRes.value.data.usuarios || []) : []
                const mascotas       = mascRes.status === 'fulfilled' ? (mascRes.value.data || []) : []
                const servicios      = servRes.status === 'fulfilled' ? (servRes.value.data?.servicios || servRes.value.data || []) : []

                // Usuarios
                const totalUsuarios      = administradores.length + duenos.length + cuidadores.length
                const usuariosActivos    = [...administradores, ...duenos, ...cuidadores].filter(u => u.estado).length
                const usuariosVerificados = [...administradores, ...duenos, ...cuidadores].filter(u => u.verificado).length

                // Mascotas
                const mascotasActivas   = mascotas.filter(m => m.estado).length
                const porTipo = {
                    PERRO: mascotas.filter(m => m.tipo === 'PERRO').length,
                    GATO:  mascotas.filter(m => m.tipo === 'GATO').length,
                    OTRO:  mascotas.filter(m => m.tipo === 'OTRO').length,
                }
                const porTamano = {
                    PEQUEÑO: mascotas.filter(m => m.tamano === 'PEQUEÑO').length,
                    MEDIANO: mascotas.filter(m => m.tamano === 'MEDIANO').length,
                    GRANDE:  mascotas.filter(m => m.tamano === 'GRANDE').length,
                }

                // Servicios
                const totalServicios   = Array.isArray(servicios) ? servicios.length : 0
                const servActivos      = Array.isArray(servicios) ? servicios.filter(s => s.estado === 'ACTIVO').length   : 0
                const servPendientes   = Array.isArray(servicios) ? servicios.filter(s => s.estado === 'PENDIENTE').length : 0
                const servCompletados  = Array.isArray(servicios) ? servicios.filter(s => s.estado === 'COMPLETADO').length : 0
                const servCancelados   = Array.isArray(servicios) ? servicios.filter(s => s.estado === 'CANCELADO').length  : 0

                setDatos({
                    totalUsuarios, usuariosActivos, usuariosVerificados,
                    administradores: administradores.length,
                    duenos: duenos.length,
                    cuidadores: cuidadores.length,
                    totalMascotas: mascotas.length, mascotasActivas,
                    porTipo, porTamano,
                    totalServicios, servActivos, servPendientes, servCompletados, servCancelados,
                })
            } catch {
                setError('Error al cargar estadísticas')
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-4xl animate-bounce">📊</p>
            <p className="text-secondary/50 animate-pulse text-sm">Cargando estadísticas...</p>
        </div>
    )

    if (error) return (
        <div className="text-center py-20 text-error">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-semibold">{error}</p>
        </div>
    )

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-secondary">📊 Estadísticas Generales</h1>

            {/* ── Tarjetas resumen ──────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard emoji="👥" label="Total Usuarios" value={datos.totalUsuarios} sub={`${datos.usuariosActivos} activos`} color="bg-primary-lighter" />
                <StatCard emoji="🐾" label="Total Mascotas" value={datos.totalMascotas} sub={`${datos.mascotasActivas} activas`} color="bg-primary-lighter" />
                <StatCard emoji="🔧" label="Total Servicios" value={datos.totalServicios} sub={`${datos.servActivos} activos`} color="bg-primary-lighter" />
                <StatCard emoji="✅" label="Completados" value={datos.servCompletados} sub="servicios terminados" color="bg-primary-lighter" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* ── Usuarios por rol ──────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 p-6 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-base font-bold text-secondary mb-4">👤 Usuarios por Rol</h2>
                    <div className="space-y-3">
                        <BarraProgreso label="Administradores" value={datos.administradores} total={datos.totalUsuarios} color="bg-secondary" />
                        <BarraProgreso label="Dueños"          value={datos.duenos}          total={datos.totalUsuarios} color="bg-primary" />
                        <BarraProgreso label="Cuidadores"      value={datos.cuidadores}       total={datos.totalUsuarios} color="bg-primary-hover" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-secondary/10 flex justify-between flex-wrap gap-2 text-xs text-secondary/50">
                        <span>✅ Activos: <strong className="text-secondary">{datos.usuariosActivos}</strong></span>
                        <span>📧 Verificados: <strong className="text-secondary">{datos.usuariosVerificados}</strong></span>
                    </div>
                </div>

                {/* ── Mascotas por tipo ────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 p-6 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-base font-bold text-secondary mb-4">🐶 Mascotas por Tipo</h2>
                    <div className="space-y-3">
                        <BarraProgreso label="🐕 Perros" value={datos.porTipo.PERRO} total={datos.totalMascotas} color="bg-primary" />
                        <BarraProgreso label="🐈 Gatos"  value={datos.porTipo.GATO}  total={datos.totalMascotas} color="bg-primary-hover" />
                        <BarraProgreso label="🐾 Otros"  value={datos.porTipo.OTRO}  total={datos.totalMascotas} color="bg-secondary" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-secondary/10">
                        <p className="text-xs text-secondary/50 mb-2 font-semibold">Por tamaño</p>
                        <div className="space-y-2">
                            <BarraProgreso label="Pequeño" value={datos.porTamano.PEQUEÑO} total={datos.totalMascotas} color="bg-primary-light" />
                            <BarraProgreso label="Mediano" value={datos.porTamano.MEDIANO} total={datos.totalMascotas} color="bg-primary" />
                            <BarraProgreso label="Grande"  value={datos.porTamano.GRANDE}  total={datos.totalMascotas} color="bg-secondary" />
                        </div>
                    </div>
                </div>

                {/* ── Estado de servicios ──────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 p-6 md:col-span-2 lg:col-span-1 hover:shadow-md transition-shadow duration-300">
                    <h2 className="text-base font-bold text-secondary mb-4">🔧 Estado de Servicios</h2>
                    {datos.totalServicios === 0 ? (
                        <p className="text-secondary/40 text-sm text-center py-8">No hay servicios registrados</p>
                    ) : (
                        <div className="space-y-3">
                            <BarraProgreso label="✅ Completados" value={datos.servCompletados} total={datos.totalServicios} color="bg-green-500" />
                            <BarraProgreso label="⚡ Activos"     value={datos.servActivos}     total={datos.totalServicios} color="bg-primary" />
                            <BarraProgreso label="⏳ Pendientes"  value={datos.servPendientes}  total={datos.totalServicios} color="bg-yellow-400" />
                            <BarraProgreso label="❌ Cancelados"  value={datos.servCancelados}  total={datos.totalServicios} color="bg-error" />
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-secondary/10 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-base rounded-xl py-2">
                            <p className="text-lg font-bold text-secondary">{datos.servActivos}</p>
                            <p className="text-xs text-secondary/50">En curso</p>
                        </div>
                        <div className="bg-base rounded-xl py-2">
                            <p className="text-lg font-bold text-secondary">{datos.servPendientes}</p>
                            <p className="text-xs text-secondary/50">Por iniciar</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Resumen final ─────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 p-6 hover:shadow-md transition-shadow duration-300">
                <h2 className="text-base font-bold text-secondary mb-4">📋 Resumen General</h2>
                <div className="grid grid-cols-1 min-[350px]:grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                        { emoji: '🛡️', label: 'Administradores', value: datos.administradores },
                        { emoji: '👤', label: 'Dueños',          value: datos.duenos },
                        { emoji: '🐾', label: 'Cuidadores',      value: datos.cuidadores },
                        { emoji: '🐶', label: 'Mascotas activas', value: datos.mascotasActivas },
                    ].map(item => (
                        <div key={item.label} className="bg-base rounded-xl py-4 px-2 hover:bg-primary-lighter/40 hover:scale-[1.02] transition-all duration-300 cursor-default">
                            <p className="text-2xl mb-1">{item.emoji}</p>
                            <p className="text-xl font-bold text-secondary">{item.value}</p>
                            <p className="text-xs text-secondary/50">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminEstadisticas
