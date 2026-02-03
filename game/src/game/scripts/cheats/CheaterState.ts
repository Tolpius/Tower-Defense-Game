/**
 * CheaterState - Globaler Cheater-Status
 *
 * Speichert ob der Spieler in dieser Session gecheatet hat.
 * Bleibt bis zum Seiten-Refresh aktiv (kein localStorage).
 */

let _isCheater = false;
let _onCheatCallbacks: (() => void)[] = [];

/** Prüft ob der Spieler ein Cheater ist */
export function isCheater(): boolean {
    return _isCheater;
}

/** Markiert den Spieler als Cheater (einmalig pro Session) */
export function markAsCheater(): void {
    if (_isCheater) return; // Schon Cheater

    _isCheater = true;
    console.log("🎮 Du bist jetzt ein Cheater! (bis zum Neustart)");

    // Alle registrierten Callbacks aufrufen
    _onCheatCallbacks.forEach((cb) => cb());
}

/** Registriert einen Callback der aufgerufen wird wenn gecheatet wird */
export function onCheat(callback: () => void): void {
    _onCheatCallbacks.push(callback);

    // Falls schon Cheater, sofort aufrufen
    if (_isCheater) {
        callback();
    }
}

/** Entfernt einen Callback */
export function offCheat(callback: () => void): void {
    _onCheatCallbacks = _onCheatCallbacks.filter((cb) => cb !== callback);
}

