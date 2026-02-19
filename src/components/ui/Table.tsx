import React from 'react'

// ----------------------------------------------------------------------------
// Primitives de Tableau (Style Système)
// ----------------------------------------------------------------------------

export type TableProps = React.HTMLAttributes<HTMLTableElement>;

export function Table({ className = '', ...props }: TableProps) {
  return (
    <div className={`w-full rounded-md border border-[#e7eaed] ${className}`}>
      <table className="w-full caption-bottom text-sm text-left table-fixed" {...props} />
    </div>
  )
}

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function TableHeader({ className = '', ...props }: TableHeaderProps) {
  return <thead className={`bg-[#e2e8f0] border-b border-[#e7eaed] ${className}`} {...props} />
}

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className = '', ...props }: TableBodyProps) {
  return <tbody className={`[&_tr:last-child]:border-0 text-[#475569] ${className}`} {...props} />
}

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={`border-b border-[#e7eaed] transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100 ${className}`}
      {...props}
    />
  )
}

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export function TableHead({ className = '', ...props }: TableHeadProps) {
  return (
    <th
      className={`h-[40px] px-4 align-middle font-medium text-[#475569] [&:has([role=checkbox])]:pr-0 ${className}`}
      {...props}
    />
  )
}

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export function TableCell({ className = '', ...props }: TableCellProps) {
  return (
    <td
      className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 h-[56px] ${className}`}
      {...props}
    />
  )
}

// ----------------------------------------------------------------------------
// Composants Helper pour le contenu des cellules (Basés sur le Figma)
// ----------------------------------------------------------------------------

// 1. Badge (ex: Catégorie)
interface BadgeProps {
  color?: 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal' | 'rose' | 'cyan'
  label: string
}

const badgeColorMap: Record<string, string> = {
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
}

export function TableBadge({ color = 'neutral', label }: BadgeProps) {
  const classes = badgeColorMap[color] || badgeColorMap.neutral
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-[2px] rounded-md text-xs font-normal border ${classes} min-w-[150px] text-center`}
    >
      {label}
    </span>
  )
}

// 2. User Info (Avatar + Nom + ID)
interface UserInfoProps {
  initials: string
  name: string
  subText?: string
}

export function TableUserInfo({ initials, name, subText }: UserInfoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-[#fef0e3] border border-[#f27f09] text-[#f27f09] w-[30px] h-[30px] items-center justify-center rounded-full text-xs shrink-0">
        {initials}
      </div>
      <div className="flex flex-col justify-center leading-tight">
        <span className="font-medium text-[#242a35] text-sm">{name}</span>
        {subText && <span className="text-[#64748b] text-sm font-normal">{subText}</span>}
      </div>
    </div>
  )
}

// 3. Status Dropdown (simulé ou réel)
// "En attente", "Résolu", "En cours", "Urgent"
interface StatusProps {
  status: 'En attente' | 'Résolu' | 'En cours' | 'Urgent' | string
}

export function TableStatus({ status }: StatusProps) {
  return (
    <div className="inline-flex items-center justify-between min-w-[135px] px-2 py-[2px] bg-white border border-[#e7eaed] rounded-lg">
      <span className="text-[#475569] text-sm">{status}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-500">
        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Composant "DataTable" Réutilisable (Configuration columns + data)
// ----------------------------------------------------------------------------

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  render?: (item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

import Pagination from '@/components/ui/Pagination'

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  headerCheckbox?: React.ReactNode
  getRowClassName?: (item: T) => string
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems?: number
    onPageChange: (page: number) => void
  }
}

export function DataTable<T extends { id?: string | number }>({ columns, data, emptyMessage = "Aucune donnée disponible", headerCheckbox, pagination, getRowClassName }: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} style={{ width: col.width }} className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}>
                {idx === 0 && headerCheckbox ? (
                  <div className="flex items-center justify-center">
                    {headerCheckbox}
                  </div>
                ) : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, rowIdx) => (
              <TableRow key={item.id ?? rowIdx} className={getRowClassName ? getRowClassName(item) : ''}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}>
                    {col.render
                      ? <div className={`flex w-full ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>{col.render(item)}</div>
                      : col.accessorKey
                        ? (item[col.accessorKey] as React.ReactNode)
                        : null
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <div className="py-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            itemCount={data.length}
            totalItems={pagination.totalItems}
          />
        </div>
      )}
    </div>
  )
}
