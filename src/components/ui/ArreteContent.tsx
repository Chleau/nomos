'use client'

import React from 'react'
import 'react-quill-new/dist/quill.snow.css'

interface ArreteContentProps {
  content: string
  className?: string
}

/**
 * Composant pour afficher le contenu HTML d'un arrêté avec le bon formatage.
 * Préserve les styles, sauts de ligne, et mise en forme du RichTextEditor.
 */
export const ArreteContent: React.FC<ArreteContentProps> = ({
  content,
  className = ''
}) => {
  return (
    <div className={`arrete-content-wrapper ${className}`}>
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style jsx global>{`
                .arrete-content-wrapper .ql-editor {
                    padding: 20px;
                    color: #4a4a4a;
                    line-height: 1.6;
                    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 12pt;
                    overflow-wrap: break-word;
                    word-break: break-word;
                    hyphens: auto;
                }

                /* Préserver les sauts de ligne */
                .arrete-content-wrapper .ql-editor p {
                    margin-bottom: 1em;
                }

                .arrete-content-wrapper .ql-editor br {
                    display: block;
                    content: "";
                    margin-top: 0.5em;
                }

                /* Styles pour les titres */
                .arrete-content-wrapper .ql-editor h1 {
                    font-size: 2em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                    margin-top: 0.5em;
                }

                .arrete-content-wrapper .ql-editor h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                    margin-top: 0.5em;
                }

                .arrete-content-wrapper .ql-editor h3 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                    margin-top: 0.5em;
                }

                .arrete-content-wrapper .ql-editor h4 {
                    font-size: 1.1em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                    margin-top: 0.5em;
                }

                .arrete-content-wrapper .ql-editor h5 {
                    font-size: 1em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                    margin-top: 0.5em;
                }

                .arrete-content-wrapper .ql-editor h6 {
                    font-size: 0.9em;
                    font-weight: bold;
                    margin-bottom: 0.5em;
                    margin-top: 0.5em;
                }

                /* Styles de formatage de texte */
                .arrete-content-wrapper .ql-editor strong {
                    font-weight: bold;
                }

                .arrete-content-wrapper .ql-editor em {
                    font-style: italic;
                }

                .arrete-content-wrapper .ql-editor u {
                    text-decoration: underline;
                }

                .arrete-content-wrapper .ql-editor s {
                    text-decoration: line-through;
                }

                /* Styles pour les listes */
                .arrete-content-wrapper .ql-editor ol,
                .arrete-content-wrapper .ql-editor ul {
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }

                .arrete-content-wrapper .ql-editor li {
                    margin-bottom: 0.5em;
                }

                /* Styles pour l'alignement */
                .arrete-content-wrapper .ql-editor .ql-align-center {
                    text-align: center;
                }

                .arrete-content-wrapper .ql-editor .ql-align-right {
                    text-align: right;
                }

                .arrete-content-wrapper .ql-editor .ql-align-justify {
                    text-align: justify;
                }

                /* Styles pour les indentations */
                .arrete-content-wrapper .ql-editor .ql-indent-1 {
                    padding-left: 3em;
                }

                .arrete-content-wrapper .ql-editor .ql-indent-2 {
                    padding-left: 6em;
                }

                .arrete-content-wrapper .ql-editor .ql-indent-3 {
                    padding-left: 9em;
                }

                /* Styles pour les liens */
                .arrete-content-wrapper .ql-editor a {
                    color: #f27f09;
                    text-decoration: underline;
                }

                .arrete-content-wrapper .ql-editor a:hover {
                    color: #d66d07;
                }

                /* Styles pour les images */
                .arrete-content-wrapper .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    margin: 1em 0;
                }
            `}</style>
    </div>
  )
}

export default ArreteContent
