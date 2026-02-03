/**
 * ProgressManager - Verwaltet Spielfortschritt im localStorage
 *
 * Speichert welche Maps im normalen Modus gewonnen wurden,
 * um den Infinite-Mode freizuschalten.
 */

const STORAGE_KEY = "td-game-progress";

interface ProgressData {
    /** Maps, die im normalen Modus gewonnen wurden (Format: "worldId-mapId") */
    completedMaps: string[];
}

/** Lädt den Fortschritt aus dem localStorage */
function loadProgress(): ProgressData {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data) as ProgressData;
        }
    } catch (e) {
        console.warn("Failed to load progress from localStorage:", e);
    }
    return { completedMaps: [] };
}

/** Speichert den Fortschritt im localStorage */
function saveProgress(progress: ProgressData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn("Failed to save progress to localStorage:", e);
    }
}

/** Erzeugt den Key für eine Map */
function getMapKey(worldId: number, mapId: number): string {
    return `${worldId}-${mapId}`;
}

/**
 * Prüft, ob der Infinite-Mode für eine Map freigeschaltet ist.
 * Voraussetzung: Map wurde mindestens einmal im normalen Modus gewonnen.
 */
export function isInfiniteModeUnlocked(worldId: number, mapId: number): boolean {
    const progress = loadProgress();
    return progress.completedMaps.includes(getMapKey(worldId, mapId));
}

/**
 * Schaltet den Infinite-Mode für eine Map frei.
 * Wird aufgerufen, wenn der Spieler die Map im normalen Modus gewinnt.
 */
export function unlockInfiniteMode(worldId: number, mapId: number): void {
    const progress = loadProgress();
    const key = getMapKey(worldId, mapId);

    if (!progress.completedMaps.includes(key)) {
        progress.completedMaps.push(key);
        saveProgress(progress);
        console.log(`🔓 Infinite Mode für Map ${key} freigeschaltet!`);
    }
}

/**
 * Gibt alle abgeschlossenen Maps zurück.
 */
export function getCompletedMaps(): string[] {
    return loadProgress().completedMaps;
}

/**
 * Setzt den gesamten Fortschritt zurück (für Debugging/Testing).
 */
export function resetProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Fortschritt zurückgesetzt!");
}
