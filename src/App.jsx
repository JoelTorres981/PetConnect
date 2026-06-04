import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login'
import { Register } from './pages/Register'
import { Confirm } from './pages/Confirm'
import Dashboard from './layout/Dashboard'
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import { Forgot } from './pages/Forgot'
import Reset from './pages/Reset'
import { NotFound } from './pages/NotFound'
import { Profile } from './pages/Profile'
import { AdminPanel } from './pages/AdminPanel'
import { AdminEstadisticas } from './pages/AdminEstadisticas'
import { MisMascotas } from './pages/MisMascotas'
import { ListarCuidadores } from './pages/ListarCuidadores'
import { CompromisosSanitarios } from './pages/CompromisosSanitarios'
import { ProfileCuidador } from './pages/ProfileCuidador'
import { PanelServicios } from './pages/PanelServicios'
import { PanelServiciosCuidador } from './pages/PanelServiciosCuidador'
import { ConfirmProvider } from './context/ConfirmContext'

import { useEffect } from 'react'
import storeProfile from './context/storeProfile'
import storeAuth from './context/storeAuth'


function App() {
  const { profile } = storeProfile()
  const { token, rol } = storeAuth()

  const isPetSitter = rol === "CUIDADOR"
  const isOwner = rol === "DUEÑO"
  const isAdmin = rol === "ADMINISTRADOR"

  useEffect(() => {
    if (token && rol !== 'administrador') {
      profile()
    }
  }, [token, rol])



  return (
    <ConfirmProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>

          <Route element={<PublicRoute />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='register' element={<Register />} />
            <Route path='forgot/:id' element={<Forgot />} />
            <Route path='confirm/:token' element={<Confirm />} />
            <Route path='reset/:token' element={<Reset />} />
            <Route path='recuperarpassword/:token' element={<Reset />} />
            <Route path='*' element={<NotFound />} />
          </Route>

          <Route path='dashboard/*' element={
            <ProtectedRoute>
              <Routes>
                <Route element={<Dashboard />}>
                  <Route index element={<Profile />} />
                  {/* Rutas exclusivas para ADMINISTRADOR */}
                  {isAdmin && (
                    <>
                      <Route path='admin' element={<AdminPanel />} />
                      <Route path='estadisticas' element={<AdminEstadisticas />} />
                    </>
                  )}

                  {/* Rutas exclusivas para CUIDADOR */}
                  {isPetSitter && (
                    <>
                      <Route path='perfil-cuidador' element={<ProfileCuidador />} />
                      <Route path='servicios-cuidador' element={<PanelServiciosCuidador />} />
                    </>
                  )}

                  {/* Rutas exclusivas para DUEÑO */}
                  {isOwner && (
                    <>
                      <Route path='mis-mascotas' element={<MisMascotas />} />
                      <Route path='cuidadores' element={<ListarCuidadores />} />
                      <Route path='compromisos-sanitarios' element={<CompromisosSanitarios />} />
                      <Route path='servicios' element={<PanelServicios />} />
                    </>
                  )}
                </Route>
              </Routes>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  )
}

export default App