/**
 * Retorna los headers de autorización para peticiones autenticadas.
 * Lee el token desde el localStorage donde Zustand lo persiste.
 */
export const getAuthHeaders = () => {
    const storedUser = JSON.parse(localStorage.getItem("auth-token"));
    return {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedUser?.state?.token}`,
        },
    };
};
