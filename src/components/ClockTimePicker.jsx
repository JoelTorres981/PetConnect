import React, { useState, useRef } from 'react'

export const ClockTimePicker = ({ initialTime, onSave, onClose }) => {
    // initialTime is string "HH:mm" (24-hour format, e.g., "22:20")
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: 8, minute: 0, isPm: false }
        const [hStr, mStr] = timeStr.split(':')
        let h = parseInt(hStr, 10)
        let m = parseInt(mStr, 10)
        m = Math.round(m / 5) * 5
        if (m === 60) m = 0

        // Limitar rango a 5 AM - 10 PM (inclusive)
        if (h < 5) {
            h = 5
            m = 0
        } else if (h > 22 || (h === 22 && m > 0)) {
            h = 22
            m = 0
        }

        const isPm = h >= 12
        let displayHour = h % 12
        if (displayHour === 0) displayHour = 12
        return { hour: displayHour, minute: m, isPm }
    }

    const { hour: initHour, minute: initMin, isPm: initPm } = parseTime(initialTime)

    const [hour, setHour] = useState(initHour)
    const [minute, setMinute] = useState(initMin)
    const [isPm, setIsPm] = useState(initPm)
    const [mode, setMode] = useState('hours') // 'hours' or 'minutes'

    const svgRef = useRef(null)

    // Calculate angle in radians
    const getAngleInRadians = () => {
        if (mode === 'hours') {
            return ((hour % 12) / 12) * 2 * Math.PI - Math.PI / 2
        } else {
            return (minute / 60) * 2 * Math.PI - Math.PI / 2
        }
    }

    // Convert mouse/touch coordinates to selection
    const handleClockInteraction = (clientX, clientY) => {
        if (!svgRef.current) return
        const rect = svgRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = clientX - centerX
        const dy = clientY - centerY

        // Calculate angle in degrees (0 at the top, clockwise)
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
        if (angle < 0) angle += 360

        if (mode === 'hours') {
            // Round to nearest 30 degrees (each hour is 30 deg)
            let selectedHour = Math.round(angle / 30)
            if (selectedHour === 0) selectedHour = 12

            let h24 = selectedHour % 12
            if (isPm) h24 += 12
            else if (selectedHour === 12) h24 = 0

            // Validar que esté en el rango de 5am a 10pm
            if (h24 >= 5 && h24 <= 22) {
                setHour(selectedHour)
                if (h24 === 22) {
                    setMinute(0) // Al ser las 10 PM, forzar minutos a 00
                }
                setMode('minutes')
            }
        } else {
            // Redondear al paso de 5 minutos más cercano (cada 30 grados)
            let step = Math.round(angle / 30)
            if (step === 12) step = 0
            let selectedMinute = step * 5

            // Validar que no pase de las 10:00 PM (a las 10 PM solo se permite :00)
            if (!(hour === 10 && isPm && selectedMinute > 0)) {
                setMinute(selectedMinute)
            }
        }
    }

    const handleMouseDown = (e) => {
        handleClockInteraction(e.clientX, e.clientY)
        const handleMouseMove = (moveEvent) => {
            handleClockInteraction(moveEvent.clientX, moveEvent.clientY)
        }
        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    const handleTouchStart = (e) => {
        if (e.touches.length === 0) return
        handleClockInteraction(e.touches[0].clientX, e.touches[0].clientY)
        const handleTouchMove = (moveEvent) => {
            if (moveEvent.touches.length === 0) return
            handleClockInteraction(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY)
        }
        const handleTouchEnd = () => {
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
        }
        window.addEventListener('touchmove', handleTouchMove)
        window.addEventListener('touchend', handleTouchEnd)
    }

    const handleOk = () => {
        // Convert to 24-hour format
        let h24 = hour % 12
        if (isPm) h24 += 12
        else if (hour === 12) h24 = 0

        const formattedHour = String(h24).padStart(2, '0')
        const formattedMinute = String(minute).padStart(2, '0')
        onSave(`${formattedHour}:${formattedMinute}`)
    }

    const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

    const angleRad = getAngleInRadians()
    const handX = 100 + Math.cos(angleRad) * 72
    const handY = 100 + Math.sin(angleRad) * 72

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-[280px] border border-secondary/10 flex flex-col items-center">
                {/* Header: Displays selected time */}
                <div className="w-full bg-primary p-4 text-center text-white flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-75">Seleccionar Hora</span>
                    
                    {/* Time digits */}
                    <div className="flex text-4xl font-bold font-mono mt-1">
                        <button
                            type="button"
                            onClick={() => setMode('hours')}
                            className={`transition-all ${mode === 'hours' ? 'text-white scale-110 font-black' : 'text-white/60 hover:text-white'}`}
                        >
                            {String(hour).padStart(2, '0')}
                        </button>
                        <span className="mx-1 text-white/80">:</span>
                        <button
                            type="button"
                            onClick={() => setMode('minutes')}
                            className={`transition-all ${mode === 'minutes' ? 'text-white scale-110 font-black' : 'text-white/60 hover:text-white'}`}
                        >
                            {String(minute).padStart(2, '0')}
                        </button>
                    </div>

                    {/* AM / PM Segmented Control for mobile touch targets */}
                    <div className="flex bg-white/10 p-0.5 rounded-xl border border-white/10 mt-2.5 w-32">
                        <button
                            type="button"
                            onClick={() => {
                                setIsPm(false)
                                // Si cambia a AM y la hora elegida es inválida (12am, 1am, 2am, 3am, 4am), forzar a 5am
                                if (hour === 12 || hour < 5) {
                                    setHour(5)
                                    setMinute(0)
                                }
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all duration-300 ${
                                !isPm
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsPm(true)
                                // Si cambia a PM y la hora elegida es inválida (11pm), forzar a 10pm
                                if (hour === 11) {
                                    setHour(10)
                                    setMinute(0)
                                }
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase transition-all duration-300 ${
                                isPm
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            PM
                        </button>
                    </div>
                </div>

                {/* SVG Clock Face Panel */}
                <div className="p-4 flex flex-col items-center justify-center">
                    <svg
                        ref={svgRef}
                        width="210"
                        height="210"
                        viewBox="0 0 200 200"
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        className="cursor-pointer select-none"
                    >
                        {/* Dial background circle */}
                        <circle cx="100" cy="100" r="95" className="fill-secondary/[0.03] stroke-secondary/5" />

                        {/* Selected indicator circle (placed under text) */}
                        <circle
                            cx={handX}
                            cy={handY}
                            r="14"
                            className="fill-primary"
                        />

                        {/* Hand line */}
                        <line
                            x1="100"
                            y1="100"
                            x2={handX}
                            y2={handY}
                            className="stroke-primary"
                            strokeWidth="2.5"
                        />

                        {/* Center Pivot Dot */}
                        <circle cx="100" cy="100" r="3.5" className="fill-primary" />

                        {/* Render Numbers */}
                        {mode === 'hours'
                            ? hoursList.map((h, i) => {
                                  const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
                                  const x = 100 + Math.cos(angle) * 72
                                  const y = 100 + Math.sin(angle) * 72
                                  const isSelected = hour === h

                                  let h24 = h % 12
                                  if (isPm) h24 += 12
                                  else if (h === 12) h24 = 0
                                  const isDisabled = h24 < 5 || h24 > 22

                                  return (
                                      <g key={h} className={isDisabled ? 'opacity-20 pointer-events-none' : ''}>
                                          {/* Interactive invisible circle for touch target */}
                                          <circle
                                              cx={x}
                                              cy={y}
                                              r="16"
                                              className="fill-transparent cursor-pointer"
                                              onClick={(e) => {
                                                  e.stopPropagation()
                                                  setHour(h)
                                                  setMode('minutes')
                                              }}
                                          />
                                          <text
                                              x={x}
                                              y={y}
                                              textAnchor="middle"
                                              dominantBaseline="central"
                                              onClick={(e) => {
                                                  e.stopPropagation()
                                                  setHour(h)
                                                  setMode('minutes')
                                              }}
                                              className={`text-[11px] font-sans select-none cursor-pointer ${
                                                  isSelected
                                                      ? 'fill-white font-bold'
                                                      : 'fill-secondary/70 font-semibold hover:fill-secondary'
                                              }`}
                                          >
                                              {h}
                                          </text>
                                      </g>
                                  )
                              })
                            : minutesList.map((m, i) => {
                                  const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
                                  const x = 100 + Math.cos(angle) * 72
                                  const y = 100 + Math.sin(angle) * 72
                                  const isSelected = minute === m
                                  const isDisabled = hour === 10 && isPm && m > 0

                                  return (
                                      <g key={m} className={isDisabled ? 'opacity-20 pointer-events-none' : ''}>
                                          {/* Interactive invisible circle for touch target */}
                                          <circle
                                              cx={x}
                                              cy={y}
                                              r="16"
                                              className="fill-transparent cursor-pointer"
                                              onClick={(e) => {
                                                  e.stopPropagation()
                                                  setMinute(m)
                                              }}
                                          />
                                          <text
                                              x={x}
                                              y={y}
                                              textAnchor="middle"
                                              dominantBaseline="central"
                                              onClick={(e) => {
                                                  e.stopPropagation()
                                                  setMinute(m)
                                              }}
                                              className={`text-[10px] font-sans select-none cursor-pointer ${
                                                  isSelected
                                                      ? 'fill-white font-bold'
                                                      : 'fill-secondary/70 font-semibold hover:fill-secondary'
                                              }`}
                                          >
                                              {String(m).padStart(2, '0')}
                                          </text>
                                      </g>
                                  )
                              })}
                    </svg>
                </div>

                {/* Footer Buttons */}
                <div className="w-full border-t border-secondary/10 p-3 flex gap-2 bg-base/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 text-center text-xs font-bold text-secondary/60 hover:text-secondary hover:bg-secondary/5 rounded-xl border border-secondary/10 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleOk}
                        className="flex-1 py-2 text-center text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    )
}
