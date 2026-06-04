import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import storeProfile from '../context/storeProfile';
import { FaEnvelope, FaPhone, FaBirthdayCake, FaIdBadge, FaTimes, FaEdit, FaLock, FaCamera } from 'react-icons/fa';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { getAuthHeaders } from '../helpers/authHeaders';
import { comprimirImagen } from '../helpers/comprimirImagen';
import { Modal } from '../components/Modal';
import { inputCls, labelCls, errCls, btnPrimary, btnCancel } from '../helpers/formStyles';
import { DataCard } from '../components/DataCard';
import { LoadingScreen } from '../components/LoadingScreen';

// ──────────────────────────────────────────────
// MODAL: EDITAR PERFIL
// Campos: nombre, apellido, email, telefono, fechaNacimiento
// ──────────────────────────────────────────────

const ModalEditarPerfil = ({ user, onClose, onSuccess }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            nombre: user.nombre || '',
            apellido: user.apellido || '',
            email: user.email || '',
            telefono: user.telefono || '',
            fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.split('T')[0] : '',
        }
    });

    const onSubmit = async (data) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/auth/perfil/${user._id}`;
            await axios.patch(url, data, getAuthHeaders());
            toast.success("Perfil actualizado correctamente");
            onSuccess();
            onClose();
        } catch (error) {
            const msg = error?.response?.data?.msg || "Error al actualizar el perfil";
            toast.error(msg);
        }
    };

    return (
        <Modal title="Editar Perfil" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                        <label className={labelCls}>Nombre</label>
                        <input
                            type="text"
                            className={inputCls}
                            {...register("nombre", {
                                required: "El nombre es obligatorio",
                                validate: value => value.trim().length > 0 || "El nombre no puede estar vacío."
                            })}
                        />
                        {errors.nombre && <p className={errCls}>{errors.nombre.message}</p>}
                    </div>

                    {/* Apellido */}
                    <div>
                        <label className={labelCls}>Apellido</label>
                        <input
                            type="text"
                            className={inputCls}
                            {...register("apellido", {
                                required: "El apellido es obligatorio",
                                validate: value => value.trim().length > 0 || "El apellido no puede estar vacío."
                            })}
                        />
                        {errors.apellido && <p className={errCls}>{errors.apellido.message}</p>}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className={labelCls}>Correo Electrónico</label>
                    <input
                        type="email"
                        className={inputCls}
                        {...register("email", {
                            required: "El correo electrónico es obligatorio",
                            pattern: { value: /\S+@\S+\.\S+/, message: "El email no es válido" }
                        })}
                    />
                    {errors.email && <p className={errCls}>{errors.email.message}</p>}
                </div>

                {/* Teléfono */}
                <div>
                    <label className={labelCls}>Teléfono</label>
                    <input
                        type="tel"
                        placeholder="Ej: 0991234567"
                        className={inputCls}
                        {...register("telefono", {
                            required: "El teléfono es obligatorio",
                            pattern: { value: /^\d{10}$/, message: "El teléfono no es válido, debe contener solo números y tener 10 dígitos" }
                        })}
                    />
                    {errors.telefono && <p className={errCls}>{errors.telefono.message}</p>}
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                    <label className={labelCls}>Fecha de Nacimiento</label>
                    <input
                        type="date"
                        min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 100); return d.toISOString().split('T')[0]; })()}
                        max={new Date().toISOString().split('T')[0]}
                        className={inputCls}
                        {...register("fechaNacimiento", {
                            validate: value => {
                                if (!value) return true;
                                const fecha = new Date(value);
                                const hoy = new Date();
                                const hace100 = new Date();
                                hace100.setFullYear(hoy.getFullYear() - 100);
                                if (fecha > hoy) return "La fecha de nacimiento no puede ser en el futuro.";
                                if (fecha < hace100) return "La fecha de nacimiento no puede ser mayor a 100 años.";
                                return true;
                            }
                        })}
                    />
                    {errors.fechaNacimiento && <p className={errCls}>{errors.fechaNacimiento.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1'}>
                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// ──────────────────────────────────────────────
// MODAL: CAMBIAR CONTRASEÑA
// Campos: passwordactual, passwordnuevo (idéntico al backend)
// ──────────────────────────────────────────────

const ModalCambiarPassword = ({ user, onClose }) => {
    const [showActual, setShowActual] = useState(false);
    const [showNuevo, setShowNuevo] = useState(false);
    const [showConfirmar, setShowConfirmar] = useState(false);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm();
    const passwordNuevo = watch("passwordnuevo");

    const onSubmit = async (data) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/auth/actualizar-password/${user._id}`;
            // Enviamos solo los campos que espera el backend: passwordactual, passwordnuevo
            const payload = { passwordactual: data.passwordactual, passwordnuevo: data.passwordnuevo };
            await axios.put(url, payload, getAuthHeaders());
            toast.success("Se ha actualizado la contraseña correctamente.");
            reset();
            onClose();
        } catch (error) {
            const msg = error?.response?.data?.msg || "Error al cambiar la contraseña";
            toast.error(msg);
        }
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/;

    return (
        <Modal title="Cambiar Contraseña" onClose={onClose}>
            <p className="text-secondary/60 text-sm mb-6">Mín. 16 caracteres, con mayúsculas, minúsculas, números y símbolos.</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Contraseña actual */}
                <div>
                    <label className={labelCls}>Contraseña Actual</label>
                    <div className="relative">
                        <input
                            type={showActual ? "text" : "password"}
                            placeholder="Ingresa tu contraseña actual"
                            className={inputCls}
                            {...register("passwordactual", { required: "Debes ingresar todos los campos" })}
                        />
                        <button type="button" onClick={() => setShowActual(!showActual)} className="absolute top-2.5 right-3 text-secondary/50 hover:text-secondary">
                            {showActual ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                    </div>
                    {errors.passwordactual && <p className={errCls}>{errors.passwordactual.message}</p>}
                </div>

                {/* Nueva contraseña */}
                <div>
                    <label className={labelCls}>Nueva Contraseña</label>
                    <div className="relative">
                        <input
                            type={showNuevo ? "text" : "password"}
                            placeholder="Ingresa tu nueva contraseña"
                            className={inputCls}
                            {...register("passwordnuevo", {
                                required: "Debes ingresar todos los campos",
                                pattern: {
                                    value: passwordRegex,
                                    message: "La contraseña debe tener al menos 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales"
                                }
                            })}
                        />
                        <button type="button" onClick={() => setShowNuevo(!showNuevo)} className="absolute top-2.5 right-3 text-secondary/50 hover:text-secondary">
                            {showNuevo ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                    </div>
                    {errors.passwordnuevo && <p className={errCls}>{errors.passwordnuevo.message}</p>}
                </div>

                {/* Confirmar nueva contraseña */}
                <div>
                    <label className={labelCls}>Confirmar Nueva Contraseña</label>
                    <div className="relative">
                        <input
                            type={showConfirmar ? "text" : "password"}
                            placeholder="Repite tu nueva contraseña"
                            className={inputCls}
                            {...register("confirmarPassword", {
                                required: "Por favor confirma tu nueva contraseña",
                                validate: value => value === passwordNuevo || "Las contraseñas no coinciden"
                            })}
                        />
                        <button type="button" onClick={() => setShowConfirmar(!showConfirmar)} className="absolute top-2.5 right-3 text-secondary/50 hover:text-secondary">
                            {showConfirmar ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                    </div>
                    {errors.confirmarPassword && <p className={errCls}>{errors.confirmarPassword.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className={btnCancel + ' flex-1'}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className={btnPrimary + ' flex-1 !bg-secondary hover:!bg-black'}>
                        {isSubmitting ? "Guardando..." : "Cambiar Contraseña"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

// ──────────────────────────────────────────────
// MODAL: CAMBIAR FOTO DE PERFIL
// Acepta archivo de imagen, lo convierte a base64
// y lo envía como: { imagen: "data:image/..." }
// Ruta: PATCH /api/auth/perfil-foto/:id
// ──────────────────────────────────────────────

const ModalCambiarFoto = ({ user, onClose, onSuccess }) => {
    const [preview, setPreview] = useState(null);
    const [base64, setBase64] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFile = async (e) => {
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
            setPreview(comprimida);
            setBase64(comprimida);
        } catch {
            toast.error('No se pudo procesar la imagen.');
        }
    };


    const handleSubmit = async () => {
        if (!base64) { toast.error('Selecciona una imagen primero.'); return; }
        setLoading(true);
        try {
            const API = import.meta.env.VITE_BACKEND_URL;
            await axios.patch(
                `${API}/auth/perfil-foto/${user._id}`,
                { imagen: base64 },
                getAuthHeaders()
            );
            toast.success('Foto de perfil actualizada');
            onSuccess();
            onClose();
        } catch (e) {
            toast.error(e?.response?.data?.msg || 'Error al actualizar la foto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Cambiar Foto de Perfil" onClose={onClose}>
            {/* Preview */}
            <div className="flex justify-center mb-5">
                <img
                    src={preview || user.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                    alt="preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/30 shadow-md bg-base"
                />
            </div>

            {/* Input file */}
            <label className="block w-full cursor-pointer">
                <div className="flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 rounded-xl py-3 hover:border-primary transition-colors text-secondary/60 hover:text-primary text-sm font-semibold">
                    <FaCamera className="w-4 h-4" />
                    {preview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            <p className="text-xs text-secondary/40 text-center mt-2">JPG, PNG o WEBP · Máx. 10 MB</p>

            <div className="flex gap-3 mt-5">
                <button onClick={onClose} className={btnCancel + ' flex-1'}>
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!base64 || loading}
                    className={btnPrimary + ' flex-1'}
                >
                    {loading ? 'Subiendo...' : 'Guardar Foto'}
                </button>
            </div>
        </Modal>
    );
};

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL: PROFILE
// ──────────────────────────────────────────────

export const Profile = () => {
    const { user, profile } = storeProfile();
    const [showEditarPerfil, setShowEditarPerfil] = useState(false);
    const [showCambiarPassword, setShowCambiarPassword] = useState(false);
    const [showCambiarFoto, setShowCambiarFoto] = useState(false);

    if (!user) {
        return <LoadingScreen message="Cargando información del perfil..." />;
    }

    return (
        <>
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden mt-2">
                {/* Cabecera con foto y nombre */}
                <div className="bg-gradient-to-r from-primary to-primary-hover p-8 text-center text-white relative">
                    {/* Avatar clicable */}
                    <div className="relative inline-block mb-4">
                        <img
                            src={user.avatar_url || "https://cdn-icons-png.flaticon.com/512/4715/4715329.png"}
                            alt="Perfil"
                            className="w-32 h-32 rounded-full mx-auto border-4 border-white object-cover shadow-md bg-white"
                        />
                        <button
                            onClick={() => setShowCambiarFoto(true)}
                            title="Cambiar foto de perfil"
                            className="absolute bottom-1 right-1 bg-white text-primary rounded-full p-2 shadow-md hover:bg-primary hover:text-white transition-colors"
                        >
                            <FaCamera className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold">{user.nombre} {user.apellido}</h2>
                    <p className="mt-1 font-medium text-lg uppercase tracking-wider opacity-80">{user.rol}</p>
                </div>

                {/* Información personal */}
                <div className="p-8">
                    <h3 className="text-xl font-bold text-secondary mb-6 border-b border-gray-200 pb-2">Información Personal</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DataCard
                            icon={<FaEnvelope className="w-5 h-5" />}
                            label="Correo Electrónico"
                            className="bg-base"
                        >
                            <p className="text-secondary font-medium truncate">{user.email}</p>
                        </DataCard>

                        <DataCard
                            icon={<FaPhone className="w-5 h-5" />}
                            label="Teléfono"
                            className="bg-base"
                        >
                            <p className="text-secondary font-medium">{user.telefono || "No especificado"}</p>
                        </DataCard>

                        <DataCard
                            icon={<FaBirthdayCake className="w-5 h-5" />}
                            label="Fecha de Nacimiento"
                            className="bg-base"
                        >
                            <p className="text-secondary font-medium">
                                {user.fechaNacimiento
                                    ? new Date(user.fechaNacimiento).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : "No especificada"}
                            </p>
                        </DataCard>

                        <DataCard
                            icon={<FaIdBadge className="w-5 h-5" />}
                            label="Estado de la cuenta"
                            className="bg-base"
                        >
                            <p className="text-secondary font-medium">
                                {user.verificado
                                    ? <span className="text-green-600 font-bold">Verificada ✓</span>
                                    : <span className="text-red-500 font-bold">Sin Verificar ✗</span>}
                            </p>
                        </DataCard>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => setShowEditarPerfil(true)}
                            className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-md"
                        >
                            <FaEdit /> Editar Perfil
                        </button>
                        <button
                            onClick={() => setShowCambiarPassword(true)}
                            className="flex items-center justify-center gap-2 bg-secondary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-black transition-colors shadow-md"
                        >
                            <FaLock /> Cambiar Contraseña
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales */}
            {showEditarPerfil && (
                <ModalEditarPerfil
                    user={user}
                    onClose={() => setShowEditarPerfil(false)}
                    onSuccess={profile}
                />
            )}
            {showCambiarPassword && (
                <ModalCambiarPassword
                    user={user}
                    onClose={() => setShowCambiarPassword(false)}
                />
            )}
            {showCambiarFoto && (
                <ModalCambiarFoto
                    user={user}
                    onClose={() => setShowCambiarFoto(false)}
                    onSuccess={profile}
                />
            )}
        </>
    );
};

export default Profile;
