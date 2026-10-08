import React, { useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Radio, X, Minimize2, Maximize2 } from 'lucide-react'
import { useRadio } from '../context/RadioContext'

export default function RadioFloatingPlayer() {
  const { 
    isPlaying, 
    isMuted, 
    volume, 
    isLoading, 
    hasInteracted, 
    togglePlay, 
    toggleMute, 
    setAudioVolume 
  } = useRadio()

  const [minimized, setMinimized] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Don't show floating bar if user hasn't touched the radio yet or explicitly dismissed it while not playing
  if (!hasInteracted || (dismissed && !isPlaying)) {
    return null
  }

  // MINIMIZED FLOATING PILL (PC ONLY - HIDDEN ON MOBILE)
  if (minimized) {
    return (
      <div className="hidden lg:block fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <button
          onClick={() => setMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-2xl border transition-all ${
            isPlaying
              ? 'bg-[#002845] border-emerald-500 text-white shadow-emerald-950/40'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
          title="Abrir reproductor de Radio Pangal"
        >
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
          <Radio className={`w-4 h-4 ${isPlaying ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="text-xs font-bold font-serif">Pangal 88.3 FM</span>
          <Maximize2 className="w-3 h-3 text-slate-400 ml-1" />
        </button>
      </div>
    )
  }

  // FULL FLOATING BAR (PC ONLY - HIDDEN ON MOBILE)
  return (
    <aside 
      aria-label="Reproductor Radio Pangal en vivo"
      className="hidden lg:block fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto bg-[#001728]/95 backdrop-blur-md text-white border border-emerald-500/30 rounded-2xl p-3.5 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        
        {/* Left: Station info & Live indicator */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isPlaying ? 'bg-[#05a353] text-white shadow-md' : 'bg-white/10 text-slate-300'}`}>
              <Radio className="w-5 h-5" />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xs tracking-tight text-white">
                Radio Pangal 88.3 FM
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider ${isPlaying ? 'bg-emerald-500 text-slate-950' : 'bg-white/15 text-slate-300'}`}>
                {isPlaying ? 'En Vivo' : 'En pausa'}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 block">
              Maullín, Los Lagos • Señal Online
            </span>
          </div>
        </div>

        {/* Right: Min / Close buttons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setMinimized(true)}
            className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            title="Minimizar reproductor"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {!isPlaying && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              title="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Audio Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isPlaying 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isLoading ? 'Conectando...' : isPlaying ? 'Pausar' : 'Activar Sonido'}</span>
        </button>

        {/* Equalizer animation when playing */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 text-emerald-400 px-1">
            <span className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse" />
            <span className="w-1 bg-emerald-400 rounded-full h-2 animate-pulse delay-75" />
            <span className="w-1 bg-emerald-400 rounded-full h-3.5 animate-pulse delay-150" />
            <span className="w-1 bg-emerald-400 rounded-full h-1.5 animate-pulse delay-100" />
            <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse delay-200" />
          </div>
        )}

        {/* Volume & Mute Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            title="Volumen"
          />
        </div>

      </div>
    </aside>
  )
}
