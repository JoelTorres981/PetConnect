import { create } from "zustand"
import { persist } from "zustand/middleware"

const storeAuth = create(
    persist(

        set => ({
            token: null,
            rol: null,
            nombre: null,
            setToken: (token) => set({ token }),
            setRol: (rol) => set({ rol }),
            setNombre: (nombre) => set({ nombre }),
            clearToken: () => set({ token: null, nombre: null })
        }),

        { name: "auth-token" }

    )
)

export default storeAuth