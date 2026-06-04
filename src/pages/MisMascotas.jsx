import { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FaCamera } from 'react-icons/fa'
import { getAuthHeaders } from '../helpers/authHeaders'
import { comprimirImagen } from '../helpers/comprimirImagen'
import { Modal } from '../components/Modal'
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../helpers/formStyles'
import { LoadingScreen } from '../components/LoadingScreen'
import { useConfirm } from '../context/ConfirmContext'

const API = import.meta.env.VITE_BACKEND_URL

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

// ── Modal Registrar ────────────────────────────────────────────────
const ModalRegistrar = ({ onClose, onSuccess }) => {
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
            toast.success('¡Mascota registrada correctamente!')
            onSuccess()
            onClose()
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al registrar la mascota')
        }
    }

    return (
        <Modal title="Registrar Mascota" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
                <SelectorFoto preview={preview} onChange={handleFoto} />
                <CamposMascota register={register} errors={errors} />
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1'}>
                        {isSubmitting ? 'Registrando...' : 'Registrar'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// ── Modal Editar ───────────────────────────────────────────────────
const ModalEditar = ({ mascota, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            nombre:           mascota.nombre,
            tipo:             mascota.tipo,
            raza:             mascota.raza,
            color:            mascota.color,
            genero:           mascota.genero,
            tamano:           mascota.tamano,
            fecha_nacimiento: mascota.fecha_nacimiento?.split('T')[0] || '',
            descripcion:      mascota.descripcion || '',
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
            toast.success('Mascota actualizada correctamente')
            onSuccess()
            onClose()
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al actualizar')
        }
    }

    return (
        <Modal title={`Editar — ${mascota.nombre}`} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <SelectorFoto preview={preview} onChange={handleFoto} />
                <CamposMascota register={register} errors={errors} />
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1'}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// ── Tarjeta de mascota ─────────────────────────────────────────────
const TarjetaMascota = ({ mascota, onEditar, onDesactivar }) => {
    const generoLabel = mascota.genero === 'M' ? '♂ Macho' : '♀ Hembra'
    const tipoEmoji   = mascota.tipo === 'PERRO' ? '🐕' : mascota.tipo === 'GATO' ? '🐈' : '🐾'
    const edad        = mascota.fecha_nacimiento
        ? `${Math.floor((new Date() - new Date(mascota.fecha_nacimiento)) / (365.25 * 24 * 60 * 60 * 1000))} años`
        : 'Edad desconocida'

    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${!mascota.estado ? 'opacity-60' : 'border-secondary/10'}`}>
            <div className="relative">
                <img
                    src={mascota.foto_principal || 'https://cdn-icons-png.flaticon.com/512/616/616408.png'}
                    alt={mascota.nombre}
                    className="w-full h-40 object-cover bg-base"
                />
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${mascota.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {mascota.estado ? 'Activa' : 'Inactiva'}
                </span>
                <span className="absolute top-3 left-3 text-xl">{tipoEmoji}</span>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-secondary text-lg mb-1">{mascota.nombre}</h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-secondary/60 mb-3">
                    <span>🐾 {mascota.raza}</span>
                    <span>{generoLabel}</span>
                    <span>📏 {mascota.tamano}</span>
                    <span>🎂 {edad}</span>
                    <span className="col-span-2">🎨 {mascota.color}</span>
                </div>
                {mascota.descripcion && (
                    <p className="text-xs text-secondary/50 italic border-t border-secondary/10 pt-2 mb-3 line-clamp-2">
                        {mascota.descripcion}
                    </p>
                )}
                {mascota.estado && (
                    <div className="flex gap-2">
                        <button onClick={() => onEditar(mascota)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                            ✏️ Editar
                        </button>
                        <button onClick={() => onDesactivar(mascota._id)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                            🗑️ Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Página principal ───────────────────────────────────────────────
export const MisMascotas = () => {
    const confirm = useConfirm()
    const [mascotas, setMascotas]       = useState([])
    const [loading, setLoading]         = useState(true)
    const [registrando, setRegistrando] = useState(false)
    const [editando, setEditando]       = useState(null)

    const cargar = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${API}/mascotas/listar`, getAuthHeaders())
            setMascotas(res.data || [])
        } catch {
            toast.error('Error al cargar tus mascotas')
        } finally {
            setLoading(false)
        }
    }

    const desactivar = async (id) => {
        const ok = await confirm({
            title: '⚠️ Eliminar Mascota',
            message: '¿Seguro que deseas eliminar esta mascota? Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar',
            cancelLabel: 'Cancelar',
            variant: 'danger'
        })
        if (!ok) return
        try {
            await axios.delete(`${API}/mascotas/eliminar-mascota/${id}`, getAuthHeaders())
            toast.success('Mascota eliminada')
            cargar()
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al eliminar')
        }
    }

    useEffect(() => { cargar() }, [])

    const activas   = mascotas.filter(m => m.estado)
    const inactivas = mascotas.filter(m => !m.estado)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-secondary">🐾 Mis Mascotas</h1>
                    <p className="text-sm text-secondary/50 mt-0.5">
                        {loading ? 'Cargando...' : `${activas.length} mascota${activas.length !== 1 ? 's' : ''} activa${activas.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <button onClick={() => setRegistrando(true)} className={btnPrimary}>+ Nueva Mascota</button>
            </div>

            {loading ? (
                <LoadingScreen message="Cargando tus mascotas..." />
            ) : mascotas.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-secondary/10 shadow-sm">
                    <p className="text-6xl mb-4">🐶</p>
                    <h3 className="text-lg font-bold text-secondary mb-2">No tienes mascotas registradas</h3>
                    <p className="text-secondary/50 text-sm mb-6">¡Agrega tu primera mascota para comenzar!</p>
                    <button onClick={() => setRegistrando(true)} className={btnPrimary}>+ Registrar Mascota</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                        {activas.map(m => (
                            <TarjetaMascota key={m._id} mascota={m} onEditar={setEditando} onDesactivar={desactivar} />
                        ))}
                    </div>

                    {inactivas.length > 0 && (
                        <details className="bg-white rounded-2xl border border-secondary/10 shadow-sm p-4">
                            <summary className="cursor-pointer text-sm font-semibold text-secondary/50 select-none">
                                🗄️ Mascotas inactivas ({inactivas.length})
                            </summary>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                                {inactivas.map(m => (
                                    <TarjetaMascota key={m._id} mascota={m} onEditar={setEditando} onDesactivar={desactivar} />
                                ))}
                            </div>
                        </details>
                    )}
                </>
            )}

            {registrando && <ModalRegistrar onClose={() => setRegistrando(false)} onSuccess={cargar} />}
            {editando    && <ModalEditar mascota={editando} onClose={() => setEditando(null)} onSuccess={cargar} />}
        </div>
    )
}

export default MisMascotas
