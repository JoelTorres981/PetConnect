import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import storeAuth from '../context/storeAuth'
import storeProfile from '../context/storeProfile'
import NotificationBell from '../components/NotificationBell'

const Dashboard = () => {
    const location = useLocation()
    const urlActual = location.pathname
    const { clearToken, nombre, rol } = storeAuth()
    const { user } = storeProfile()
    const [expanded, setExpanded] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const isPetSitter = rol === "CUIDADOR"
    const isOwner = rol === "DUEÑO"
    const isAdmin = rol === "ADMINISTRADOR"

    const petLogo = "https://cdn-icons-png.flaticon.com/128/5975/5975441.png"

    return (
        <div className='flex h-screen overflow-hidden'>

            <div className={`hidden md:block bg-primary/80 px-5 py-4 transition-all duration-300 md:h-screen sticky top-0 z-20 md:overflow-y-auto ${expanded ? 'md:w-64' : 'md:w-20'}`}>

                <div
                    onClick={() => setExpanded(!expanded)}
                    className="cursor-pointer flex flex-col items-center"
                    title="Click to toggle menu"
                >
                    <h2 className={`text-4xl font-jaldi font-bold text-center text-base transition-all duration-300 ${!expanded && 'md:scale-0 md:h-0 md:opacity-0'}`}>PetConnect</h2>

                    <img
                        src={petLogo}
                        alt="logo-petconnect"
                        className={`bg-base transition-all duration-300 border-base rounded-full object-cover ${expanded ? 'm-auto mt-8 p-1 border-2 w-32 h-32' : 'mt-2 p-0.5 border w-10 h-10'}`}
                    />
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${expanded ? 'opacity-100 max-h-20' : 'md:opacity-0 md:max-h-0'}`}>
                    <p className='text-slate-800 text-center my-4 text-sm whitespace-nowrap'>
                        <span className='bg-green-600 w-3 h-3 inline-block rounded-full'></span> Bienvenido
                    </p>
                </div>

                <hr className="mt-5 border-base" />

                <ul className="mt-5 space-y-2">
                    <li className="text-center">
                        <Link to='/dashboard' className={`${urlActual === '/dashboard' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                            {expanded ? "Mi Perfil" : "👤"}
                        </Link>
                    </li>

                    {/* Rutas para CUIDADOR */}
                    {isPetSitter && (
                        <>
                            <li className="text-center">
                                <Link to='/dashboard/perfil-cuidador' className={`${urlActual === '/dashboard/perfil-cuidador' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Como Cuidador" : "🐾"}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link to='/dashboard/servicios-cuidador' className={`${urlActual === '/dashboard/servicios-cuidador' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Servicios" : "🛎️"}
                                </Link>
                            </li>
                        </>
                    )}

                    {/* Rutas para DUEÑO */}
                    {isOwner && (
                        <>
                            <li className="text-center">
                                <Link to='/dashboard/mis-mascotas' className={`${urlActual === '/dashboard/mis-mascotas' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Mis Mascotas" : "🐾"}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link to='/dashboard/cuidadores' className={`${urlActual === '/dashboard/cuidadores' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Ver Cuidadores" : "🧑‍⚕️"}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link to='/dashboard/compromisos-sanitarios' className={`${urlActual === '/dashboard/compromisos-sanitarios' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Salud" : "⚕️"}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link to='/dashboard/servicios' className={`${urlActual === '/dashboard/servicios' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Servicios" : "🛎️"}
                                </Link>
                            </li>
                        </>
                    )}

                    {/* Rutas para ADMINISTRADOR */}
                    {isAdmin && (
                        <>
                            <li className="text-center">
                                <Link to='/dashboard/admin' className={`${urlActual === '/dashboard/admin' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Panel Admin" : "🛡️"}
                                </Link>
                            </li>
                            <li className="text-center">
                                <Link to='/dashboard/estadisticas' className={`${urlActual === '/dashboard/estadisticas' ? 'bg-primary-hover text-white' : 'text-slate-800 hover:bg-primary-hover hover:text-white'} text-sm font-semibold rounded-xl block p-2 transition-colors whitespace-nowrap`}>
                                    {expanded ? "Estadísticas" : "📊"}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* ═══════════════════════════════════════════
                CONTENIDO PRINCIPAL
            ═══════════════════════════════════════════ */}
            <div className='flex-1 flex flex-col bg-base h-screen overflow-hidden'>

                {/* TOPBAR — compartido desktop/mobile */}
                <div className='bg-primary/80 py-2 px-4 flex justify-between md:justify-end items-center gap-4 sticky top-0 z-10 shadow-md'>

                    {/* Mobile: botón hamburguesa + nombre app */}
                    <div className='flex items-center gap-3 md:hidden'>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className='text-white text-2xl focus:outline-none'
                            aria-label="Abrir menú"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>
                        <img src={petLogo} alt="logo" className='w-8 h-8 rounded-full border border-white/40 object-cover bg-white' />
                        <span className='text-white font-bold text-sm'>PetConnect</span>
                    </div>

                    {/* Desktop: nombre usuario */}
                    <div className='text-md font-semibold text-slate-100 hidden md:block'>
                        {isAdmin ? 'Administrador' : isOwner ? `Dueño - ${nombre}` : `Cuidador - ${nombre}`}
                    </div>

                    <div className='flex items-center gap-3 ml-auto'>
                        {(isOwner || isPetSitter) && <NotificationBell />}

                        {!isAdmin && (
                            <img
                                src={user?.avatar_url || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"}
                                alt="img-client"
                                className="border-2 border-base rounded-full object-cover bg-white w-10 h-10"
                            />
                        )}
                        <Link
                            to='/'
                            className="text-white text-sm font-medium hover:bg-red-900 bg-red-800 px-4 py-1.5 rounded-lg transition-colors"
                            onClick={clearToken}
                        >
                            Cerrar Sesión
                        </Link>
                    </div>
                </div>

                {/* MENÚ MOBILE — drawer desplegable bajo el topbar */}
                {mobileMenuOpen && (
                    <div className='md:hidden bg-primary/90 px-4 py-3 shadow-lg z-10'>
                        <ul className='space-y-1'>
                            <li>
                                <Link
                                    to='/dashboard'
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                >
                                    👤 Mi Perfil
                                </Link>
                            </li>

                            {/* Rutas para CUIDADOR */}
                            {isPetSitter && (
                                <>
                                    <li>
                                        <Link
                                            to='/dashboard/perfil-cuidador'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/perfil-cuidador' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            🐾 Como Cuidador
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/dashboard/servicios-cuidador'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/servicios-cuidador' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            🛎️ Servicios
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Rutas para DUEÑO */}
                            {isOwner && (
                                <>
                                    <li>
                                        <Link
                                            to='/dashboard/mis-mascotas'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/mis-mascotas' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            🐾 Mis Mascotas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/dashboard/cuidadores'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/cuidadores' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            🧑‍⚕️ Ver Cuidadores
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/dashboard/compromisos-sanitarios'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/compromisos-sanitarios' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            ⚕️ Salud y Vacunas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/dashboard/servicios'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/servicios' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            🛎️ Servicios
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Rutas para ADMINISTRADOR */}
                            {isAdmin && (
                                <>
                                    <li>
                                        <Link
                                            to='/dashboard/admin'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/admin' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            🛡️ Panel Admin
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to='/dashboard/estadisticas'
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${urlActual === '/dashboard/estadisticas' ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                        >
                                            📊 Estadísticas
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                )}

                {/* CONTENIDO DE LA PÁGINA */}
                <div className='overflow-y-auto p-4 md:p-8 flex-1'>
                    <Outlet />
                </div>

                {/* FOOTER */}
                <div className='bg-primary/80 h-12'>
                    <p className='text-center text-slate-100 leading-[2.9rem] text-sm'>
                        © {new Date().getFullYear()} PetConnect. <span className='font-bold'>Todos los derechos reservados.</span>
                    </p>
                </div>
            </div>

        </div>
    )
}

export default Dashboard