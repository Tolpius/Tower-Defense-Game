import { Enemy } from "../enemy";
import { Game as GameScene } from "../../scenes/Game";
import {
    TOWER_CONFIGS,
    TowerConfig,
    TowerType,
} from "../../../config/towerConfig";
import { Tower } from "../tower";

export class CatapultTower extends Tower {
    protected weapon: Phaser.GameObjects.Sprite;
    protected config: TowerConfig;
    constructor(scene: GameScene, x: number, y: number, isPreview: boolean) {
        const config = TOWER_CONFIGS[TowerType.Catapult];
        console.log(config);
        super(scene, x, y, config, isPreview);
        this.config = config;
        scene.add.existing(this);
        const towerBase = scene.add.sprite(0, 0, this.config.baseSprite, 0);
        towerBase.setInteractive();
        towerBase.on("pointerdown", () => {
            scene.selectedTower?.hideRange();
            scene.selectedTower = this;
            this.showRange();
        });
        this.weapon = scene.add.sprite(0, -16, this.config.weaponSprite!, 0);
        this.rangeCircle = scene.add.circle(
            0, // x relativ zum Tower
            32, // y relativ zum Tower (offset to account for tower visual position)
            this.range, // Radius
            0x00ff00, // Farbe (grün)
            0.25, // Alpha (transparent)
        );
        this.rangeCircle.setVisible(false).setDepth(9999); // Always render on top, independent of y position
        this.createAnimations();
        this.add([towerBase, this.weapon]);
        this.updateDepth();
    }

    protected createAnimations(): void {
        const anims = this.scene.anims;
        if (!anims.exists(`${this.config.weaponSprite}-shoot`)) {
            anims.create({
                key: `${this.config.weaponSprite}-shoot`,
                frames: anims.generateFrameNumbers(this.config.weaponSprite!, {
                    start: 0,
                    end: 7,
                }),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.config.projectileSprite}-fly`)) {
            anims.create({
                key: `${this.config.projectileSprite}-fly`,
                frames: anims.generateFrameNumbers(
                    this.config.projectileSprite!,
                    {
                        start: 0,
                        end: 5,
                    },
                ),
                frameRate: 12,
                repeat: -1,
            });
        }
        if (!anims.exists(`${this.config.impactSprite}`)) {
            anims.create({
                key: `${this.config.impactSprite}`,
                frames: anims.generateFrameNumbers(this.config.impactSprite!, {
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
        _delta: number,
        enemies: Phaser.GameObjects.Group,
    ): void {
        this.updateDepth();
        const target = this.getTarget(enemies);
        if (!target) return;

        this.weapon.rotation =
            Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y) + 90;
        if (!this.canShoot(time)) return;
        if (target.hp <= this.damage) target.isGoingToDie = true;
        this.shoot(target);
        this.lastFired = time;
    }

    protected shoot(target: Enemy): void {
        // Remove any existing animation handlers to prevent multiple projectiles
        this.weapon.off(Phaser.Animations.Events.ANIMATION_UPDATE);

        this.weapon.play(`${this.config.weaponSprite}-shoot`, true);

        let projectileSpawned = false;
        const handler = (
            anim: Phaser.Animations.Animation,
            frame: Phaser.Animations.AnimationFrame,
        ) => {
            if (anim.key !== `${this.config.weaponSprite}-shoot`) return;

            if (frame.index === 6 && target && !projectileSpawned) {
                projectileSpawned = true;
                this.spawnProjectile(target);
                this.weapon.off(
                    Phaser.Animations.Events.ANIMATION_UPDATE,
                    handler,
                );
            }
        };
        this.weapon.on(Phaser.Animations.Events.ANIMATION_UPDATE, handler);

        // Reset to first frame after animation completes
        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.weapon.setFrame(0);
        });
    }

    protected spawnProjectile(target: Enemy): void {
        // Calculate muzzle position based on weapon rotation
        const muzzleDistance = 16;
        const muzzleX =
            this.x + Math.cos(this.weapon.rotation) * muzzleDistance;
        const muzzleY =
            this.y + Math.sin(this.weapon.rotation) * muzzleDistance;

        const projectile = this.scene.add
            .sprite(muzzleX, muzzleY, this.config.projectileSprite!, 0)
            .setDepth(1);
        projectile.play(`${this.config.projectileSprite}-fly`);

        const speed = 200; // pixels per second

        const updateProjectile = () => {
            if (!projectile.active) return;

            // Get current target position (or last known if dead)
            const targetX =
                target && target.isAlive
                    ? target.x
                    : (projectile.getData("lastTargetX") ?? target.x);
            const targetY =
                target && target.isAlive
                    ? target.y
                    : (projectile.getData("lastTargetY") ?? target.y);

            // Store last known position
            if (target && target.isAlive) {
                projectile.setData("lastTargetX", target.x);
                projectile.setData("lastTargetY", target.y);
            }

            // Calculate direction and distance
            const dx = targetX - projectile.x;
            const dy = targetY - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Rotate projectile towards target
            projectile.rotation = Math.atan2(dy, dx);

            // Check if projectile reached target
            if (distance < 10) {
                projectile.destroy();
                const impact = this.scene.add
                    .sprite(targetX, targetY, this.config.impactSprite!, 0)
                    .setDepth(1);
                impact.play(`${this.config.impactSprite}`);
                const targetsInImpactRadius = this.getTargets(
                    (this.scene as GameScene).enemies,
                    30,
                    { x: targetX, y: targetY },
                );
                targetsInImpactRadius.forEach((enemy) => {
                    enemy.isAlive && enemy.takeDamage(this.damage);
                });
                impact.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    impact.destroy();
                });
                return;
            }

            // Move projectile towards target
            const moveDistance = speed * (this.scene.game.loop.delta / 1000);
            projectile.x += (dx / distance) * moveDistance;
            projectile.y += (dy / distance) * moveDistance;
        };

        // Add update listener
        this.scene.events.on("update", updateProjectile);

        // Clean up when projectile is destroyed
        projectile.on("destroy", () => {
            this.scene.events.off("update", updateProjectile);
        });
    }
}

