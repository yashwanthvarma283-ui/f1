import React from 'react'
import { X, Keyboard, Command } from 'lucide-react'

interface ControlsHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ControlsHelpModal: React.FC<ControlsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const controls = [
    { key: 'Space', desc: 'Play / Pause race replay' },
    { key: 'K', desc: 'Toggle Canvas Lock (Prevents accidental drag/scroll disturbance)' },
    { key: 'W', desc: 'Toggle Timing Tower (Leaderboard sidebar)' },
    { key: 'M / F11', desc: 'Toggle Fullscreen theater mode' },
    { key: 'Click + Drag', desc: 'Pan / move track freely around canvas (when unlocked)' },
    { key: 'Wheel / + / -', desc: 'Zoom in / out of circuit track (when unlocked)' },
    { key: '0 / F', desc: 'Reset zoom & fit circuit to screen' },
    { key: 'T / Z', desc: 'Toggle Follow Selected Car camera lock' },
    { key: 'Left / Right', desc: 'Jump 1 lap backward / forward' },
    { key: 'Up / Down', desc: 'Increase / Decrease playback speed' },
    { key: '1, 2, 3, 4', desc: 'Quick speed: 0.5x, 1.0x, 2.0x, 4.0x' },
    { key: 'R', desc: 'Restart race replay from Lap 1' },
    { key: 'C', desc: 'Toggle Drivers Championship standings overlay' },
    { key: 'A', desc: 'Toggle Constructors Championship standings overlay' },
    { key: 'D', desc: 'Toggle DRS zones highlight (bright green)' },
    { key: 'L', desc: 'Toggle driver acronym labels on cars' },
    { key: 'B', desc: 'Toggle race progress scrubber bar' },
    { key: 'I', desc: 'Toggle top session info banner' },
    { key: 'V', desc: 'Toggle full HUD overlay (Cinematic mode)' },
    { key: 'S', desc: 'Open Replay Settings dialog' },
    { key: 'H', desc: 'Toggle this Controls & Shortcuts guide' },
    { key: 'Esc', desc: 'Close any active overlay or modal' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0F1420] border border-white/20 rounded-3xl shadow-2xl overflow-hidden font-mono text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase">F1 Replay Controls</h2>
              <p className="text-xs text-white/50">FastF1 Interactive Keyboard Shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-2">
          {controls.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-emerald-400 font-bold text-xs shadow-inner">
                  {item.key}
                </kbd>
              </div>
              <span className="text-white/80 font-medium text-right">{item.desc}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-black/40 text-[11px] text-white/50">
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-white/40" />
            <span>Interactive replay engine active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs transition-colors"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}
