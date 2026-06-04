import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '../helpers/authHeaders';
import { Modal } from '../components/Modal';
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../helpers/formStyles';
import { FaSyringe, FaBug, FaStethoscope, FaInfoCircle, FaCheckCircle, FaTrashAlt, FaCalendarCheck, FaClock, FaEnvelope, FaBell, FaBellSlash } from 'react-icons/fa';
import { LoadingScreen } from '../components/LoadingScreen';
import { useConfirm } from '../context/ConfirmContext';

const API = import.meta.env.VITE_BACKEND_URL;

const TIPO_OPCIONES = [
    { value: 'VACUNA', label: 'Vacuna', icon: <FaSyringe className="text-blue-500" /> },
    { value: 'DESPARASITACION', label: 'Desparasitación', icon: <FaBug className="text-orange-500" /> },
    { value: 'CONTROL', label: 'Control Veterinario', icon: <FaStethoscope className="text-green-500" /> },
    { value: 'OTRO', label: 'Otro', icon: <FaInfoCircle className="text-secondary/50" /> },
];

// ── Modal para registrar compromiso ───────────────────────────────
const ModalRegistrarCompromiso = ({ mascotas, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            await axios.post(`${API}/compromisos-sanitarios/crear`, data, getAuthHeaders());
            toast.success('¡Compromiso sanitario creado correctamente!');
            onSuccess();
            onClose();
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al crear el compromiso');
        }
    };

    return (
        <Modal title="Nuevo Compromiso Sanitario" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                {/* Info de notificaciones */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
                    <FaEnvelope className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Te enviaremos recordatorios automáticos antes de la fecha del compromiso.
                    </p>
                </div>

                {/* Mascota */}
                <div>
                    <label className={labelCls}>Mascota *</label>
                    <select className={inputCls} defaultValue="" {...register('mascota_id', { required: 'Obligatorio' })}>
                        <option value="" disabled>Selecciona una mascota</option>
                        {mascotas.map(m => (
                            <option key={m._id} value={m._id}>{m.nombre} ({m.tipo})</option>
                        ))}
                    </select>
                    {errors.mascota_id && <p className={errCls}>{errors.mascota_id.message}</p>}
                </div>

                {/* Tipo de Compromiso (Opción Múltiple) */}
                <div>
                    <label className={labelCls}>Tipo de Compromiso *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {TIPO_OPCIONES.map(op => (
                            <label key={op.value} className="cursor-pointer">
                                <input
                                    type="radio"
                                    value={op.value}
                                    className="peer sr-only"
                                    {...register('tipo', { required: 'Selecciona un tipo' })}
                                />
                                <div className="flex items-center gap-2 p-3 border border-secondary/20 rounded-xl peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary transition-all bg-white hover:bg-secondary/5">
                                    {op.icon}
                                    <span className="text-sm font-semibold">{op.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                    {errors.tipo && <p className={errCls}>{errors.tipo.message}</p>}
                </div>

                {/* Fecha */}
                <div>
                    <label className={labelCls}>Próxima Fecha *</label>
                    <input
                        type="date"
                        min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })()}
                        className={inputCls}
                        {...register('proxima_fecha', { required: 'La fecha es obligatoria' })}
                    />
                    {errors.proxima_fecha && <p className={errCls}>{errors.proxima_fecha.message}</p>}
                </div>

                {/* Descripción */}
                <div>
                    <label className={labelCls}>Descripción (opcional)</label>
                    <textarea
                        rows={2}
                        className={inputCls + ' resize-none'}
                        placeholder="Ej: Vacuna antirrábica anual..."
                        {...register('descripcion')}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1'}>
                        {isSubmitting ? 'Guardando...' : 'Crear Compromiso'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


// ── Tarjeta de Compromiso ─────────────────────────────────────────
const TarjetaCompromiso = ({ compromiso, onCompletar, onEliminar }) => {
    const { mascota_id, tipo, descripcion, proxima_fecha, estado, fecha_completado, recordatorios_enviados = [] } = compromiso;
    const esCompletado = estado === 'COMPLETADO';

    const icono = TIPO_OPCIONES.find(op => op.value === tipo)?.icon || <FaInfoCircle />;
    const labelTipo = TIPO_OPCIONES.find(op => op.value === tipo)?.label || tipo;

    const fechaFormat = new Date(proxima_fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    const fechaCompFormat = fecha_completado ? new Date(fecha_completado).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

    // Mapeo de recordatorios
    const RECORDATORIOS = [
        { dias: 7, label: '7 días antes', color: 'blue' },
        { dias: 3, label: '3 días antes', color: 'orange' },
        { dias: 0, label: 'El mismo día', color: 'red' },
    ];

    return (
        <div className={`bg-white rounded-2xl border shadow-sm p-5 relative overflow-hidden transition-all hover:shadow-md flex flex-col h-full ${esCompletado ? 'border-green-200 bg-green-50/30 opacity-80' : 'border-secondary/10'}`}>
            {/* Cabecera */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${esCompletado ? 'bg-green-100' : 'bg-primary/10'}`}>
                        {icono}
                    </div>
                    <div>
                        <h3 className={`font-bold ${esCompletado ? 'text-green-800' : 'text-secondary'}`}>{labelTipo}</h3>
                        <p className="text-xs font-semibold text-secondary/60">Mascota: <span className="text-primary">{mascota_id?.nombre || 'Desconocida'}</span></p>
                    </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${esCompletado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {estado}
                </span>
            </div>

            {/* Fechas */}
            <div className="bg-base rounded-xl p-3 mb-3 border border-secondary/5">
                <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-secondary">
                    <FaCalendarCheck className={esCompletado ? 'text-green-500' : 'text-primary'} />
                    <span>{esCompletado ? 'Estaba programado para:' : 'Programado para:'}</span>
                </div>
                <p className="text-sm text-secondary/70 capitalize">{fechaFormat}</p>
                {esCompletado && (
                    <p className="text-xs text-green-600 mt-1 font-semibold">Completado el: {fechaCompFormat}</p>
                )}
            </div>

            {/* Descripción — altura fija para que no empuje nada */}
            <div className="min-h-[2.5rem] mb-3">
                {descripcion ? (
                    <p className="text-xs text-secondary/60 italic border-l-2 border-secondary/20 pl-2 line-clamp-2">
                        "{descripcion}"
                    </p>
                ) : (
                    <p className="text-xs text-secondary/30 italic pl-2">Sin descripción</p>
                )}
            </div>

            {/* Notificaciones Enviadas — crece para llenar espacio disponible */}
            <div className="flex-grow mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary/40 mb-2 flex items-center gap-1">
                    <FaBell className="text-[10px]" /> Recordatorios por correo
                </p>
                <div className="flex gap-1.5 flex-wrap">
                    {RECORDATORIOS.map(r => {
                        const enviado = recordatorios_enviados.includes(r.dias);
                        const colorMap = {
                            blue: enviado ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200',
                            orange: enviado ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-400 border-gray-200',
                            red: enviado ? 'bg-red-100 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200',
                        };
                        return (
                            <span
                                key={r.dias}
                                title={enviado ? `Recordatorio enviado ${r.label}` : `Pendiente: ${r.label}`}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorMap[r.color]}`}
                            >
                                {enviado ? <FaBell className="text-[9px]" /> : <FaBellSlash className="text-[9px]" />}
                                {r.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Acciones — siempre al fondo */}
            <div className="flex gap-2 pt-2 border-t border-secondary/10">
                {!esCompletado && (
                    <button
                        onClick={() => onCompletar(compromiso._id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-lg bg-green-100 text-green-700 hover:bg-green-500 hover:text-white transition-colors"
                    >
                        <FaCheckCircle /> Completar
                    </button>
                )}
                <button
                    onClick={() => onEliminar(compromiso._id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                    <FaTrashAlt /> Eliminar
                </button>
            </div>
        </div>
    );
};


// ── Página Principal ──────────────────────────────────────────────
export const CompromisosSanitarios = () => {
    const confirm = useConfirm();
    const [compromisos, setCompromisos] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registrando, setRegistrando] = useState(false);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar mascotas
            const resMascotas = await axios.get(`${API}/mascotas/listar`, getAuthHeaders());
            // Guardamos solo las mascotas activas (o todas si lo permite la lógica)
            const activas = Array.isArray(resMascotas.data) ? resMascotas.data.filter(m => m.estado) : [];
            setMascotas(activas);

            // Cargar compromisos
            const resCompromisos = await axios.get(`${API}/compromisos-sanitarios/listar`, getAuthHeaders());
            if (Array.isArray(resCompromisos.data)) {
                setCompromisos(resCompromisos.data);
            } else {
                setCompromisos([]); // El backend devuelve un mensaje de error 500 en lugar de array vacío (visto en el controller), lo atrapamos en el catch
            }
        } catch (error) {
            // Si el backend lanza error (como el 500 cuando está vacío), seteamos el array vacío
            setCompromisos([]);
            if (error?.response?.status !== 500 && error?.response?.status !== 404) {
                toast.error('Error al cargar la información');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const completar = async (id) => {
        const ok = await confirm({
            title: '💡 Completar Compromiso',
            message: '¿Marcar este compromiso sanitario como completado? Esto registrará que la tarea ha sido realizada con éxito.',
            confirmLabel: 'Completar',
            cancelLabel: 'Volver',
            variant: 'primary'
        });
        if (!ok) return;
        try {
            await axios.patch(`${API}/compromisos-sanitarios/completar/${id}`, {}, getAuthHeaders());
            toast.success('Compromiso completado');
            cargarDatos();
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al completar');
        }
    };

    const eliminar = async (id) => {
        const ok = await confirm({
            title: '⚠️ Eliminar Compromiso',
            message: '¿Seguro que deseas eliminar este compromiso sanitario? Esta acción es irreversible.',
            confirmLabel: 'Eliminar',
            cancelLabel: 'Cancelar',
            variant: 'danger'
        });
        if (!ok) return;
        try {
            await axios.delete(`${API}/compromisos-sanitarios/eliminar/${id}`, getAuthHeaders());
            toast.success('Compromiso eliminado');
            cargarDatos();
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al eliminar');
        }
    };

    const pendientes = compromisos.filter(c => c.estado === 'PENDIENTE');
    const completados = compromisos.filter(c => c.estado === 'COMPLETADO');

    // Estadísticas de notificaciones
    const totalEnviados7 = compromisos.filter(c => c.recordatorios_enviados?.includes(7)).length;
    const totalEnviados3 = compromisos.filter(c => c.recordatorios_enviados?.includes(3)).length;
    const totalEnviados0 = compromisos.filter(c => c.recordatorios_enviados?.includes(0)).length;
    const totalNotificaciones = totalEnviados7 + totalEnviados3 + totalEnviados0;

    return (
        <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary">⚕️ Compromisos Sanitarios</h1>
                    <p className="text-sm text-secondary/50 mt-0.5">
                        {loading ? 'Cargando...' : `Tienes ${pendientes.length} compromiso(s) pendiente(s)`}
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (mascotas.length === 0) {
                            toast.error('Debes registrar al menos una mascota activa primero.');
                            return;
                        }
                        setRegistrando(true);
                    }}
                    className={btnPrimary}
                >
                    + Nuevo Compromiso
                </button>
            </div>

            {loading ? (
                <LoadingScreen message="Cargando historial médico..." />
            ) : compromisos.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-secondary/10 shadow-sm">
                    <p className="text-6xl mb-4 text-green-500">🛡️</p>
                    <h3 className="text-lg font-bold text-secondary mb-2">No hay compromisos registrados</h3>
                    <p className="text-secondary/50 text-sm mb-6">Lleva el control de vacunas, desparasitaciones y consultas de tus mascotas.</p>
                    <button
                        onClick={() => {
                            if (mascotas.length === 0) {
                                toast.error('Debes registrar al menos una mascota activa primero.');
                                return;
                            }
                            setRegistrando(true);
                        }}
                        className={btnPrimary}
                    >
                        + Agendar Compromiso
                    </button>
                </div>
            ) : (
                <>
                    {/* Panel de Notificaciones Enviadas */}
                    {totalNotificaciones > 0 && (
                        <div className="mb-6 bg-white rounded-2xl border border-secondary/10 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-secondary mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><FaBell /></span>
                                Historial de Notificaciones Enviadas
                                <span className="ml-auto text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                                    {totalNotificaciones} correo(s) en total
                                </span>
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                                    <FaEnvelope className="text-blue-500 text-lg mb-1" />
                                    <span className="text-2xl font-bold text-blue-700">{totalEnviados7}</span>
                                    <span className="text-[10px] font-semibold text-blue-500 mt-0.5">7 días antes</span>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
                                    <FaEnvelope className="text-orange-500 text-lg mb-1" />
                                    <span className="text-2xl font-bold text-orange-700">{totalEnviados3}</span>
                                    <span className="text-[10px] font-semibold text-orange-500 mt-0.5">3 días antes</span>
                                </div>
                                <div className="flex flex-col items-center justify-center bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                                    <FaEnvelope className="text-red-500 text-lg mb-1" />
                                    <span className="text-2xl font-bold text-red-600">{totalEnviados0}</span>
                                    <span className="text-[10px] font-semibold text-red-500 mt-0.5">El mismo día</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-secondary/40 mt-3 flex items-center gap-1">
                                <FaBell className="text-[10px]" />
                                Los recordatorios se envían automáticamente a las 9:00 AM, 7 días, 3 días y el mismo día del compromiso.
                            </p>
                        </div>
                    )}

                    {/* Pendientes */}
                    {pendientes.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                                <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-lg"><FaClock /></span> Pendientes
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                                {pendientes.map(c => (
                                    <TarjetaCompromiso key={c._id} compromiso={c} onCompletar={completar} onEliminar={eliminar} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completados */}
                    {completados.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2 border-t border-secondary/10 pt-6">
                                <span className="bg-green-100 text-green-700 p-1.5 rounded-lg"><FaCheckCircle /></span> Historial (Completados)
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-80 items-stretch">
                                {completados.map(c => (
                                    <TarjetaCompromiso key={c._id} compromiso={c} onCompletar={completar} onEliminar={eliminar} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {registrando && <ModalRegistrarCompromiso mascotas={mascotas} onClose={() => setRegistrando(false)} onSuccess={cargarDatos} />}
        </div>
    );
};

export default CompromisosSanitarios;
