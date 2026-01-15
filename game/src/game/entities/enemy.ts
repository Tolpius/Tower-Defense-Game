import { ENEMY_CONFIG, EnemyStats } from "../../config/enemyConfig";

export abstract class Enemy extends Phaser.GameObjects.PathFollower {
    duration: number;
    healthBar: Phaser.GameObjects.Graphics;
    maxHp: number;
    hp: number;
    moneyOnDeath: number;
    damageToBase: number;
    isAlive = true;
    hasReachedBase = false;
    isWorthMoney = true;
    config: EnemyStats;
    lastDirection = "down";
    lastX: number;
    lastY: number;
    ident: string;
    flipAnimation = false;

    constructor(scene: Phaser.Scene, path: Phaser.Curves.Path, ident: string) {
        super(scene, path, path.startPoint.x, path.startPoint.y, ident);
        scene.add.existing(this);

        // Config laden
        this.config = ENEMY_CONFIG[ident];
        if (!this.config) {
            console.warn(`No config found for enemy: ${ident}, using defaults`);
        }

        this.ident = ident;
        this.maxHp = this.config?.maxHp ?? 100;
        this.hp = this.maxHp;
        this.duration = this.config?.duration ?? 40000;
        this.moneyOnDeath = this.config?.moneyOnDeath ?? 10;
        this.damageToBase = this.config?.damageToBase ?? 50;

        this.lastX = this.x;
        this.lastY = this.y;
        this.healthBar = this.scene.add.graphics();

        this.createAnimations();
        if (scene.anims.exists(`${ident}-walk-down`)) {
            this.play(`${ident}-walk-down`);
        }
    }

    protected abstract createAnimations(): void;

    start() {
        this.startFollow({ rotateToPath: false, duration: this.duration }).on(
            "complete",
            () => {
                this.stopFollow();
                this.hasReachedBase = true;
                // Enemy reached the end of the path
                this.healthBar.destroy();
                this.setVisible(false);
            }
        );
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
        if (!this.isAlive) return;
        this.isAlive = false;
        this.stopFollow();
        let deathAnim = `${this.ident}-death-${this.lastDirection}`;
        this.flipX = this.flipAnimation;
        this.healthBar.setVisible(false);
        this.play(deathAnim);

        this.once(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
                this.setVisible(false);
                this.setActive(false);
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
            this.flipAnimation = this.config.sideAnimationLeft
                ? dx > 0
                : dx < 0;
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

    hasReachedEnd(): boolean {
        return !this.isFollowing();
    }
}

