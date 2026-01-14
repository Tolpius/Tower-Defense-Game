import { Enemy } from "./enemy";
import { Game as GameScene } from "../scenes/Game";

export class Tower extends Phaser.GameObjects.Container {
    range = 200;
    fireRate = 1200;
    damage = 50;

    protected lastFired = 0;
    protected turret: Phaser.GameObjects.Sprite;
    protected rangeCircle: Phaser.GameObjects.Circle;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);
        if (scene.layerHighground.getTileAtWorldXY(x, y, false) !== null) {
            this.range = this.range * 1.5;
        }
        const towerBase = scene.add.sprite(0, 0, "tower3", 0);
        towerBase.setInteractive();
        towerBase.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            scene.selectedTower?.hideRange();
            scene.selectedTower = this;
            this.showRange();
            console.log("Tower selected at:", this.x, this.y);
        });
        this.turret = scene.add.sprite(0, -16, "tower3turret1", 0);
        this.rangeCircle = scene.add.circle(
            0, // x relativ zum Tower
            0, // y relativ zum Tower
            this.range, // Radius
            0x00ff00, // Farbe (grün)
            0.25 // Alpha (transparent)
        );
        this.rangeCircle.setVisible(false);
        this.createAnimations();
        this.add([towerBase, this.turret, this.rangeCircle]);
    }
    showRange() {
        this.rangeCircle.setVisible(true);
    }

    hideRange() {
        this.rangeCircle.setVisible(false);
    }

    protected canShoot(time: number): boolean {
        return time > this.lastFired + this.fireRate;
    }

    protected createAnimations() {
        const anims = this.scene.anims;
        if (!anims.exists(`tower3turret1-shoot`)) {
            anims.create({
                key: `tower3turret1-shoot`,
                frames: anims.generateFrameNumbers("tower3turret1", {
                    start: 0,
                    end: 7,
                }),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: 0,
            });
        }
        if (!anims.exists(`tower3projectile1-fly`)) {
            anims.create({
                key: `tower3projectile1-fly`,
                frames: anims.generateFrameNumbers("tower3projectile1", {
                    start: 0,
                    end: 5,
                }),
                frameRate: 12,
                repeat: -1,
            });
        }
        if (!anims.exists(`tower3projectile1-impact`)) {
            anims.create({
                key: `tower3projectile1-impact`,
                frames: anims.generateFrameNumbers("tower3projectile1impact", {
                    start: 0,
                    end: 5,
                }),
                frameRate: 16,
                repeat: 0,
            });
        }
    }

    update(
        time: number,
        delta: number,
        enemies: Phaser.GameObjects.Group
    ): void {
        const target = this.getTarget(enemies);
        if (!target) return;

        this.turret.rotation =
            Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) + 90;
        if (!this.canShoot(time)) return;
        this.shoot(target);
        this.lastFired = time;
    }

    protected getTarget(enemies: Phaser.GameObjects.Group) {
        return enemies
            .getChildren()
            .find(
                (e: Enemy) =>
                    Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <=
                        this.range && e.isAlive
            );
    }

    protected shoot(target: any): void {
        this.turret.play(`tower3turret1-shoot`, true);
        const handler = (
            anim: Phaser.Animations.Animation,
            frame: Phaser.Animations.AnimationFrame
        ) => {
            if (anim.key !== "tower3turret1-shoot") return;

            if (frame.index === 6 && target) {
                this.spawnProjectile(target);
                this.turret.off(
                    Phaser.Animations.Events.ANIMATION_UPDATE,
                    handler
                );
            }
        };
        this.turret.on(Phaser.Animations.Events.ANIMATION_UPDATE, handler);
    }

    protected spawnProjectile(target: any): void {
        const projectile = this.scene.add
            .sprite(this.x, this.y - 16, "tower3projectile1", 0)
            .setDepth(1);
        projectile.play("tower3projectile1-fly");

        this.scene.tweens.add({
            targets: projectile,
            x: target.x,
            y: target.y,
            duration: 300,
            onComplete: () => {
                projectile.destroy();
                const impact = this.scene.add
                    .sprite(target.x, target.y, "tower3projectile1impact", 0)
                    .setDepth(1);
                impact.play("tower3projectile1-impact");
                if (target) {
                    target.takeDamage(this.damage);
                }
                impact.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    impact.destroy();
                });
            },
        });
    }
}

