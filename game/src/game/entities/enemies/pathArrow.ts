import { EnemyType } from "../../../config/enemyConfig";
import { Enemy } from "../enemy";

export class PathArrow extends Enemy {
    constructor(scene: Phaser.Scene, path: Phaser.Curves.Path) {
        super(scene, path, EnemyType.PathArrow);
        this.healthBar.setVisible(false);
        this.isAlive = false;
    }
    protected createAnimations() {
        const anims = this.scene.anims;
        if (!anims.exists(`${this.ident}-walk`)) {
            anims.create({
                key: `${this.ident}-walk`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 0,
                    end: 5,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }
    }

    start() {
        this._startTime = this.scene.time.now;
        this.startFollow({
            rotateToPath: true,
            duration: this.duration,
            onComplete: () => {
                this._pathProgress = 1;
                this.stopFollow();
                this.hasReachedBase = true;
                // Enemy reached the end of the path
                this.healthBar.destroy();
                this.progressBar.destroy();
                this.progressText.destroy();
                this.setVisible(false);
            },
        });
        this.play(`${this.ident}-walk`);
    }
    update() {}
    onDeath() {
        this.setVisible(false);
        this.setActive(false);
    }
}

