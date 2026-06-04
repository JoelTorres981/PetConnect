import { create } from "zustand"
import axios from "axios"
import { getAuthHeaders } from "../helpers/authHeaders"

const storeProfile = create((set) => ({

    user: null,
    clearUser: () => set({ user: null }),
    profile: async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/auth/perfil`
            const respuesta = await axios.get(url, getAuthHeaders())
            set({ user: respuesta.data })
        } catch (error) {
            console.error(error)
        }
    }
})
)

export default storeProfile
