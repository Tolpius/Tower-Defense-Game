import { Scene } from "phaser";

/**
 * FullscreenButton - Globale Overlay-Scene für Fullscreen-Toggle
 *
 * Zeigt einen kleinen Button in der Ecke an, der den Fullscreen-Modus
 * aktiviert/deaktiviert. Besonders nützlich für Mobile-Geräte.
 */
export class FullscreenButton extends Scene {
    private button!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "FullscreenButton" });
    }

    create() {
        const { width, height } = this.scale;

        // Fullscreen Button in der unteren rechten Ecke
        this.button = this.add
            .text(width - 16, height - 16, this.getButtonText(), {
                fontSize: "24px",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: { left: 8, right: 8, top: 4, bottom: 4 },
            })
            .setOrigin(1, 1)
            .setDepth(10000)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.toggleFullscreen())
            .on("pointerover", () => {
                this.button.setStyle({ backgroundColor: "rgba(0,0,0,0.8)" });
            })
            .on("pointerout", () => {
                this.button.setStyle({ backgroundColor: "rgba(0,0,0,0.5)" });
            });

        // Update button text when fullscreen changes
        this.scale.on("fullscreenchange", () => {
            this.button.setText(this.getButtonText());
        });

        // Resize handler
        this.scale.on("resize", this.onResize, this);
    }

    private getButtonText(): string {
        return this.scale.isFullscreen ? "⛶" : "⛶";
    }

    private toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }

    private onResize(gameSize: Phaser.Structs.Size) {
        const { width, height } = gameSize;
        this.button?.setPosition(width - 16, height - 16);
    }
}

