import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Note: This runs on the client. On server, returns the input string as-is.
 */
export function sanitizeHtml(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') return ''
    
    // DOMPurify needs a DOM point to work (window). 
    // In Next.js SSR, we skip sanitization on the server and do it on the client.
    if (typeof window === 'undefined') {
        return dirty
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
        ALLOW_DATA_ATTR: false,
    }) as string
}

/**
 * Sanitize HTML content for rich text display
 */
export function sanitizeRichText(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') return ''

    if (typeof window === 'undefined') {
        return dirty
    }

    return DOMPurify.sanitize(dirty, {
        ADD_ATTR: ['target'],
        ADD_TAGS: ['iframe'],
    }) as string
}
