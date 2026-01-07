'use client'

import { useState } from 'react'

interface FilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  onClear: () => void
  categories?: string[]
}

export interface FilterState {
  startDate: string | null
  endDate: string | null
  periodType: 'custom' | '7days' | '30days' | 'thisyear' | null
  themes: string[]
}

export default function FilterDropdown({ isOpen, onClose, onApply, onClear, categories }: FilterDropdownProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [periodType, setPeriodType] = useState<'custom' | '7days' | '30days' | 'thisyear' | null>(null)
  const [themes, setThemes] = useState<string[]>([])

  const availableThemes = categories || ['Filtre 1', 'Filtre 2', 'Filtre 3', 'Filtre 4', 'Filtre 5', 'Filtre 6']

  const handleThemeToggle = (theme: string) => {
    setThemes(prev => 
      prev.includes(theme) 
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const handlePeriodClick = (type: '7days' | '30days' | 'thisyear') => {
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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-gray-200">
        <p className="font-['Montserrat'] font-semibold text-base text-gray-600">Filtres</p>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {/* Dropdown Content */}
      <div className="bg-white overflow-y-auto max-h-96">
        {/* Période Section */}
        <div className="p-1">
          <div className="px-2 py-1">
            <p className="text-sm font-['Montserrat'] font-normal text-gray-600">Période</p>
          </div>
          
          {/* Date inputs */}
          <div className="flex gap-[6px] items-center px-[6px] py-[6px]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setPeriodType('custom')
              }}
              className="border border-gray-600 px-3 py-[6px] rounded-bl-lg rounded-tl-lg text-xs text-[#053f5c] font-['Poppins'] font-medium flex-1 placeholder-gray-400"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setPeriodType('custom')
              }}
              className="border border-gray-600 px-3 py-[6px] rounded-br-lg rounded-tr-lg text-xs text-[#053f5c] font-['Poppins'] font-medium flex-1 placeholder-gray-400"
            />
          </div>

          {/* Period presets */}
          <div className="space-y-0">
            <label className="flex items-center gap-2 cursor-pointer px-[6px] py-[6px] hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={periodType === '7days'}
                onChange={() => handlePeriodClick('7days')}
                className="w-5 h-5"
              />
              <span className="text-sm font-['Montserrat'] font-medium text-gray-600 flex-1">7 derniers jours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer px-[6px] py-[6px] hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={periodType === '30days'}
                onChange={() => handlePeriodClick('30days')}
                className="w-5 h-5"
              />
              <span className="text-sm font-['Montserrat'] font-medium text-gray-600 flex-1">30 derniers jours</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer px-[6px] py-[6px] hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={periodType === 'thisyear'}
                onChange={() => handlePeriodClick('thisyear')}
                className="w-5 h-5"
              />
              <span className="text-sm font-['Montserrat'] font-medium text-gray-600 flex-1">Cette année</span>
            </label>
          </div>
        </div>

        {/* Thématique Section */}
        <div className="p-1 border-t border-gray-200">
          <div className="px-2 py-1">
            <p className="text-sm font-['Montserrat'] font-normal text-gray-600">Thématique</p>
          </div>
          <div className="space-y-0">
            {availableThemes.map((theme) => (
              <label key={theme} className="flex items-center gap-2 cursor-pointer px-[6px] py-[6px] hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={themes.includes(theme)}
                  onChange={() => handleThemeToggle(theme)}
                  className="w-5 h-5"
                />
                <span className="text-sm font-['Montserrat'] font-medium text-gray-600 flex-1">{theme}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[6px] items-start p-[6px] border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleClear}
          className="flex-1 border border-gray-600 px-3 py-[6px] rounded-lg text-xs font-['Poppins'] font-medium text-[#053f5c] hover:bg-gray-100 flex items-center justify-center gap-2"
        >
          🗑️ Supprimer les filtres
        </button>
        <button
          onClick={handleApply}
          className="flex-1 bg-[#f27f09] px-3 py-[6px] rounded-lg text-xs font-['Poppins'] font-medium text-[#242a35] hover:bg-[#e67e00] flex items-center justify-center gap-2"
        >
          ⚙️ Appliquer les filtres
        </button>
      </div>
    </div>
  )
}
