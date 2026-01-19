import { EnemyType } from "../../../config/enemyConfig";
import { Enemy } from "../enemy";

export class Flyinglocust extends Enemy {
    constructor(scene: Phaser.Scene, path: Phaser.Curves.Path) {
        super(scene, path, EnemyType.Flyinglocust);
    }
    protected createAnimations() {
        const anims = this.scene.anims;

        // Up
        if (!anims.exists(`${this.ident}-walk-up`)) {
            anims.create({
                key: `${this.ident}-walk-up`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 56,
                    end: 63,
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
                    start: 42,
                    end: 49,
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
                    start: 70,
                    end: 77,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }

        if (!anims.exists(`${this.ident}-death-up`)) {
            anims.create({
                key: `${this.ident}-death-up`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 98,
                    end: 111,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        if (!anims.exists(`${this.ident}-death-down`)) {
            anims.create({
                key: `${this.ident}-death-down`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 84,
                    end: 97,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        if (!anims.exists(`${this.ident}-death-side`)) {
            anims.create({
                key: `${this.ident}-death-side`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 112,
                    end: 125,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }
    }
}
