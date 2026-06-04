import { Link } from 'react-router'
import { useForm } from 'react-hook-form';
import { useFetch } from '../hooks/useFetch'
import { MdArrowBack } from 'react-icons/md'

export const Forgot = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const fetchDataBackend = useFetch()

    const sendMail = async (dataForm) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/auth/reestablecer-password`
        await fetchDataBackend(url, dataForm, 'POST')
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
                <div className="w-11/12 max-w-md rounded-xl shadow-lg p-6 sm:p-8 relative z-10 bg-base/95">

                    <h1 className="text-3xl font-semibold mb-2 text-center uppercase text-primary">¡Olvidaste tu contraseña!</h1>
                    <small className="block my-4 text-sm text-center text-secondary">No te preocupes</small>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit(sendMail)} noValidate>

                        {/* Campo correo electrónico */}
                        <div className="mb-1">
                            <label className="mb-2 block text-sm font-semibold">Correo electrónico</label>
                            <input type="email" placeholder="Ingresa un correo electrónico válido" className="block w-full rounded-md border border-secondary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary py-1 px-1.5 text-secondary bg-white"
                                {...register("email", {
                                    required: "El correo electrónico es obligatorio",
                                    pattern: {
                                        value: /\S+@\S+\.\S+/,
                                        message: "El correo electrónico no es válido"
                                    }
                                })}
                            />
                            {errors.email && <p className="text-error">{errors.email.message}</p>}
                        </div>


                        {/* Botón Forgot password */}
                        <div className="mb-3">
                            <button className="text-white border py-2 w-full rounded-xl mt-5 hover:scale-105 duration-300 bg-primary hover:bg-primary-hover">
                                Enviar correo
                            </button>
                        </div>

                    </form>

                    {/* Enlace para iniciar sesión si ya posee una cuenta */}
                    <div className="mt-3 text-sm flex justify-between items-center text-secondary">
                        <p>¿Ya posees una cuenta?</p>
                        <Link to="/login" className="py-2 px-5 text-white border rounded-xl hover:scale-110 duration-300 bg-secondary hover:bg-primary">Iniciar sesión</Link>
                    </div>

                </div>
            </div>

        </div>
    )
}