import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The unsanitized HTML string
 * @returns Sanitized HTML string safe to render
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') return ''

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
        ALLOW_DATA_ATTR: false,
    })
}

/**
 * Sanitize HTML content for rich text display (Quill editor output)
 * More permissive than general sanitization for proper editor rendering
 */
export function sanitizeRichText(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') return ''

    return DOMPurify.sanitize(dirty, {
        ADD_ATTR: ['target'],
        ADD_TAGS: ['iframe'],
    })
}
