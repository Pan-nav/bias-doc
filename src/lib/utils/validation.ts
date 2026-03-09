/**
 * validation.ts – Form validation for the login/signup page.
 * Kept in a separate file so we can reuse rules and keep the page component focused on layout.
 * For coursework: no over-optimisation; each rule is clear and commented.
 */

/**
 * Email validation rules (why each exists):
 * - Not empty: we need an identifier to look up or create the account.
 * - Must contain @: basic structure of an email.
 * - Must have a domain (e.g. .com, .co.uk): so we don't accept "user@" or "user@x".
 */
export function validateEmail(email: string): { valid: boolean; error: string } {
	const trimmed = email.trim();
	if (trimmed.length === 0) {
		return { valid: false, error: 'Please enter a valid email address' };
	}
	if (!trimmed.includes('@')) {
		return { valid: false, error: 'Please enter a valid email address' };
	}
	const afterAt = trimmed.split('@')[1] ?? '';
	if (!afterAt || !afterAt.includes('.')) {
		return { valid: false, error: 'Please enter a valid email address' };
	}
	return { valid: true, error: '' };
}

/**
 * Password validation rules (why each exists):
 * - Min 8 characters: shorter passwords are easier to guess; 8 is a common minimum.
 * - One uppercase: increases complexity.
 * - One number: mixed character types improve security.
 * We return the first error only so the UI stays simple; could show all in a list later.
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	if (password.length < 8) {
		errors.push('Password must be at least 8 characters');
	}
	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}
	if (!/[0-9]/.test(password)) {
		errors.push('Password must contain at least one number');
	}
	return { valid: errors.length === 0, errors };
}
