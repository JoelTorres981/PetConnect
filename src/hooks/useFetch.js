import axios from "axios"
import { toast } from "react-toastify"


export function useFetch() {

    const fetchDataBackend = async (url, data=null, method="GET", headers = {}) => 
        {
            const loadingToast = toast.loading("Procesando solicitud...")
            try {
                // Obtener el token del localStorage
                const token = localStorage.getItem("token")
                
                const options = {
                    method,
                    url,
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { "Authorization": `Bearer ${token}` }),
                        ...headers,
                    },
                    data
                }
                const response = await axios(options)
                toast.dismiss(loadingToast)
                toast.success(response?.data?.msg)
                return response?.data

            } catch (error) {
                toast.dismiss(loadingToast)
                console.error(error)
                toast.error(error.response?.data?.msg || "Error en la solicitud")
            }
    }
    return fetchDataBackend
}