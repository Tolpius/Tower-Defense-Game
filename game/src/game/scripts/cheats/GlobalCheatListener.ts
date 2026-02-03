/**
 * GlobalCheatListener - Globaler Cheat-Code-Listener
 *
 * Funktioniert in allen Scenes und ermöglicht Cheats
 * auch außerhalb des Spiels (z.B. im Menü).
 */

import { markAsCheater } from "./CheaterState";
import { unlockAllInfiniteModesTemporarily } from "../progress/ProgressManager";

let _initialized = false;
let _cheatBuffer = "";
let _phaserGame: Phaser.Game | null = null;

/** Globale Cheats die überall funktionieren */
const globalCheats: Record<string, () => void> = {
    // Schaltet Infinite Mode für alle Maps temporär frei
    unlockall: () => {
        unlockAllInfiniteModesTemporarily();
        console.log(
            "🔓 UNLOCKALL! Alle Infinite Modes temporär freigeschaltet!",
        );
    },
};

/** Initialisiert den globalen Cheat-Listener */
export function initGlobalCheatListener(game: Phaser.Game): void {
    if (_initialized) return;
    _initialized = true;
    _phaserGame = game;

    window.addEventListener("keydown", handleKeyDown);
    console.log("🎮 Globaler Cheat-Listener aktiviert");
}

/** Entfernt den globalen Cheat-Listener */
export function destroyGlobalCheatListener(): void {
    if (!_initialized) return;
    _initialized = false;
    _phaserGame = null;

    window.removeEventListener("keydown", handleKeyDown);
}

function handleKeyDown(event: KeyboardEvent): void {
    // Ignoriere wenn in einem Input-Feld
    if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
    ) {
        return;
    }

    _cheatBuffer += event.key.toLowerCase();
    _cheatBuffer = _cheatBuffer.slice(-15); // Letzte 15 Zeichen behalten

    for (const [code, action] of Object.entries(globalCheats)) {
        if (_cheatBuffer.endsWith(code)) {
            action();
            _cheatBuffer = "";
            markAsCheater();

            // CheaterOverlay anzeigen
            if (_phaserGame) {
                const overlay = _phaserGame.scene.getScene("CheaterOverlay");
                if (overlay) {
                    if (_phaserGame.scene.isActive("CheaterOverlay")) {
                        _phaserGame.scene.stop("CheaterOverlay");
                    }
                    _phaserGame.scene.start("CheaterOverlay");
                    _phaserGame.scene.bringToTop("CheaterOverlay");
                }

                // MapSelector neu laden falls aktiv (für Endless-Button-Update)
                if (_phaserGame.scene.isActive("MapSelector")) {
                    const mapSelector =
                        _phaserGame.scene.getScene("MapSelector");
                    if (mapSelector) {
                        const data = (mapSelector as any).world;
                        _phaserGame.scene.stop("MapSelector");
                        _phaserGame.scene.start("MapSelector", { world: data });
                    }
                }
            }
        }
    }
}

