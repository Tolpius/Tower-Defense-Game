export class Enemy extends Phaser.GameObjects.PathFollower {
    duration = 40000;
    hp = 100;

    lastDirection = "down";
    lastX: number;
    lastY: number;
    ident = "scorpion";

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
                    start: 8,
                    end: 15,
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
                    start: 0,
                    end: 7,
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
                    start: 16,
                    end: 23,
                }),
                frameRate: 16,
                repeat: -1,
            });
        }
    }

    start() {
        this.startFollow({ rotateToPath: false, duration: this.duration });
    }

    update() {
        const dx = this.x - this.lastX;
        const dy = this.y - this.lastY;
        let direction = this.lastDirection;

        if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "right" : "left";
        } else if (Math.abs(dy) > 0) {
            direction = dy > 0 ? "down" : "up";
        }

        if (direction !== this.lastDirection) {
            if (
                direction === "down" &&
                this.scene.anims.exists(`${this.ident}-walk-down`)
            ) {
                this.play(`${this.ident}-walk-down`, true);
                this.flipX = false;
            } else if (
                direction === "up" &&
                this.scene.anims.exists(`${this.ident}-walk-up`)
            ) {
                this.play(`${this.ident}-walk-up`, true);
                this.flipX = false;
            } else if (
                direction === "left" &&
                this.scene.anims.exists(`${this.ident}-walk-side`)
            ) {
                this.play(`${this.ident}-walk-side`, true);
                this.flipX = false;
            } else if (
                direction === "right" &&
                this.scene.anims.exists(`${this.ident}-walk-side`)
            ) {
                this.play(`${this.ident}-walk-side`, true);
                this.flipX = true;
            }
            this.lastDirection = direction;
        }

        this.lastX = this.x;
        this.lastY = this.y;
    }
}

