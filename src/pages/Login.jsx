import { useState } from 'react';
import { Link, useNavigate } from "react-router"
import { useFetch } from '../hooks/useFetch'
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { useForm } from 'react-hook-form'
import storeAuth from "../context/storeAuth"

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm()
    const fetchDataBackend = useFetch()
    const { setToken, setRol, setNombre } = storeAuth()

    const loginUser = async (dataForm) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/auth/login`
        const response = await fetchDataBackend(url, dataForm, 'POST')
        if (response) {
            setToken(response.token)
            setRol(response.rol)
            setNombre(response.nombre)
            if (response.rol === 'administrador') {
                navigate('/dashboard/estadisticas')
            } else {
                navigate('/dashboard')
            }
        }
    }

    return (
        <div className="relative h-screen">
            {/* Capa de overlay suave para mejorar contraste (sólo fondo) */}
            <div className="absolute inset-0 bg-black/30 z-0" aria-hidden="true" />

            {/* Botón Volver al inicio */}
            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md transition-all hover:-translate-x-1 font-medium text-sm">
                    <MdArrowBack className="text-lg" /> Inicio
                </Link>
            </div>

            {/* Contenedor del formulario centrado (ventana flotante) */}
            <div className="flex items-center justify-center h-full">
                <div className="w-11/12 max-w-md rounded-xl shadow-lg p-6 sm:p-8 relative z-10 bg-base">
                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-secondary">Bienvenido</h1>
                    <small className="block my-4 text-sm text-secondary">Por favor ingresa tus datos</small>

                    <form onSubmit={handleSubmit(loginUser)} noValidate>
                        {/* Correo electrónico */}
                        <div className="mb-3">
                            <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa tu correo" className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-2 text-secondary bg-white"
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

                        {/* Contraseña */}
                        <div className="mb-3 relative">
                            <label className="mb-2 block text-sm font-semibold">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña"
                                    className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white pr-10"
                                    {...register("password", { required: "Campo obligatorio" })}
                                />
                                {errors.password && <p className="text-error text-xs">{errors.password.message}</p>}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-2 right-3 text-secondary/60 hover:text-secondary text-xl"
                                >
                                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                </button>
                            </div>
                        </div>

                        {/* Botón de iniciar sesión */}
                        <button className="py-2 w-full block text-center text-white border rounded-xl hover:scale-105 duration-300 bg-primary hover:bg-primary-hover">Iniciar sesión</button>
                    </form>

                    {/* Enlaces olvidaste tu contraseña y registrarse */}
                    <div className="mt-3 text-sm flex justify-between items-center">
                        <Link to="/forgot/id" className="underline text-sm text-secondary hover:text-primary">¿Olvidaste tu contraseña?</Link>
                        <Link to="/register" className="py-2 px-5 border rounded-xl hover:scale-110 duration-300 bg-secondary text-white hover:bg-primary">Registrarse</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;