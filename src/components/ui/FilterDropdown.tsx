'use client'

import { useState } from 'react'
import { TrashIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface FilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterState) => void
  onClear: () => void
  themes?: { libelle: string; id?: number }[]
  categories?: string[]
}

export interface FilterState {
  startDate: string | null
  endDate: string | null
  periodType: 'custom' | '7days' | '30days' | 'thisyear' | null
  themes: string[]
}

export default function FilterDropdown({ isOpen, onClose, onApply, onClear, themes: themesFromProps = [], categories }: FilterDropdownProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [periodType, setPeriodType] = useState<'custom' | '7days' | '30days' | 'thisyear' | null>(null)
  const [themes, setThemes] = useState<string[]>([])

  const availableThemes = categories || themesFromProps.map(t => t.libelle)

  const handleThemeToggle = (theme: string) => {
    setThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const handlePeriodClick = (type: '7days' | '30days' | 'thisyear') => {
    // Si on clique sur le même, on décoche
    if (periodType === type) {
      setPeriodType(null)
      setStartDate('')
      setEndDate('')
      return
    }

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
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-2 py-1">
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

          {/* Date inputs - Hidden but functional */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setPeriodType('custom')
            }}
            className="hidden"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setPeriodType('custom')
            }}
            className="hidden"
          />

          {/* Date display as interactive pills */}
          <div className="px-[6px] py-[6px]">
            <div className="flex flex-wrap gap-[6px]">
              {startDate && (
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 px-3 py-[6px] rounded-lg">
                  <span className="text-xs text-[#053f5c] font-['Poppins'] font-medium">
                    {formatDateDisplay(startDate)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setStartDate('')
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
              {endDate && (
                <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 px-3 py-[6px] rounded-lg">
                  <span className="text-xs text-[#053f5c] font-['Poppins'] font-medium">
                    {formatDateDisplay(endDate)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEndDate('')
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
              {!startDate && !endDate && (
                <span className="text-xs text-gray-400 italic">Aucune date sélectionnée</span>
              )}
            </div>
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
      <div className="flex gap-[6px] items-center p-[6px] border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleClear}
          className="flex-1 border border-gray-600 px-3 py-[6px] rounded-lg text-xs font-['Poppins'] font-medium text-[#053f5c] hover:bg-gray-100 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Supprimer les filtres</span>
        </button>
        <button
          onClick={handleApply}
          className="flex-1 bg-[#f27f09] px-3 py-[6px] rounded-lg text-xs font-['Poppins'] font-medium text-[#242a35] hover:bg-[#e67e00] flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          <span>Appliquer les filtres</span>
        </button>
      </div>
    </div>
  )
}
