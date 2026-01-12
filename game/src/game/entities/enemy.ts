export class Enemy extends Phaser.GameObjects.PathFollower {
    duration = 40000;
    healthBar: Phaser.GameObjects.Graphics;
    maxHp = 100;
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
        this.hp = this.maxHp;
        this.healthBar = this.scene.add.graphics();
        // Starte die passende Animation (z.B. 'leafbug_down')
        this.createAnimations();
        if (scene.anims.exists(`${ident}_down`)) {
            this.play(`${ident}_down`);
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

    // Die Animationen werden jetzt zentral in der Game-Scene erstellt

    start() {
        this.startFollow({ rotateToPath: false, duration: this.duration });
    }

    updateHealthBar() {
        const barWidth = 32;
        const barHeight = 6;
        const hpPercent = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);

        this.healthBar.clear();

        // Background
        this.healthBar.fillStyle(0x000000, 0.8);
        this.healthBar.fillRect(
            this.x - barWidth / 2,
            this.y - 30,
            barWidth,
            barHeight
        );

        // Foreground
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(
            this.x - barWidth / 2 + 1,
            this.y - 29,
            (barWidth - 2) * hpPercent,
            barHeight - 2
        );
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.onDeath();
            return;
        }
        this.updateHealthBar();
    }

    onDeath() {
        this.stopFollow();
        let deathAnim = `${this.ident}-death-${this.lastDirection}`;
        this.flipX = this.flipAnimation;
        console.log("Playing death animation:", deathAnim);
        this.play(deathAnim);

        this.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
                this.healthBar.destroy();
                this.destroy();
            },
            this
        );
    }

    update() {
        //Calculate direction
        const dx = this.x - this.lastX;
        const dy = this.y - this.lastY;
        let direction = this.lastDirection;

        this.updateHealthBar();

        if (Math.abs(dx) > Math.abs(dy)) {
            direction = "side";
            // flipX NUR wenn nach links (dx < 0)
            this.flipAnimation = dx < 0;
        } else if (Math.abs(dy) > 0) {
            direction = dy > 0 ? "down" : "up";
        }

        // Change animation if direction changed
        if (direction !== this.lastDirection) {
            const animKey = `${this.ident}-walk-${direction}`;

            if (this.scene.anims.exists(animKey)) {
                this.play(animKey, true);

                this.flipX = this.flipAnimation;
            }
            this.lastDirection = direction;
        }

        this.lastX = this.x;
        this.lastY = this.y;
    }
}

