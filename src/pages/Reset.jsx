import { useState } from 'react'
import { useEffect } from 'react'
import { useFetch } from '../hooks/useFetch';
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'

const Reset = () => {
    const navigate = useNavigate()
    const { token } = useParams()
    const fetchDataBackend = useFetch()
    const [tokenback, setTokenBack] = useState(false)
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const password = watch("password")

    const changePassword = async (dataForm) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/auth/crear-nuevo-password/${token}`
        await fetchDataBackend(url, dataForm, 'POST')
        setTimeout(() => {
            if (dataForm.password === dataForm.confirmpassword) {
                navigate('/login')
            }
        }, 2000)
    }

    useEffect(() => {
        const verifyToken = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/auth/reestablecer-password/${token}`
            await fetchDataBackend(url, 'GET')
            setTokenBack(true)
        }
        verifyToken()
    }, [])

    return (
        <div className="relative h-screen">

            {/* Overlay suave para mejorar contraste (solo fondo) */}
            <div className="absolute inset-0 bg-black/30 z-0" aria-hidden="true" />

            {/* Contenedor centrado del contenido en tarjeta opaca */}
            <div className="flex items-center justify-center h-full">
                <div className="w-11/12 max-w-md rounded-xl shadow-lg p-6 sm:p-8 relative z-10 bg-base/90">

                    <h1 className="text-3xl font-semibold mb-2 text-center text-primary">
                        Bienvenido nuevamente
                    </h1>
                    <small className="block my-4 text-sm text-center text-secondary">
                        Por favor, ingrese los siguientes datos
                    </small>

                    <img
                        className="mx-auto object-cover h-40 w-40 rounded-full border-4 border-solid border-slate-600"
                        src="https://cdn-icons-png.flaticon.com/128/2138/2138440.png"
                        alt="logo de PetConnect"
                    />

                    {tokenback && (

                        <form className="w-full mt-6" onSubmit={handleSubmit(changePassword)} noValidate>

                            <div className="mb-1">

                                {/* Campo nueva contraseña */}
                                <label className="mb-2 block text-sm font-semibold">Nueva contraseña</label>
                                <input type="password" placeholder="Ingresa tu nueva contraseña"
                                    className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                    {...register("password", { 
                                        required: "La contraseña es obligatoria",
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/,
                                            message: "La contraseña debe tener al menos 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales"
                                        }
                                    })}
                                />
                                {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}


                                {/* Campo repetir contraseña */}
                                <label className="mb-2 block text-sm font-semibold">Confirmar contraseña</label>
                                <input type="password" placeholder="Repite tu contraseña"
                                    className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                    {...register("confirmpassword", { 
                                        required: "La confirmación de la contraseña es obligatoria",
                                        validate: value => value === password || "Las contraseñas no coinciden"
                                    })}
                                />
                                {errors.confirmpassword && <p className="text-error text-xs mt-1">{errors.confirmpassword.message}</p>}

                            </div>

                            <div className="mb-3">
                                <button className="text-white border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 bg-primary hover:bg-primary-hover">
                                    Enviar
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Reset
