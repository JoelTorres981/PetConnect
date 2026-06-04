import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../helpers/authHeaders';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';
import {
    inputCls, labelCls, errCls, btnPrimary
} from '../helpers/formStyles';
import {
    FaUserMd, FaMoneyBill, FaCheckSquare,
    FaEdit, FaSave, FaTimes, FaCamera
} from 'react-icons/fa';
import { comprimirImagen } from '../helpers/comprimirImagen';
import { DataCard } from '../components/DataCard';
import { LoadingScreen } from '../components/LoadingScreen';

const API = import.meta.env.VITE_BACKEND_URL;

const SERVICIOS_OPCIONES = ['PASEO', 'CUIDADO', 'ADIESTRAMIENTO', 'VETERINARIA', 'BAÑO', 'OTROS'];
const SERVICIOS_ICONS = { PASEO: '🐕', CUIDADO: '🏠', ADIESTRAMIENTO: '🎓', VETERINARIA: '🩺', BAÑO: '🛁', OTROS: '✨' };


export const ProfileCuidador = () => {
    const { rol } = storeAuth();
    const { user } = storeProfile();

    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);

    // Selecciones múltiples
    const [serviciosSel, setServiciosSel] = useState([]);

    // Foto de portada (temporal)
    const [portadaPreview, setPortadaPreview] = useState(null);
    const [portadaBase64, setPortadaBase64] = useState(null);

    // Limpiar estados de portada al salir del modo edición
    useEffect(() => {
        if (!editando) {
            setPortadaPreview(null);
            setPortadaBase64(null);
        }
    }, [editando]);

    const handleFilePortada = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('El archivo debe ser una imagen.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('La imagen no puede superar 10 MB.');
            return;
        }
        try {
            const comprimida = await comprimirImagen(file);
            setPortadaPreview(comprimida);
            setPortadaBase64(comprimida);
            toast.success('Foto de portada cargada temporalmente. Presiona "Guardar Cambios" para subirla.');
        } catch (err) {
            toast.error('No se pudo procesar la imagen de portada.');
        }
    };

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    // ── Cargar perfil ──────────────────────────────────────────────
    const cargarPerfil = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/cuidadores/listar-cuidadores`, getAuthHeaders());
            const lista = Array.isArray(res.data) ? res.data : [];
            const miPerfil = lista.find(
                c => c.usuario?._id === user?._id || c.usuario === user?._id
            );
            if (miPerfil) {
                setPerfil(miPerfil);
                setServiciosSel(miPerfil.servicios_ofrecidos || []);
                reset({
                    biografia: miPerfil.biografia || '',
                    tarifa_hora: miPerfil.tarifa_hora ?? '',
                });
            }
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (user?._id) cargarPerfil();
    }, [user?._id]);

    // ── Toggle helpers ─────────────────────────────────────────────
    const toggleServicio = s => setServiciosSel(prev =>
        prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );

    // ── Submit ─────────────────────────────────────────────────────
    const onSubmit = async (data) => {
        if (serviciosSel.length === 0) { toast.error('Selecciona al menos un servicio ofrecido.'); return; }
        try {
            // Subir foto de portada primero si se ha cargado una nueva
            if (portadaBase64) {
                try {
                    await axios.patch(`${API}/cuidadores/actualizar-portada`, {
                        portada_url: portadaBase64
                    }, getAuthHeaders());
                } catch (coverErr) {
                    toast.error(coverErr?.response?.data?.msg || 'Error al subir la foto de portada');
                    return;
                }
            }

            await axios.patch(`${API}/cuidadores/actualizar-perfil`, {
                biografia: data.biografia,
                tarifa_hora: Number(data.tarifa_hora),
                servicios_ofrecidos: serviciosSel,
            }, getAuthHeaders());
            
            toast.success('Perfil de cuidador actualizado correctamente');
            setPortadaPreview(null);
            setPortadaBase64(null);
            setEditando(false);
            cargarPerfil();
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al actualizar');
        }
    };

    // ── Guards ─────────────────────────────────────────────────────
    if (rol !== 'CUIDADOR') {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-secondary">
                <p className="text-5xl">🔒</p>
                <p className="text-lg font-semibold">Esta sección es exclusiva para Cuidadores.</p>
            </div>
        );
    }

    if (loading) {
        return <LoadingScreen message="Cargando perfil..." />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 mt-2">

            {/* ── Encabezado ──────────────────────────────────────── */}
            <div 
                className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-8 text-white shadow-md relative overflow-hidden transition-all duration-500"
                style={(portadaPreview || perfil?.portada_url) ? {
                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.45)), url(${portadaPreview || perfil?.portada_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                } : {}}
            >
                {/* Decoración fondo (solo si no hay portada) */}
                {!(portadaPreview || perfil?.portada_url) && (
                    <>
                        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
                        <div className="absolute -right-2 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
                    </>
                )}

                <div className="relative flex items-center gap-5">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                        <FaUserMd className="text-4xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Informacion Cuidador</h1>
                        <p className="mt-1 opacity-80 text-sm">Completa tu perfil para recibir solicitudes.</p>
                    </div>
                    <button
                        onClick={() => editando ? setEditando(false) : setEditando(true)}
                        className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${editando
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-white text-primary hover:bg-base'
                            }`}
                    >
                        {editando ? <><FaTimes /></> : <><FaEdit /> Editar Perfil</>}
                    </button>
                </div>
            </div>

            {/* ── Vista lectura ────────────────────────────────────── */}
            {!editando && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Biografía */}
                    <DataCard icon={<FaUserMd className="w-5 h-5" />} label="Biografía">
                        <p className="text-secondary text-sm leading-relaxed">
                            {perfil?.biografia || <span className="text-secondary/40 italic">Sin biografía.</span>}
                        </p>
                    </DataCard>

                    {/* Tarifa */}
                    <DataCard icon={<FaMoneyBill className="w-5 h-5" />} label="Tarifa por hora">
                        <p className="text-secondary font-bold text-2xl">
                            ${perfil?.tarifa_hora ?? 0}
                            <span className="text-sm font-normal text-secondary/50"> / hora</span>
                        </p>
                    </DataCard>

                    {/* Horario card removed */}

                    {/* Servicios */}
                    <DataCard icon={<FaCheckSquare className="w-5 h-5" />} label="Servicios ofrecidos">
                        {(perfil?.servicios_ofrecidos || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {perfil.servicios_ofrecidos.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                        {SERVICIOS_ICONS[s] || '✨'} {s}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-secondary/40 italic text-sm">Sin servicios registrados</p>
                        )}
                    </DataCard>
                </div>
            )}

            {/* ── Formulario edición ───────────────────────────────── */}
            {editando && (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                    {/* ── Sección Biografía ─── */}
                    <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm p-6 space-y-2">
                        <h2 className="text-base font-bold text-secondary flex items-center gap-2 mb-4">
                            <FaUserMd className="text-primary" /> Información General
                        </h2>
                        <label className={labelCls}>Biografía *</label>
                        <textarea
                            rows={4}
                            className={inputCls + ' resize-none'}
                            placeholder="Cuéntales a los dueños sobre ti: tu experiencia, amor por los animales, metodología..."
                            {...register('biografia', {
                                required: 'La biografía es obligatoria',
                                validate: v => v.trim().length > 0 || 'La biografía no puede estar vacía.'
                            })}
                        />
                        {errors.biografia && <p className={errCls}>{errors.biografia.message}</p>}
                    </div>

                    {/* ── Sección Foto de Portada ─── */}
                    <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm p-6 space-y-4">
                        <h2 className="text-base font-bold text-secondary flex items-center gap-2 mb-2">
                            <FaCamera className="text-primary" /> Foto de Portada
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Vista previa pequeña */}
                            <div className="w-full sm:w-48 h-28 rounded-xl overflow-hidden border border-secondary/20 bg-base shrink-0 relative shadow-sm">
                                {(portadaPreview || perfil?.portada_url) ? (
                                    <img 
                                        src={portadaPreview || perfil.portada_url} 
                                        alt="Vista previa portada" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-secondary/30 text-xs">
                                        <span>🌄 Sin portada</span>
                                    </div>
                                )}
                            </div>

                            {/* Control de subida */}
                            <div className="flex-1 w-full space-y-2">
                                <label className="block w-full cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 rounded-xl py-3 hover:border-primary transition-colors text-secondary/60 hover:text-primary text-sm font-semibold">
                                        <FaCamera className="w-4 h-4" />
                                        {portadaPreview ? 'Cambiar foto de portada' : 'Seleccionar foto de portada'}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFilePortada} 
                                    />
                                </label>
                                <p className="text-xs text-secondary/40 text-center sm:text-left">Recomendado: Proporción panorámica · JPG, PNG o WEBP · Máx. 10 MB</p>
                                {portadaPreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPortadaPreview(null);
                                            setPortadaBase64(null);
                                        }}
                                        className="text-xs text-red-500 font-bold hover:underline block text-center sm:text-left"
                                    >
                                        Revertir cambios de portada
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Sección Tarifa ─── */}
                    <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm p-6 space-y-2">
                        <h2 className="text-base font-bold text-secondary flex items-center gap-2 mb-4">
                            <FaMoneyBill className="text-primary" /> Tarifa
                        </h2>
                        <label className={labelCls}>
                            Tarifa por hora ($) *
                            <span className="text-secondary/40 font-normal ml-1">(máximo $15)</span>
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={15}
                            step={0.5}
                            className={inputCls}
                            placeholder="Ej: 8"
                            {...register('tarifa_hora', {
                                required: 'La tarifa es obligatoria',
                                min: { value: 0, message: 'La tarifa no puede ser negativa.' },
                                max: { value: 15, message: 'La tarifa no puede exceder los $15' },
                                validate: v => !isNaN(Number(v)) || 'Debe ser un número válido'
                            })}
                        />
                        {errors.tarifa_hora && <p className={errCls}>{errors.tarifa_hora.message}</p>}
                    </div>

                    {/* ── Sección Servicios ─── */}
                    <div className="bg-white rounded-2xl border border-secondary/10 shadow-sm p-6">
                        <h2 className="text-base font-bold text-secondary flex items-center gap-2 mb-4">
                            <FaCheckSquare className="text-primary" /> Servicios Ofrecidos
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {SERVICIOS_OPCIONES.map(s => {
                                const sel = serviciosSel.includes(s);
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => toggleServicio(s)}
                                        className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${sel
                                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                                            : 'bg-base border-secondary/15 text-secondary/50 hover:border-primary/40 hover:text-secondary'
                                            }`}
                                    >
                                        <span className="text-base">{SERVICIOS_ICONS[s]}</span>
                                        {s.charAt(0) + s.slice(1).toLowerCase()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sección Horario removed */}

                    {/* ── Acciones ─── */}
                    <div className="flex justify-end gap-3 pb-6">
                        <button
                            type="button"
                            onClick={() => setEditando(false)}
                            className="border-2 border-secondary/20 text-secondary text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-secondary/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={btnPrimary + ' flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm'}
                        >
                            <FaSave /> {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfileCuidador;
