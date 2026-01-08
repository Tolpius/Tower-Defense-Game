export class Enemy extends Phaser.GameObjects.PathFollower {
    duration = 40000;
    hp = 100;

    lastDirection = "down";
    lastX: number;
    lastY: number;
    ident = "scorpion";
    flipAnimation = false;

    constructor(scene: Phaser.Scene, path: Phaser.Curves.Path, ident: string) {
        super(scene, path, path.startPoint.x, path.startPoint.y, ident);
        scene.add.existing(this);
        this.lastX = this.x;
        this.lastY = this.y;
        this.ident = ident;

        this.createAnimations();
        // Startanimation
        if (scene.anims.exists(`${ident}-walk-down`)) {
            this.play(`${ident}-walk-down`);
        }
    }

    private createAnimations() {
        const anims = this.scene.anims;

        // Up
        if (!anims.exists(`${this.ident}-walk-up`)) {
            anims.create({
                key: `${this.ident}-walk-up`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 32,
                    end: 39,
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
                    start: 24,
                    end: 31,
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
                    start: 40,
                    end: 47,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }

        if (!anims.exists(`${this.ident}-death-up`)) {
            anims.create({
                key: `${this.ident}-death-up`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 56,
                    end: 63,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        if (!anims.exists(`${this.ident}-death-down`)) {
            anims.create({
                key: `${this.ident}-death-down`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 48,
                    end: 55,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }

        if (!anims.exists(`${this.ident}-death-side`)) {
            anims.create({
                key: `${this.ident}-death-side`,
                frames: anims.generateFrameNumbers(this.ident, {
                    start: 64,
                    end: 71,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }
    }

    start() {
        this.startFollow({ rotateToPath: false, duration: this.duration });
    }

    update() {
        //Calculate direction
        const dx = this.x - this.lastX;
        const dy = this.y - this.lastY;
        let direction = this.lastDirection;

        if (Math.abs(dx) > Math.abs(dy)) {
            direction = "side";
            if (dx > 0) {
                this.flipAnimation = true;
            } else {
                this.flipAnimation = false;
            }
        } else if (Math.abs(dy) > 0) {
            direction = dy > 0 ? "down" : "up";
        }
        // ON DEATH
        if (this.hp <= 0) {
            this.stopFollow();
            let deathAnim = `${this.ident}-death-${direction}`;
            this.play(deathAnim);
            this.flipX = this.flipAnimation;
            this.on(
                Phaser.Animations.Events.ANIMATION_COMPLETE,
                () => {
                    this.destroy();
                },
                this
            );
            return;
        }
        // Change animation if direction changed
        if (direction !== this.lastDirection) {
            if (
                direction === "down" &&
                this.scene.anims.exists(`${this.ident}-walk-down`)
            ) {
                this.play(`${this.ident}-walk-down`, true);
                this.flipX = this.flipAnimation;
            } else if (
                direction === "up" &&
                this.scene.anims.exists(`${this.ident}-walk-up`)
            ) {
                this.play(`${this.ident}-walk-up`, true);
                this.flipX = this.flipAnimation;
            } else if (
                direction === "side" &&
                this.scene.anims.exists(`${this.ident}-walk-side`)
            ) {
                this.play(`${this.ident}-walk-side`, true);
                this.flipX = this.flipAnimation;
            }

            this.lastDirection = direction;
        }

        this.lastX = this.x;
        this.lastY = this.y;
    }
}

