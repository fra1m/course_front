export function genPassword(length: number = 12): string {
	const chars =
		'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
	let out = '';

	const cryptoObj =
		typeof globalThis !== 'undefined' &&
		globalThis.crypto &&
		'getRandomValues' in globalThis.crypto
			? globalThis.crypto
			: null;

	if (cryptoObj) {
		const buf = new Uint32Array(length);
		cryptoObj.getRandomValues(buf);
		for (let i = 0; i < length; i++) {
			out += chars[buf[i] % chars.length];
		}
	} else {
		// Некриптографический запасной вариант (на всякий случай)
		for (let i = 0; i < length; i++) {
			out += chars[Math.floor(Math.random() * chars.length)];
		}
	}

	return out;
}
