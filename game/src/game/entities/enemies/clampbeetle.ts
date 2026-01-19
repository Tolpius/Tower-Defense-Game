import { EnemyType } from "../../../config/enemyConfig";
import { Enemy } from "../enemy";

export class Clampbeetle extends Enemy {
    constructor(scene: Phaser.Scene, path: Phaser.Curves.Path) {
        super(scene, path, EnemyType.Clampbeetle);
    }
    protected createAnimations() {
        const anims = this.scene.anims;

        // Up
        if (!anims.exists(`${this.ident}-walk-up`)) {
            anims.create({
                key: `${this.ident}-walk-up`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 52,
                    end: 59,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }

        // Down
        if (!anims.exists(`${this.ident}-walk-down`)) {
            anims.create({
                key: `${this.ident}-walk-down`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 39,
                    end: 46,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }

        // Sideway
        if (!anims.exists(`${this.ident}-walk-side`)) {
            anims.create({
                key: `${this.ident}-walk-side`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 65,
                    end: 72,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }

        if (!anims.exists(`${this.ident}-death-up`)) {
            anims.create({
                key: `${this.ident}-death-up`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 91,
                    end: 103,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        if (!anims.exists(`${this.ident}-death-down`)) {
            anims.create({
                key: `${this.ident}-death-down`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 78,
                    end: 90,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        if (!anims.exists(`${this.ident}-death-side`)) {
            anims.create({
                key: `${this.ident}-death-side`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 104,
                    end: 116,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }
    }
}
