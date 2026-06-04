import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaStar, FaSpinner } from 'react-icons/fa'
import { Modal } from './Modal'
import { getAuthHeaders } from '../helpers/authHeaders'

const API = import.meta.env.VITE_BACKEND_URL

export const ModalResenas = ({ cuidadorId, nombre, apellido, onClose }) => {
    const [resenas, setResenas] = useState([])
    const [promedioResenas, setPromedioResenas] = useState(0)
    const [totalResenas, setTotalResenas] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargarResenas = async () => {
            if (!cuidadorId) return
            setLoading(true)
            try {
                const res = await axios.get(`${API}/resenas/${cuidadorId}`, getAuthHeaders())
                if (res.data?.resenas) {
                    setResenas(res.data.resenas)
                    setPromedioResenas(res.data.promedio_calificacion || 0)
                    setTotalResenas(res.data.total_resenas || 0)
                } else {
                    setResenas([])
                    setPromedioResenas(0)
                    setTotalResenas(0)
                }
            } catch (error) {
                console.error('Error al cargar reseñas:', error)
                setResenas([])
                setPromedioResenas(0)
                setTotalResenas(0)
            } finally {
                setLoading(false)
            }
        }

        cargarResenas()
    }, [cuidadorId])

    return (
        <Modal
            title={`Reseñas de ${nombre} ${apellido}`}
            onClose={onClose}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <FaSpinner className="text-3xl text-primary animate-spin" />
                    <p className="text-xs text-secondary/50">Cargando reseñas...</p>
                </div>
            ) : resenas.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-4xl mb-2">⭐</p>
                    <p className="text-secondary font-bold text-sm">El cuidador aún no tiene reseñas.</p>
                    <p className="text-xs text-secondary/50 mt-1">Sé el primero en calificar su trabajo después de contratar un servicio.</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Promedio y total */}
                    <div className="bg-base p-4 rounded-2xl border border-secondary/5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-secondary/40 font-bold uppercase">Calificación Promedio</p>
                            <p className="text-2xl font-black text-secondary mt-0.5 flex items-center gap-1.5">
                                ⭐ {promedioResenas} <span className="text-sm text-secondary/40 font-normal">/ 5</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-secondary/40 font-bold uppercase">Total Reseñas</p>
                            <p className="text-lg font-bold text-secondary mt-0.5">
                                {totalResenas} {totalResenas === 1 ? 'opinión' : 'opiniones'}
                            </p>
                        </div>
                    </div>

                    {/* Listado de reseñas */}
                    <div className="space-y-3">
                        {resenas.map(r => (
                            <div key={r._id} className="border border-secondary/15 rounded-2xl p-4 bg-white hover:border-primary/20 transition-all shadow-xs">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <img
                                            src={r.dueno_id?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover border"
                                        />
                                        <div>
                                            <h4 className="font-bold text-secondary text-xs">
                                                {r.dueno_id?.nombre} {r.dueno_id?.apellido}
                                            </h4>
                                            <p className="text-[10px] text-secondary/40">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 text-xs text-yellow-400">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar key={i} className={i < r.calificacion ? 'text-yellow-400' : 'text-secondary/10'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-secondary/70 text-xs italic bg-base/50 p-2.5 rounded-xl border border-secondary/5 leading-relaxed">
                                    "{r.comentario}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default ModalResenas
