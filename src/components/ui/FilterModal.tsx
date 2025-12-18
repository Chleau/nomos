'use client'

import { useState } from 'react'
import Button from './Button'
import Checkbox from './Checkbox'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  onClear: () => void
}

export interface FilterState {
  startDate: string | null
  endDate: string | null
  periodType: 'custom' | '7days' | '30days' | 'thisyear' | null
  themes: string[]
}

export default function FilterModal({ isOpen, onClose, onApply, onClear }: FilterModalProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [periodType, setPeriodType] = useState<'custom' | '7days' | '30days' | 'thisyear' | null>(null)
  const [themes, setThemes] = useState<string[]>([])

  const availableThemes = [
    'Filtre 1',
    'Filtre 2',
    'Filtre 3',
    'Filtre 4',
    'Filtre 5',
    'Filtre 6'
  ]

  const handleThemeToggle = (theme: string) => {
    setThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const handlePeriodClick = (type: 'custom' | '7days' | '30days' | 'thisyear') => {
    setPeriodType(type)
    
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    
    switch (type) {
      case '7days':
        const date7DaysAgo = new Date(today)
        date7DaysAgo.setDate(date7DaysAgo.getDate() - 7)
        setStartDate(date7DaysAgo.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case '30days':
        const date30DaysAgo = new Date(today)
        date30DaysAgo.setDate(date30DaysAgo.getDate() - 30)
        setStartDate(date30DaysAgo.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case 'thisyear':
        setStartDate(startOfYear.toISOString().split('T')[0])
        setEndDate(today.toISOString().split('T')[0])
        break
      case 'custom':
        setPeriodType('custom')
        break
    }
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    setPeriodType(null)
    setThemes([])
    onClear()
  }

  const handleApply = () => {
    onApply({
      startDate: startDate || null,
      endDate: endDate || null,
      periodType,
      themes
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Filtres</h2>
          <button 
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Période */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Période</h3>
          
          {/* Date inputs */}
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPeriodType('custom')
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Date début"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPeriodType('custom')
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Date fin"
            />
          </div>

          {/* Period presets */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={periodType === '7days'}
                onChange={() => handlePeriodClick('7days')}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">7 derniers jours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={periodType === '30days'}
                onChange={() => handlePeriodClick('30days')}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">30 derniers jours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={periodType === 'thisyear'}
                onChange={() => handlePeriodClick('thisyear')}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Cette année</span>
            </label>
          </div>
        </div>

        {/* Thématique */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thématique</h3>
          <div className="space-y-2">
            {availableThemes.map((theme) => (
              <label key={theme} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={themes.includes(theme)}
                  onChange={() => handleThemeToggle(theme)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{theme}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            Supprimer les filtres
          </button>
          <Button
            onClick={handleApply}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            ⚙️ Appliquer les filtres
          </Button>
        </div>
      </div>
    </div>
  )
}
