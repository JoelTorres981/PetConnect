import { useState } from 'react'
import { TablaUsuarios } from '../components/admin/TablaUsuarios'
import { TablaMascotas } from '../components/admin/TablaMascotas'

const TABS = ['Administradores', 'Dueños', 'Cuidadores', 'Mascotas']
const ROL_MAP = { Administradores: 'ADMINISTRADOR', Dueños: 'DUEÑO', Cuidadores: 'CUIDADOR' }

// ─── Página principal: AdminPanel ────────────────────────────────
export const AdminPanel = () => {
  const [tab, setTab] = useState(0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary mb-6">Panel de Administración</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6 border-b border-secondary/20 pb-0">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px
              ${tab === i ? 'border-primary text-primary bg-white' : 'border-transparent text-secondary/60 hover:text-secondary'}`}
          >
            {t === 'Administradores' ? '🛡️' : t === 'Dueños' ? '👤' : t === 'Cuidadores' ? '🐾' : '🐶'} {t}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 p-6">
        {tab < 3
          ? <TablaUsuarios rol={ROL_MAP[TABS[tab]]} />
          : <TablaMascotas />
        }
      </div>
    </div>
  )
}

export default AdminPanel
