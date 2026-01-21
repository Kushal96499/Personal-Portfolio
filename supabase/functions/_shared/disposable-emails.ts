// Disposable/Temporary Email Domain Blocklist
// Common temp mail services that should be rejected

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
    // Top temporary email services
    '10minutemail.com',
    '10minutemail.net',
    '20minutemail.com',
    'tempmail.com',
    'temp-mail.org',
    'throwaway.email',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamailblock.com',
    'mailinator.com',
    'mailinator2.com',
    'getnada.com',
    'trashmail.com',
    'trash-mail.com',
    'yopmail.com',
    'fakeinbox.com',
    'maildrop.cc',
    'mohmal.com',
    'sharklasers.com',
    'dispostable.com',
    'mintemail.com',
    'mytemp.email',
    'temp-mail.io',
    'tempail.com',
    'tempemail.net',
    'emailondeck.com',
    'fakemailgenerator.com',
    'safetymail.info',
    'inboxkitten.com',
    'throwam.com',
    'tempinbox.com',
    'mailnesia.com',
    'mailnull.com',
    'spambox.us',
    'spamgourmet.com',
    'spamgourmet.net',
    'spamgourmet.org',
    'spammotel.com',
    'spaml.com',
    'spamex.com',
    'spamfree24.com',
    'spamfree24.eu',
    'spamfree24.info',
    'spamfree24.net',
    'spamfree24.org',
    'tempr.email',
    'dropmail.me',
    'getairmail.com',
    'gmailnator.com',
    'mymailcrow.com',
    'putthisinyourspamdatabase.com',
    'spamhereplease.com',
    'squizzy.de',
    'thisisnotmyrealemail.com',
    'mt2009.com',
    'mt2014.com',
    'filzmail.com',
    'emltmp.com',
    'emailtemporanea.com',
    'emailtemporanea.net',
    'emailtemporario.com.br',
    '10mail.org',
    '20mail.it',
    '30mail.ir',
    'anonymbox.com',
    'armyspy.com',
    'cuvox.de',
    'dayrep.com',
    'einrot.com',
    'fleckens.hu',
    'gustr.com',
    'jourrapide.com',
    'rhyta.com',
    'superrito.com',
    'teleworm.us',
    'gufum.com',
    'mx0.wwwnew.eu',
    'zetmail.com',
    'vusra.com',
    'tafmail.com',
    'moakt.com',
    'emeil.in',
    'emeil.ir',
    'cmail.com',
    'dmail.com',
    'mail.com',
    'mail1a.de',
    'mailbidon.com',
    'mailcatch.com',
    'maileater.com',
    'mailforspam.com',
    'mailfreeonline.com',
    'mailme.ir',
    'mailmetrash.com',
    'mailmoat.com',
    'mailnator.com',
    'mailin8r.com',
    'mailsac.com',
    'mailinator.net',
]);

/**
 * Check if an email domain is a known disposable/temporary email service
 */
export function isDisposableEmail(email: string): boolean {
    try {
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) return true; // Invalid email format

        return DISPOSABLE_EMAIL_DOMAINS.has(domain);
    } catch {
        return true; // Error = treat as suspicious
    }
}

/**
 * Validate email format using regex
 */
export function isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Comprehensive email validation
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || email.trim() === '') {
        return { valid: false, error: 'Email is required' };
    }

    if (!isValidEmailFormat(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    if (isDisposableEmail(email)) {
        return { valid: false, error: 'Temporary/disposable emails are not allowed' };
    }

    return { valid: true };
}
