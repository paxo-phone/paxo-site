// js utils
// here put the code that you may need in other js files - @Welpike


export async function getData(url) {
    const response = await fetch(url);
    return response.json();
}

/**
 * Convert a string to an emoji - code from Grafikart (https://grafikart.fr/tutoriels/drapeau-emoji-fonction-2152)
 * @param {string} str
 * @returns {string} The emojis (string type is normal)
 */
export function strToEmoji(str) {
    return str
        .split('')
        .map(letter => letter.charCodeAt(0) % 32 + 0x1F1E5)
        .map(emojiStr => String.fromCodePoint(emojiStr))
        .join('')
}

/**
 * Converts the navigator.language response in usable language string for our scheme.
 * E.g: 'fr-FR' -> 'fr'
 *
 * @returns {string} the country code
 */
export function langCode() {
    return navigator.language.split('-')[0]
}

/**
 * Handle localStorage interactions
 */
export class Storage {
    static set(key, data) {
        localStorage.setItem(key, data)
    }

    static get(key) {
        return localStorage.getItem(key)
    }

    static delete(key) {
        localStorage.removeItem(key)
    }
}
