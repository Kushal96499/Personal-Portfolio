import DOMPurify from 'dompurify';

export const sanitize = (content: string): string => {
    return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
};
