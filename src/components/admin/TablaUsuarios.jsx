import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../../helpers/authHeaders';
import { Modal } from '../Modal';
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../../helpers/formStyles';

const API = import.meta.env.VITE_BACKEND_URL;

// ─── Modal Registrar Usuario (Admin puede crear cualquier rol) ────
const ModalRegistrarUsuario = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const onSubmit = async (data) => {
    try {
      await axios.post(`${API}/administrador/registrarUsuario`, data, getAuthHeaders())
      toast.success('Usuario registrado. Se envió un correo de confirmación.')
      onSuccess(); onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || 'Error al registrar') }
  }
  return (
    <Modal title="Registrar Usuario" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nombre</label>
            <input className={inputCls} {...register('nombre', { required: 'Obligatorio' })} />
            {errors.nombre && <p className={errCls}>{errors.nombre.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Apellido</label>
            <input className={inputCls} {...register('apellido', { required: 'Obligatorio' })} />
            {errors.apellido && <p className={errCls}>{errors.apellido.message}</p>}
          </div>
        </div>
        <div>
          <label className={labelCls}>Correo electrónico</label>
          <input type="email" className={inputCls} {...register('email', {
            required: 'Obligatorio', pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' }
          })} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input type="tel" placeholder="0991234567" className={inputCls} {...register('telefono', {
            required: 'Obligatorio', pattern: { value: /^\d{10}$/, message: '10 dígitos numéricos' }
          })} />
          {errors.telefono && <p className={errCls}>{errors.telefono.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Fecha de Nacimiento</label>
          <input
            type="date"
            min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 100); return d.toISOString().split('T')[0]; })()}
            max={new Date().toISOString().split('T')[0]}
            className={inputCls}
            {...register("fechaNacimiento", {
              required: "La fecha de nacimiento es obligatoria",
              validate: value => {
                if (!value) return true;
                const fecha = new Date(value);
                const hoy = new Date();
                const hace16 = new Date();
                hace16.setFullYear(hoy.getFullYear() - 16);
                const hace100 = new Date();
                hace100.setFullYear(hoy.getFullYear() - 100);
                if (fecha > hoy) return "La fecha no puede ser en el futuro.";
                if (fecha < hace100) return "La fecha no puede ser mayor a 100 años.";
                if (fecha > hace16) return "El usuario debe tener al menos 16 años.";
                return true;
              }
            })}
          />
          {errors.fechaNacimiento && <p className={errCls}>{errors.fechaNacimiento.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Rol</label>
          <select className={inputCls} defaultValue="" {...register('rol', { required: 'Selecciona un rol' })}>
            <option value="" disabled>Selecciona un rol</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="DUEÑO">Dueño</option>
            <option value="CUIDADOR">Cuidador</option>
          </select>
          {errors.rol && <p className={errCls}>{errors.rol.message}</p>}
        </div>
        <p className="text-xs text-secondary/50 bg-base rounded-lg px-3 py-2">
          🔒 La contraseña se genera automáticamente y se envía al correo del usuario.
        </p>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={btnPrimary + " flex-1"}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal Editar Usuario ────────────────────────────────────────
const ModalEditarUsuario = ({ usuario, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { nombre: usuario.nombre, apellido: usuario.apellido, telefono: usuario.telefono, estado: usuario.estado, verificado: usuario.verificado }
  })
  const onSubmit = async (data) => {
    try {
      await axios.patch(`${API}/administrador/actualizar-usuario/${usuario._id}`, data, getAuthHeaders())
      toast.success('Usuario actualizado'); onSuccess(); onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || 'Error') }
  }
  return (
    <Modal title="Editar Usuario" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nombre</label>
            <input className={inputCls} {...register('nombre')} />
          </div>
          <div>
            <label className={labelCls}>Apellido</label>
            <input className={inputCls} {...register('apellido')} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Teléfono</label>
          <input type="tel" className={inputCls} {...register('telefono', {
            pattern: { value: /^\d{10}$/, message: '10 dígitos' }
          })} />
          {errors.telefono && <p className={errCls}>{errors.telefono.message}</p>}
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
            <input type="checkbox" className="accent-primary" {...register('verificado')} /> Verificado
          </label>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={btnPrimary + " flex-1"}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal Confirmar Desactivación ───────────────────────────────
const ModalDesactivar = ({ usuario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const confirmar = async () => {
    setLoading(true)
    try {
      const res = await axios.delete(`${API}/administrador/eliminar-usuario/${usuario._id}`, getAuthHeaders())
      toast.success(res.data.msg || 'Usuario procesado con éxito')
      onSuccess()
      onClose()
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Error al procesar el usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="⚠️ Atención requerida" onClose={onClose}>
      <div className="space-y-4">
        {usuario.verificado ? (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm">
            <p className="font-bold mb-1">El usuario SÍ está verificado.</p>
            <p>Al continuar, su cuenta será <strong>suspendida (inactiva)</strong> y no podrá iniciar sesión.</p>
            <p className="mt-1 opacity-90">Si es dueño, sus mascotas también se desactivarán. Si es cuidador, su perfil se ocultará.</p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
            <p className="font-bold mb-1">El usuario NO está verificado.</p>
            <p>Al continuar, este registro será <strong>eliminado permanentemente</strong> de la base de datos por considerarse falso o incompleto.</p>
          </div>
        )}
        <p className="text-secondary font-medium">¿Estás seguro de que deseas proceder con {usuario.nombre} {usuario.apellido}?</p>
        
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button onClick={confirmar} disabled={loading} className={`${btnPrimary} flex-1 !bg-red-500 hover:!bg-red-600 border-none`}>
            {loading ? 'Procesando...' : (usuario.verificado ? 'Suspender' : 'Eliminar permanentemente')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Modal Confirmar Activación ───────────────────────────────
const ModalActivar = ({ usuario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const confirmar = async () => {
    setLoading(true)
    try {
      const res = await axios.patch(`${API}/administrador/activar-usuario/${usuario._id}`, {}, getAuthHeaders())
      toast.success(res.data.msg || 'Usuario activado con éxito')
      onSuccess()
      onClose()
    } catch (e) {
      toast.error(e?.response?.data?.msg || 'Error al procesar el usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="✅ Activar Usuario" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm">
          <p className="font-bold mb-1">Reactivación de cuenta</p>
          <p>Al continuar, este usuario recuperará el acceso a la plataforma.</p>
          <p className="mt-1 opacity-90">Si es dueño, sus mascotas también se reactivarán. Si es cuidador, su perfil volverá a estar visible.</p>
          <p className="mt-1 font-semibold">Se le enviará un correo automático notificándole que su cuenta ha sido reactivada.</p>
        </div>
        <p className="text-secondary font-medium">¿Estás seguro de que deseas reactivar a {usuario.nombre} {usuario.apellido}?</p>
        
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button onClick={confirmar} disabled={loading} className={`${btnPrimary} flex-1 !bg-green-600 hover:!bg-green-700 border-none`}>
            {loading ? 'Activando...' : 'Sí, Activar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Tabla de Usuarios (reutilizable por rol) ────────────────────
export const TablaUsuarios = ({ rol }) => {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [registrando, setRegistrando] = useState(false)
  const [editando, setEditando] = useState(null)

  const [desactivando, setDesactivando] = useState(null)
  const [activando, setActivando] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/administrador/usuarios?rol=${rol}`, getAuthHeaders())
      setLista(res.data.usuarios || [])
    } catch { toast.error('Error al cargar') } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [rol])

  if (loading) return <p className="text-center py-10 text-secondary/50 animate-pulse">Cargando...</p>

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setRegistrando(true)} className={btnPrimary}>+ Nuevo</button>
      </div>
      {lista.length === 0 ? (
        <p className="text-center py-12 text-secondary/40">No hay usuarios en esta categoría</p>
      ) : (
        <>
          {/* Vista desktop: tabla */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-secondary/10 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-secondary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-secondary/50 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-secondary/50 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-secondary/50 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-secondary/50 uppercase tracking-wider">Verificado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-secondary/50 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {lista.map(u => (
                  <tr key={u._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-secondary group-hover:text-primary transition-colors">{u.nombre} {u.apellido}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-secondary/70 truncate max-w-[200px]">{u.email}</p>
                      {u.telefono && <p className="text-xs text-secondary/50 font-medium mt-0.5">{u.telefono}</p>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${u.estado ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.estado ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {u.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${u.verificado ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {u.verificado ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditando(u)} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors">
                          Editar
                        </button>
                        {u.estado ? (
                          <button onClick={() => setDesactivando(u)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            Desactivar
                          </button>
                        ) : (
                          u.verificado && <button onClick={() => setActivando(u)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            Activar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista mobile: tarjetas */}
          <div className="md:hidden space-y-4">
            {lista.map(u => (
              <div key={u._id} className="border border-secondary/10 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {u.nombre.charAt(0)}{u.apellido.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-secondary text-lg leading-tight truncate">{u.nombre} {u.apellido}</p>
                    <p className="text-sm text-secondary/60 truncate">{u.email}</p>
                    {u.telefono && <p className="text-xs text-secondary/50 font-medium mt-1">{u.telefono}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${u.estado ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${u.verificado ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {u.verificado ? 'Verificado' : 'Sin verificar'}
                  </span>
                </div>
                <div className="flex gap-2 border-t border-secondary/10 pt-4">
                  <button onClick={() => setEditando(u)} className="flex-1 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-colors">
                    Editar
                  </button>
                  {u.estado ? (
                    <button onClick={() => setDesactivando(u)} className="flex-1 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-colors">
                      Desactivar
                    </button>
                  ) : (
                    u.verificado && <button onClick={() => setActivando(u)} className="flex-1 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-colors">
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {registrando && <ModalRegistrarUsuario onClose={() => setRegistrando(false)} onSuccess={cargar} />}
      {editando && <ModalEditarUsuario usuario={editando} onClose={() => setEditando(null)} onSuccess={cargar} />}
      {desactivando && <ModalDesactivar usuario={desactivando} onClose={() => setDesactivando(null)} onSuccess={cargar} />}
      {activando && <ModalActivar usuario={activando} onClose={() => setActivando(null)} onSuccess={cargar} />}
    </>
  )
}
