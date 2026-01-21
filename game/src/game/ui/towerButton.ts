import { TOWER_CONFIGS, TowerConfig, TowerType } from "../../config/towerConfig";
import { Game } from "../scenes/Game";

export class TowerButton extends Phaser.GameObjects.Container {
    private _cost: number;
    private bg: Phaser.GameObjects.Rectangle;
    private currentMoney = 0;
    private canAfford = true;
    private config: TowerConfig;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        iconKey: string,
        towerId: string
    ) {
        super(scene, x, y);
        this.config = TOWER_CONFIGS[towerId as TowerType];
        this._cost = this.config.cost;

        // Get initial money value from registry
        this.currentMoney = scene.registry.get("money") ?? 0;

        this.bg = scene.add
            .rectangle(0, 0, 64, 64, 0x333333)
            .setStrokeStyle(2, 0xffffff)
            .setAlpha(0.7)
            .setInteractive()
            .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                if (this.canAfford) {
                    if (!(scene.scene.get("Game") as Game).buildMode && pointer.button === 2) {
                        return;
                    }
                    scene.events.emit("tower-selected", towerId);
    
                }
            })
            .on("pointerover", () => {
                if (this.canAfford) {
                    this.bg.setAlpha(1);
                }
            })
            .on("pointerout", () => {
                this.updateVisuals();
            });

        const icon = scene.add.image(0, -8, iconKey).setScale(0.3);

        const text = scene.add
            .text(0, 20, `${this.cost}g`, {
                fontSize: "12px",
            })
            .setOrigin(0.5);

        this.add([this.bg, icon, text]);

        this.setSize(64, 64);

        // Initialize visuals with current money

        // Listen for money changes from Game scene
        scene.scene.get("Game").events.on("money-changed", (money: number) => {
            this.currentMoney = money;
            this.updateVisuals();
        });
        this.updateVisuals();
        scene.add.existing(this);
    }

    get cost() {
        return this._cost;
    }

    private updateVisuals() {
        this.canAfford = this.currentMoney >= this.cost;

        if (this.canAfford) {
            this.bg.setAlpha(0.7);
            this.bg.setStrokeStyle(2, 0xffffff);
            this.setAlpha(1);
        } else {
            this.bg.setAlpha(0.3);
            this.bg.setStrokeStyle(2, 0xff0000);
            this.setAlpha(0.5);
        }
    }
}

