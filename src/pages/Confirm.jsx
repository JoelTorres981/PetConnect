import { Link } from 'react-router'
import { useParams } from 'react-router'
import { useEffect } from 'react'
import { useFetch } from '../hooks/useFetch'

export const Confirm = () => {

    const fetchDataBackend = useFetch()
    const { token } = useParams()

    const verifyToken = async () => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/auth/confirmar-email/${token}`
        await fetchDataBackend(url)
    }

    useEffect(() => {
        verifyToken()
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <img className="object-cover h-48 w-48 md:h-80 md:w-80 rounded-full border-4 border-solid border-primary" src="https://cdn-icons-png.flaticon.com/128/2138/2138440.png" alt="PetConnect logo" />

            <div className="flex flex-col items-center justify-center">
                <p className="text-3xl md:text-4xl lg:text-5xl mt-12 text-primary">Muchas Gracias</p>
                <p className="md:text-lg lg:text-xl mt-8 text-primary">Ya puedes iniciar sesión</p>
                <Link to="/login" className="p-3 m-5 w-full text-center text-white border rounded-xl hover:scale-110 duration-300 bg-primary hover:bg-primary-hover">
                    Iniciar sesión
                </Link>
            </div>

        </div>
    )
}