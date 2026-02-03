import { Scene } from "phaser";
import { isCheater, onCheat, offCheat } from "../scripts/cheats/CheaterState";

/**
 * CheaterOverlay - Globale Overlay-Scene für das Cheater-Badge
 *
 * Diese Scene läuft parallel zu allen anderen Scenes und zeigt
 * das Cheater-Badge an, sobald der Spieler cheatet.
 */
export class CheaterOverlay extends Scene {
    private cheaterText?: Phaser.GameObjects.Text;
    private cheaterFrame?: Phaser.GameObjects.Graphics;
    private cheatCallback?: () => void;

    constructor() {
        super({ key: "CheaterOverlay" });
    }

    create() {
        // Callback registrieren für Cheat-Events
        this.cheatCallback = () => this.showCheaterBadge();
        onCheat(this.cheatCallback);

        // Falls schon Cheater, Badge sofort anzeigen
        if (isCheater()) {
            this.showCheaterBadge();
        }

        // Cleanup bei Shutdown
        this.events.once("shutdown", () => {
            if (this.cheatCallback) {
                offCheat(this.cheatCallback);
            }
        });
    }

    private showCheaterBadge() {
        const centerX = this.cameras.main.width / 2;

        // Falls schon vorhanden, nur wackeln
        if (this.cheaterText?.active) {
            this.tweens.add({
                targets: [this.cheaterText],
                angle: { from: -5, to: 5 },
                duration: 80,
                yoyo: true,
                repeat: 5,
            });
            return;
        }

        // Frame für "Cheater!" Badge
        this.cheaterFrame = this.add.graphics();
        this.cheaterFrame.lineStyle(3, 0xff0000, 1);
        this.cheaterFrame.fillStyle(0x000000, 0.7);
        this.cheaterFrame.fillRoundedRect(centerX - 60, 10, 120, 32, 8);
        this.cheaterFrame.strokeRoundedRect(centerX - 60, 10, 120, 32, 8);

        this.cheaterText = this.add
            .text(centerX, 26, "🎮 Cheater!", {
                fontSize: "18px",
                color: "#ff4444",
                fontStyle: "bold",
            })
            .setOrigin(0.5);

        // Wackel-Animation für extra Shame 😈
        this.tweens.add({
            targets: [this.cheaterText],
            angle: { from: -5, to: 5 },
            duration: 80,
            yoyo: true,
            repeat: 5,
        });
    }
}

