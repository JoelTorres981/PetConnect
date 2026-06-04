import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../../helpers/authHeaders';
import { Modal } from '../Modal';
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../../helpers/formStyles';

import { FaCamera } from 'react-icons/fa';
import { comprimirImagen } from '../../helpers/comprimirImagen';

const API = import.meta.env.VITE_BACKEND_URL;

// ── Selector de foto (reutilizable internamente) ───────────────────
const SelectorFoto = ({ preview, onChange }) => (
    <div className="flex flex-col items-center gap-2 mb-1">
        <div className="relative">
            <img
                src={preview || 'https://cdn-icons-png.flaticon.com/512/616/616408.png'}
                alt="foto mascota"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow bg-base"
            />
            <label className="absolute bottom-0 right-0 bg-white text-primary rounded-full p-1.5 shadow cursor-pointer hover:bg-primary hover:text-white transition-colors">
                <FaCamera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={onChange} />
            </label>
        </div>
        <p className="text-xs text-secondary/40">Toca la cámara para cambiar la foto · Máx. 10 MB</p>
    </div>
)

// ── Campos comunes del formulario de mascota ───────────────────────
const CamposMascota = ({ register, errors }) => (
    <>
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className={labelCls}>Nombre *</label>
                <input className={inputCls} {...register('nombre', { required: 'Obligatorio' })} />
                {errors.nombre && <p className={errCls}>{errors.nombre.message}</p>}
            </div>
            <div>
                <label className={labelCls}>Tipo *</label>
                <select className={inputCls} defaultValue="" {...register('tipo', { required: 'Obligatorio' })}>
                    <option value="" disabled>Tipo</option>
                    <option value="PERRO">🐕 Perro</option>
                    <option value="GATO">🐈 Gato</option>
                    <option value="OTRO">🐾 Otro</option>
                </select>
                {errors.tipo && <p className={errCls}>{errors.tipo.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className={labelCls}>Raza *</label>
                <input className={inputCls} placeholder="Ej: Labrador" {...register('raza', { required: 'Obligatorio' })} />
                {errors.raza && <p className={errCls}>{errors.raza.message}</p>}
            </div>
            <div>
                <label className={labelCls}>Color *</label>
                <input className={inputCls} placeholder="Ej: Marrón" {...register('color', { required: 'Obligatorio' })} />
                {errors.color && <p className={errCls}>{errors.color.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className={labelCls}>Género *</label>
                <select className={inputCls} defaultValue="" {...register('genero', { required: 'Obligatorio' })}>
                    <option value="" disabled>Género</option>
                    <option value="M">♂ Macho</option>
                    <option value="H">♀ Hembra</option>
                </select>
                {errors.genero && <p className={errCls}>{errors.genero.message}</p>}
            </div>
            <div>
                <label className={labelCls}>Tamaño *</label>
                <select className={inputCls} defaultValue="" {...register('tamano', { required: 'Obligatorio' })}>
                    <option value="" disabled>Tamaño</option>
                    <option value="PEQUEÑO">Pequeño</option>
                    <option value="MEDIANO">Mediano</option>
                    <option value="GRANDE">Grande</option>
                </select>
                {errors.tamano && <p className={errCls}>{errors.tamano.message}</p>}
            </div>
        </div>

        <div>
            <label className={labelCls}>Fecha de nacimiento *</label>
            <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 30); return d.toISOString().split('T')[0] })()}
                className={inputCls}
                {...register('fecha_nacimiento', { required: 'Obligatorio' })}
            />
            {errors.fecha_nacimiento && <p className={errCls}>{errors.fecha_nacimiento.message}</p>}
        </div>

        <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea rows={2} className={inputCls + ' resize-none'} placeholder="Información adicional..." {...register('descripcion')} />
        </div>
    </>
)
// ─── Modal Registrar Mascota ─────────────────────────────────────
const ModalRegistrarMascota = ({ duenos, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [fotoBase64, setFotoBase64] = useState(null)
  const [preview, setPreview]       = useState(null)

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Solo se aceptan imágenes'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Máximo 10 MB'); return }
    try {
      const comp = await comprimirImagen(file)
      setFotoBase64(comp)
      setPreview(comp)
    } catch { toast.error('Error al procesar la imagen') }
  }

  const onSubmit = async (data) => {
    try {
      const payload = fotoBase64 ? { ...data, foto_principal: fotoBase64 } : data
      await axios.post(`${API}/mascotas/registro`, payload, getAuthHeaders())
      toast.success('Mascota registrada'); onSuccess(); onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || 'Error') }
  }
  return (
    <Modal title="Registrar Mascota" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <SelectorFoto preview={preview} onChange={handleFoto} />
        <div>
          <label className={labelCls}>Dueño *</label>
          <select className={inputCls} defaultValue="" {...register('owner_id', { required: 'Obligatorio' })}>
            <option value="" disabled>Selecciona un dueño</option>
            {duenos.map(d => <option key={d._id} value={d._id}>{d.nombre} {d.apellido} — {d.email}</option>)}
          </select>
          {errors.owner_id && <p className={errCls}>{errors.owner_id.message}</p>}
        </div>
        
        <CamposMascota register={register} errors={errors} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={btnPrimary + " flex-1"}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal Editar Mascota ────────────────────────────────────────
const ModalEditarMascota = ({ mascota, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre: mascota.nombre,
      tipo: mascota.tipo,
      raza: mascota.raza,
      color: mascota.color,
      genero: mascota.genero,
      tamano: mascota.tamano,
      fecha_nacimiento: mascota.fecha_nacimiento?.split('T')[0] || '',
      descripcion: mascota.descripcion || '',
    }
  })
  
  const [fotoBase64, setFotoBase64] = useState(null)
  const [preview, setPreview]       = useState(mascota.foto_principal || null)

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Solo se aceptan imágenes'); return }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Máximo 10 MB'); return }
    try {
      const comp = await comprimirImagen(file)
      setFotoBase64(comp)
      setPreview(comp)
    } catch { toast.error('Error al procesar la imagen') }
  }

  const onSubmit = async (data) => {
    try {
      const payload = fotoBase64 ? { ...data, foto_principal: fotoBase64 } : data
      await axios.patch(`${API}/mascotas/actualizar-mascota/${mascota._id}`, payload, getAuthHeaders())
      toast.success('Mascota actualizada'); onSuccess(); onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || 'Error') }
  }
  return (
    <Modal title={`Editar — ${mascota.nombre}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <SelectorFoto preview={preview} onChange={handleFoto} />
        <CamposMascota register={register} errors={errors} />
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1'}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const ModalAsignarDueno = ({ mascota, duenos, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const onSubmit = async (data) => {
    try {
      await axios.patch(`${API}/mascotas/actualizar-dueno/${mascota._id}`, data, getAuthHeaders())
      toast.success('Dueño actualizado'); onSuccess(); onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || e?.response?.data?.message || 'Error') }
  }
  return (
    <Modal title={`Asignar Dueño — ${mascota.nombre}`} onClose={onClose}>
      {mascota.owner_id && (
        <p className="text-sm text-secondary/60 bg-primary-lighter rounded-lg px-4 py-2 mb-4">
          Dueño actual: <strong>{mascota.owner_id.nombre} {mascota.owner_id.apellido}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Nuevo dueño</label>
          <select className={inputCls} defaultValue="" {...register('nuevoDuenoID', { required: 'Obligatorio' })}>
            <option value="" disabled>Selecciona un dueño</option>
            {duenos.filter(d => d._id !== mascota.owner_id?._id).map(d => (
              <option key={d._id} value={d._id}>{d.nombre} {d.apellido} — {d.email}</option>
            ))}
          </select>
          {errors.nuevoDuenoID && <p className={errCls}>{errors.nuevoDuenoID.message}</p>}
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button type="submit" disabled={isSubmitting} className={btnPrimary + " flex-1"}>{isSubmitting ? 'Asignando...' : 'Asignar'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Modal Confirmar Desactivación ───────────────────────────────
const ModalDesactivar = ({ mascota, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const confirmar = async () => {
    setLoading(true)
    try {
      const res = await axios.delete(`${API}/mascotas/eliminar-mascota/${mascota._id}`, getAuthHeaders())
      toast.success(res.data.msg || 'Mascota desactivada')
      onSuccess()
      onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || 'Error') } finally { setLoading(false) }
  }

  return (
    <Modal title="⚠️ Confirmar Desactivación" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm">
          <p className="font-bold mb-1">Desactivar Mascota</p>
          <p>Al continuar, la mascota quedará oculta y no podrá ser utilizada en servicios ni anuncios.</p>
        </div>
        <p className="text-secondary font-medium">¿Estás seguro de que deseas desactivar a {mascota.nombre}?</p>
        
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={btnCancel + " flex-1"}>Cancelar</button>
          <button onClick={confirmar} disabled={loading} className={`${btnPrimary} flex-1 !bg-red-500 hover:!bg-red-600 border-none`}>
            {loading ? 'Procesando...' : 'Sí, Desactivar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Modal Confirmar Activación ───────────────────────────────
const ModalActivar = ({ mascota, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const confirmar = async () => {
    setLoading(true)
    try {
      const res = await axios.patch(`${API}/mascotas/activar-mascota/${mascota._id}`, {}, getAuthHeaders())
      toast.success(res.data.msg || 'Mascota activada')
      onSuccess()
      onClose()
    } catch (e) { toast.error(e?.response?.data?.msg || 'Error') } finally { setLoading(false) }
  }

  return (
    <Modal title="✅ Activar Mascota" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm">
          <p className="font-bold mb-1">Reactivar Mascota</p>
          <p>Al continuar, la mascota volverá a estar visible y disponible en la plataforma.</p>
        </div>
        <p className="text-secondary font-medium">¿Estás seguro de que deseas reactivar a {mascota.nombre}?</p>
        
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

// ─── Tabla Mascotas ──────────────────────────────────────────────
export const TablaMascotas = () => {
  const [mascotas, setMascotas] = useState([])
  const [duenos, setDuenos] = useState([])
  const [loading, setLoading] = useState(true)
  const [registrando, setRegistrando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [asignando, setAsignando] = useState(null)
  const [desactivando, setDesactivando] = useState(null)
  const [activando, setActivando] = useState(null)

  const cargar = async () => {
    setLoading(true)
    try {
      const [mRes, dRes] = await Promise.all([
        axios.get(`${API}/mascotas/listar`, getAuthHeaders()),
        axios.get(`${API}/administrador/usuarios?rol=DUEÑO`, getAuthHeaders()),
      ])
      setMascotas(mRes.data || [])
      setDuenos(dRes.data.usuarios || [])
    } catch { toast.error('Error al cargar') } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  if (loading) return <p className="text-center py-10 text-secondary/50 animate-pulse">Cargando...</p>

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setRegistrando(true)} className={btnPrimary}>+ Nueva</button>
      </div>

      {mascotas.length === 0 ? (
        <p className="text-center py-12 text-secondary/40">No hay mascotas registradas</p>
      ) : (
        <>
          {/* Vista desktop: tabla */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-secondary/10 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-secondary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-secondary/50 uppercase tracking-wider">Mascota</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-secondary/50 uppercase tracking-wider">Detalles</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-secondary/50 uppercase tracking-wider hidden lg:table-cell">Dueño Actual</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-secondary/50 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-secondary/50 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                {mascotas.map(m => (
                  <tr key={m._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={m.foto_principal || 'https://cdn-icons-png.flaticon.com/512/616/616408.png'} alt={m.nombre}
                          className="w-12 h-12 rounded-xl object-cover shadow-sm bg-base flex-shrink-0" />
                        <div>
                          <p className="font-bold text-secondary group-hover:text-primary transition-colors text-base">{m.nombre}</p>
                          <p className="text-xs text-secondary/50 font-medium mt-0.5">{m.genero === 'M' ? 'Macho' : 'Hembra'} · {m.tamano}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-secondary/70 font-medium">{m.tipo}</p>
                      <p className="text-xs text-secondary/50 mt-0.5">{m.raza}</p>
                    </td>
                    <td className="px-6 py-4 text-secondary/70 font-medium hidden lg:table-cell">
                      {m.owner_id ? `${m.owner_id.nombre} ${m.owner_id.apellido}` : <span className="text-secondary/40 italic">Sin dueño</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${m.estado ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${m.estado ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {m.estado ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditando(m)} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition-colors">
                          Editar
                        </button>
                        <button onClick={() => setAsignando(m)} className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg text-xs font-bold transition-colors">
                          Asignar dueño
                        </button>
                        {m.estado ? (
                          <button onClick={() => setDesactivando(m)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            Desactivar
                          </button>
                        ) : (
                          <button onClick={() => setActivando(m)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
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
            {mascotas.map(m => (
              <div key={m._id} className="border border-secondary/10 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <img src={m.foto_principal || 'https://cdn-icons-png.flaticon.com/512/616/616408.png'} alt={m.nombre}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-base flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-secondary text-lg leading-tight truncate">{m.nombre}</p>
                    <p className="text-xs text-secondary/60 mt-1">{m.tipo} · {m.raza}</p>
                    <p className="text-xs text-secondary/50 mt-0.5">{m.genero === 'M' ? 'Macho' : 'Hembra'} · {m.tamano}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-secondary/40 font-bold mb-0.5">Dueño asignado</p>
                    <p className="text-sm font-semibold text-secondary/80">
                      {m.owner_id ? `${m.owner_id.nombre} ${m.owner_id.apellido}` : <span className="text-secondary/40 italic">No asignado</span>}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${m.estado ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {m.estado ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-secondary/10 pt-4">
                  <button onClick={() => setEditando(m)} className="py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-colors">
                    Editar
                  </button>
                  <button onClick={() => setAsignando(m)} className="py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-xl text-xs font-bold transition-colors">
                    Asignar dueño
                  </button>
                  {m.estado ? (
                    <button onClick={() => setDesactivando(m)} className="col-span-2 py-2 mt-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-colors">
                      Desactivar
                    </button>
                  ) : (
                    <button onClick={() => setActivando(m)} className="col-span-2 py-2 mt-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-xs font-bold transition-colors">
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {registrando && <ModalRegistrarMascota duenos={duenos} onClose={() => setRegistrando(false)} onSuccess={cargar} />}
      {editando && <ModalEditarMascota mascota={editando} onClose={() => setEditando(null)} onSuccess={cargar} />}
      {asignando && <ModalAsignarDueno mascota={asignando} duenos={duenos} onClose={() => setAsignando(null)} onSuccess={cargar} />}
      {desactivando && <ModalDesactivar mascota={desactivando} onClose={() => setDesactivando(null)} onSuccess={cargar} />}
      {activando && <ModalActivar mascota={activando} onClose={() => setActivando(null)} onSuccess={cargar} />}
    </>
  )
}
