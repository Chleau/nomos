'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// Import dynamique de React Quill pour éviter les problèmes SSR
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[800px] bg-gray-50 animate-pulse rounded" />
})

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Commencez à rédiger...',
  className = ''
}) => {
  // Configuration de la toolbar avec les options de formatage
  // En mode lecture seule, on désactive complètement la toolbar
  const modules = useMemo(() => ({
    toolbar: disabled ? false : [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }), [disabled])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'indent',
    'align',
    'link', 'image',
    'color', 'background'
  ]

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
        className="bg-white"
      />

      <style jsx global>{`
        .rich-text-editor-wrapper {
          height: auto;
          min-height: 297mm;
        }

        .rich-text-editor-wrapper .quill {
          height: auto;
          min-height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .rich-text-editor-wrapper .ql-toolbar {
          background: white;
          border: none !important;
          border-bottom: 1px solid #e7eaed !important;
          border-radius: 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        /* Cacher complètement la toolbar en mode lecture seule */
        .rich-text-editor-wrapper .ql-toolbar.ql-snow:empty {
          display: none;
        }
        
        .rich-text-editor-wrapper .ql-container {
          flex: 1;
          border: none !important;
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12pt;
          height: auto !important;
          min-height: 200mm;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          height: auto !important;
          min-height: 200mm;
          padding: 20mm;
          color: #4a4a4a;
          line-height: 1.6;
          overflow-y: visible !important;
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #cbd5e1;
          font-style: italic;
        }
        
        /* Style pour les éléments formatés */
        .rich-text-editor-wrapper .ql-editor strong {
          font-weight: bold;
        }
        
        .rich-text-editor-wrapper .ql-editor em {
          font-style: italic;
        }
        
        .rich-text-editor-wrapper .ql-editor u {
          text-decoration: underline;
        }
        
        /* Style des boutons de la toolbar */
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button:focus,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: #f27f09 !important;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #f27f09 !important;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button:focus .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #f27f09 !important;
        }
        
        /* Mode lecture seule */
        .rich-text-editor-wrapper .ql-editor[contenteditable="false"] {
          cursor: default;
          background-color: #fafafa;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor
