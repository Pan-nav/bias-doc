/**
 * Email validation rules (why each exists):
 *  Presence check: we need an identifier to look up or create the account.
 *  Format check: Must contain @ and a domain like .com or .co.uk
 */
export function validateEmail(email: string): { valid: boolean; error: string } {
	const trimmed = email.trim();
	if (trimmed.length === 0) {
		return { valid: false, error: 'Email is required' };
	}
	if (!trimmed.includes('@')) {
		return { valid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
	}
	const afterAt = trimmed.split('@')[1] ?? '';
	if (!afterAt || !afterAt.includes('.')) {
		return { valid: false, error: 'Please enter a valid email address (e.g. name@example.com)' };
	}
	return { valid: true, error: '' };
}

/**
 * Password validation rules (why each exists):
 * Length check: shorter passwords are easier to guess; 8 is a common minimum.
 * Presence check: mixed character types improve security.
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters');
	}
	if (!/[0-9]/.test(password)) {
		errors.push('Password must contain at least one number');
	}
	return { valid: errors.length === 0, errors };
}
