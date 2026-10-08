import React, { useState, useEffect } from 'react'
import { X, Settings, Folder, RefreshCw, Check, HardDrive, Cpu, Gauge, Camera } from 'lucide-react'

export interface F1ReplaySettings {
  cacheLocation: string
  computedDataLocation: string
  defaultPlaybackSpeed: number
  speedUnit: 'kmh' | 'mph'
  telemetryRateHz: number
  autoFollowDriver: boolean
  enableHdrGlow: boolean
}

export const DEFAULT_SETTINGS: F1ReplaySettings = {
  cacheLocation: './.fastf1-cache',
  computedDataLocation: './computed_data',
  defaultPlaybackSpeed: 1.0,
  speedUnit: 'kmh',
  telemetryRateHz: 25,
  autoFollowDriver: false,
  enableHdrGlow: true,
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: F1ReplaySettings
  onSave: (newSettings: F1ReplaySettings) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState<F1ReplaySettings>(initialSettings)
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(initialSettings)
      setShowSavedFeedback(false)
    }
  }, [isOpen, initialSettings])

  if (!isOpen) return null

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS)
  }

  const handleSave = () => {
    onSave(formData)
    setShowSavedFeedback(true)
    setTimeout(() => {
      setShowSavedFeedback(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0C101A] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-mono text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider uppercase">F1 Replay Settings</h2>
              <p className="text-xs text-white/50">FastF1 cache, canvas & telemetry preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
          {/* FastF1 Cache Folder */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-bold text-white/80 uppercase">
              <HardDrive className="w-3.5 h-3.5 text-red-400" />
              <span>FastF1 Cache Location</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.cacheLocation}
                onChange={(e) => setFormData({ ...formData, cacheLocation: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                placeholder="Path to FastF1 cache folder..."
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, cacheLocation: './.fastf1-cache' })}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                title="Use default folder"
              >
                <Folder className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Stores raw timing data, GPS coordinate traces, and session telemetry from FastF1.
            </p>
          </div>

          {/* Computed Data Folder */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-bold text-white/80 uppercase">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Computed Data Location</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.computedDataLocation}
                onChange={(e) => setFormData({ ...formData, computedDataLocation: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                placeholder="Path to computed data folder..."
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, computedDataLocation: './computed_data' })}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                title="Use default folder"
              >
                <Folder className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Stores pre-computed racing lines, boundary polygons, and tyre degradation models.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Speed Unit */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-white/80 uppercase">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Speed Display Unit</span>
              </label>
              <select
                value={formData.speedUnit}
                onChange={(e) => setFormData({ ...formData, speedUnit: e.target.value as 'kmh' | 'mph' })}
                className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-white focus:outline-none focus:border-red-500"
              >
                <option value="kmh">KM/H (Metric - Official F1)</option>
                <option value="mph">MPH (Imperial)</option>
              </select>
            </div>

            {/* Default Playback Speed */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-white/80 uppercase">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Default Playback Speed</span>
              </label>
              <select
                value={formData.defaultPlaybackSpeed}
                onChange={(e) => setFormData({ ...formData, defaultPlaybackSpeed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-white focus:outline-none focus:border-red-500"
              >
                <option value="0.5">0.5x (Slow-motion)</option>
                <option value="1">1.0x (Authentic Real-Time 1:1)</option>
                <option value="2">2.0x (Double Speed)</option>
                <option value="4">4.0x (Fast Pace)</option>
                <option value="8">8.0x (Rapid Review)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Telemetry Stream Rate */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-white/80 uppercase">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Telemetry Stream Rate</span>
              </label>
              <select
                value={formData.telemetryRateHz}
                onChange={(e) => setFormData({ ...formData, telemetryRateHz: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-white focus:outline-none focus:border-red-500"
              >
                <option value="10">10 Hz (Low CPU)</option>
                <option value="25">25 Hz (Standard Broadcast)</option>
                <option value="50">50 Hz (High Precision)</option>
              </select>
            </div>

            {/* Camera Behavior */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-white/80 uppercase">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Follow Selected Car</span>
              </label>
              <select
                value={formData.autoFollowDriver ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, autoFollowDriver: e.target.value === 'true' })}
                className="w-full px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-white focus:outline-none focus:border-red-500"
              >
                <option value="false">Free Canvas (Static Centered)</option>
                <option value="true">Dynamic Camera Tracking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all text-xs font-black shadow-lg shadow-red-600/30"
            >
              {showSavedFeedback ? <Check className="w-4 h-4" /> : null}
              <span>{showSavedFeedback ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
