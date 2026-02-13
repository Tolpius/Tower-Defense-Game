import { authStorage, syncInfiniteModes } from "../../../auth";

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

/** Temporärer Cheat-Unlock für alle Maps (Session-only) */
let _allUnlockedTemporarily = false;

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

function normalizeCompletedMaps(completedMaps: string[]): string[] {
    const unique = new Set(
        completedMaps.filter((value) => /^([1-9]\d*)-([1-9]\d*)$/.test(value)),
    );
    return Array.from(unique).sort((a, b) => {
        const [wa, ma] = a.split("-").map(Number);
        const [wb, mb] = b.split("-").map(Number);
        if (wa !== wb) {
            return wa - wb;
        }
        return ma - mb;
    });
}

/** Erzeugt den Key für eine Map */
function getMapKey(worldId: number, mapId: number): string {
    return `${worldId}-${mapId}`;
}

/**
 * Prüft, ob der Infinite-Mode für eine Map freigeschaltet ist.
 * Voraussetzung: Map wurde mindestens einmal im normalen Modus gewonnen.
 * Oder: Temporärer Cheat-Unlock aktiv.
 */
export function isInfiniteModeUnlocked(
    worldId: number,
    mapId: number,
): boolean {
    // Temporärer Cheat-Unlock
    if (_allUnlockedTemporarily) return true;

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
        saveProgress({ completedMaps: normalizeCompletedMaps(progress.completedMaps) });
        console.log(`🔓 Infinite Mode für Map ${key} freigeschaltet!`);
        void syncCompletedMapsWithBackend();
    }
}

/**
 * Gibt alle abgeschlossenen Maps zurück.
 */
export function getCompletedMaps(): string[] {
    return normalizeCompletedMaps(loadProgress().completedMaps);
}

/**
 * Überschreibt die lokal gespeicherten abgeschlossenen Maps.
 */
export function setCompletedMaps(completedMaps: string[]): void {
    saveProgress({ completedMaps: normalizeCompletedMaps(completedMaps) });
}

/**
 * Synchronisiert localStorage mit dem Backend für eingeloggte User.
 * - lokale Unlocks, die in der DB fehlen, werden ergänzt
 * - Ergebnis aus der DB wird lokal gespeichert
 */
export async function syncCompletedMapsWithBackend(): Promise<string[] | null> {
    const token = authStorage.get();
    if (!token) {
        return null;
    }

    const authApiUrl = import.meta.env.VITE_AUTH_API_URL ?? window.location.origin;
    const localCompletedMaps = getCompletedMaps();
    const response = await syncInfiniteModes(authApiUrl, token, localCompletedMaps);
    setCompletedMaps(response.completedMaps);
    return response.completedMaps;
}

/**
 * Setzt den gesamten Fortschritt zurück (für Debugging/Testing).
 */
export function resetProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Fortschritt zurückgesetzt!");
}

/**
 * Schaltet alle Infinite Modes temporär frei (bis zum Seiten-Refresh).
 * Wird durch Cheat-Code aktiviert.
 */
export function unlockAllInfiniteModesTemporarily(): void {
    _allUnlockedTemporarily = true;
}

/**
 * Prüft ob der temporäre Unlock aktiv ist.
 */
export function isAllUnlockedTemporarily(): boolean {
    return _allUnlockedTemporarily;
}
