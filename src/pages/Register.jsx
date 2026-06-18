import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"
import { useFetch } from "../hooks/useFetch"
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'

export const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const fetchDataBackend = useFetch()
    const { register, handleSubmit, formState: { errors } } = useForm()

    const registerUser = async (dataForm) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/auth/registro`
        const res = await fetchDataBackend(url, dataForm, "POST")
        if (res) {
            navigate("/login")
        }
    }

    return (
        <div className="relative h-screen">
            {/* Overlay suave para mejorar contraste (solo fondo) */}
            <div className="absolute inset-0 bg-black/30 z-0" aria-hidden="true" />

            {/* Botón Volver al inicio */}
            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md transition-all hover:-translate-x-1 font-medium text-sm">
                    <MdArrowBack className="text-lg" /> Inicio
                </Link>
            </div>

            {/* Contenedor centrado del formulario (ventana flotante opaca) */}
            <div className="flex items-center justify-center h-full">
                <div className="w-11/12 max-w-md rounded-xl shadow-lg p-6 sm:p-8 relative z-10 bg-base">

                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-secondary">Bienvenido</h1>
                    <small className="block my-4 text-sm text-secondary">Por favor ingresa tus datos</small>

                    <form onSubmit={handleSubmit(registerUser)} noValidate>

                        {/* Campo para nombre */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Nombre</label>
                            <input type="text" placeholder="Ingresa tu nombre" className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                {...register("nombre", { required: "Campo obligatorio" })}
                            />
                            {errors.nombre && <p className="text-error text-xs">{errors.nombre.message}</p>}
                        </div>

                        {/* Campo para apellido */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Apellido</label>
                            <input type="text" placeholder="Ingresa tu apellido" className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                {...register("apellido", { required: "Campo obligatorio" })}
                            />
                            {errors.apellido && <p className="text-error text-xs">{errors.apellido.message}</p>}
                        </div>

                        {/* Campo para rol */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Rol</label>
                            <select className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1.5 px-2 text-secondary bg-white"
                                {...register("rol", { required: "Debes seleccionar un rol" })}
                                defaultValue=""
                            >
                                <option value="" disabled>Selecciona un rol</option>
                                <option value="DUEÑO">Dueño de mascota</option>
                                <option value="CUIDADOR">Cuidador / Paseador</option>
                            </select>
                            {errors.rol && <p className="text-error text-xs mt-1">{errors.rol.message}</p>}
                        </div>

                        {/* Campo para teléfono */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Teléfono</label>
                            <input type="tel" placeholder="Ej: 0991234567" className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                {...register("telefono", {
                                    required: "El teléfono es obligatorio",
                                    pattern: { value: /^\d{10}$/, message: "El teléfono no es válido, debe contener solo números y tener 10 dígitos" }
                                })}
                            />
                            {errors.telefono && <p className="text-error text-xs mt-1">{errors.telefono.message}</p>}
                        </div>

                        {/* Campo para fecha de nacimiento */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 100); return d.toISOString().split('T')[0]; })()}
                                max={new Date().toISOString().split('T')[0]}
                                className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
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
                                        if (fecha > hoy) return "La fecha de nacimiento no puede ser en el futuro.";
                                        if (fecha < hace100) return "La fecha de nacimiento no puede ser mayor a 100 años.";
                                        if (fecha > hace16) return "Debes tener al menos 16 años para registrarte.";
                                        return true;
                                    }
                                })}
                            />
                            {errors.fechaNacimiento && <p className="text-error text-xs mt-1">{errors.fechaNacimiento.message}</p>}
                        </div>

                        {/* Campo para correo electrónico */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa tu correo electrónico" className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                {...register("email", {
                                    required: "El correo electrónico es obligatorio",
                                    pattern: {
                                        value: /\S+@\S+\.\S+/,
                                        message: "El email no es válido"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
                        </div>

                        {/* Campo para contraseña */}
                        <div className="mb-3 relative">
                            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white pr-10"
                                    {...register("password", {
                                        required: "La contraseña es obligatoria",
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/,
                                            message: "La contraseña debe tener al menos 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales"
                                        }
                                    })}
                                />
                                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-secondary/60 hover:text-secondary text-xl"
                                >
                                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>

                        {/* Botón para enviar el formulario */}
                        <div className="mb-3">
                            <button className="border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 bg-primary text-white hover:bg-primary-hover">Registrarse</button>
                        </div>

                    </form>

                    {/* Enlace para iniciar sesión si ya tiene una cuenta */}
                    <div className="mt-3 text-sm flex justify-between items-center">
                        <p className="text-secondary">¿Ya tienes una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 border rounded-xl hover:scale-110 duration-300 bg-secondary text-white hover:bg-primary">Iniciar sesión</Link>
                    </div>

                </div>
            </div>
        </div>
    );
};