import { Enemy } from "../enemy";
import { Game as GameScene } from "../../scenes/Game";
import { TOWER_CONFIGS, TowerType } from "../../../config/towerConfig";
import { Tower } from "../tower";

export class CrystalTower extends Tower {
    protected weapon: Phaser.GameObjects.Sprite;
    constructor(
        scene: GameScene,
        x: number,
        y: number,
        level: number,
        isPreview: boolean,
    ) {
        const config = TOWER_CONFIGS[TowerType.Crystal];
        super(scene, x, y, config, level, isPreview);
        scene.add.existing(this);
        const towerBase = scene.add.sprite(
            0,
            0,
            this.spriteBase,
            this.level - 1,
        );
        towerBase.setInteractive();
        towerBase.on("pointerdown", () => {
            scene.selectedTower?.hideUi();
            scene.selectedTower = this;
            this.showUi();
        });
        this.weapon = scene.add.sprite(0, this.config.weaponOffsetY ?? -16, this.spriteWeapon, 0);
        this.rangeCircle = scene.add.circle(
            0, // x relativ zum Tower
            32, // y relativ zum Tower (offset to account for tower visual position)
            this.range, // Radius
            0x00ff00, // Farbe (grün)
            0.25, // Alpha (transparent)
        );
        this.rangeCircle.setVisible(false).setDepth(9999); // Always render on top, independent of y position
        this.createAnimations();
        this.weapon.play(`${this.spriteWeapon}-idle`);
        this.add([towerBase, this.weapon]);
        this.updateDepth();
    }

    protected createAnimations(): void {
        const anims = this.scene.anims;

        if (!anims.exists(`${this.spriteWeapon}-idle`)) {
            anims.create({
                key: `${this.spriteWeapon}-idle`,
                frames: anims.generateFrameNumbers(
                    this.spriteWeapon,
                    this.config.animationFrames?.idle,
                ),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: -1,
            });
        }

        if (!anims.exists(`${this.spriteWeapon}-shoot`)) {
            anims.create({
                key: `${this.spriteWeapon}-shoot`,
                frames: anims.generateFrameNumbers(
                    this.spriteWeapon,
                    this.config.animationFrames?.shoot,
                ),
                frameRate: (this.fireRate / 1000) * 8,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.spriteProjectile}-fly`)) {
            anims.create({
                key: `${this.spriteProjectile}-fly`,
                frames: anims.generateFrameNumbers(
                    this.spriteProjectile,
                    this.config.animationFrames?.projectile,
                ),
                frameRate: 12,
                repeat: 0,
            });
        }
        if (!anims.exists(`${this.spriteImpact}`)) {
            anims.create({
                key: `${this.spriteImpact}`,
                frames: anims.generateFrameNumbers(
                    this.spriteImpact,
                    this.config.animationFrames?.impact,
                ),
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
        if (!this.canShoot(time)) return;
        if (target.hp <= this.damage) target.isGoingToDie = true;
        this.shoot(target);
        this.lastFired = time;
    }

    protected shoot(target: Enemy): void {
        if (!this.isActive) return;

        // Store scene reference and config before any async operations
        const scene = this.scene as GameScene;
        const spriteProjectile = this.spriteProjectile;
        const spriteWeapon = this.spriteWeapon;
        const spriteImpact = this.spriteImpact;
        const damage = this.damage;
        const impactRange = this.config.impactRange;
        const maxTargets = this.config.maxTargets!;

        // Remove any existing animation handlers to prevent multiple projectiles
        this.weapon.off(Phaser.Animations.Events.ANIMATION_UPDATE);
        let ignoreList: Enemy[] = [];

        this.weapon.play(`${spriteWeapon}-shoot`, true);

        // Spawn cloud above the target
        const cloud = scene.add
            .sprite(target.x, target.y - 48, spriteProjectile)
            .setDepth(Math.floor(target.y - 48) + 75);
        cloud.play(`${spriteProjectile}-fly`);

        // When cloud animation finishes, spawn the impact projectile
        cloud.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            cloud.destroy();
            if (this.isActive) {
                this.lightningShot(
                    scene,
                    { x: cloud.x, y: cloud.y },
                    ignoreList,
                    spriteImpact,
                    damage,
                    impactRange,
                    maxTargets,
                    target,
                );
            }
        });

        // Reset weapon to idle after shoot animation completes
        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (this.isActive) {
                this.weapon.play(`${spriteWeapon}-idle`);
            }
        });
    }

    protected cleanupBeforeDestroy(): void {
        // Remove all animation listeners from weapon
        this.weapon?.off(Phaser.Animations.Events.ANIMATION_UPDATE);
        this.weapon?.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
        this.weapon?.stop();
    }

    private lightningShot(
        scene: GameScene,
        origin: { x: number; y: number },
        ignoreList: Enemy[],
        spriteImpact: string,
        damage: number,
        impactRange: number | undefined,
        maxTargets: number,
        target: Enemy | undefined = undefined,
    ): void {
        //If there is no target provided, get a new one
        if (!target) {
            target = this.getTarget(
                scene.enemies,
                impactRange,
                origin,
                ignoreList,
                false,
            );
        }
        // if there are no valid targets or max targets reached, return
        if (!target || ignoreList.length >= maxTargets) {
            return;
        }
        ignoreList.push(target);
        const targetX = target.x;
        const targetY = target.y;

        // Calculate angle from cloud to target - 45 degrees offset
        const angle =
            Phaser.Math.Angle.Between(origin.x, origin.y, targetX, targetY) -
            Math.PI / 4;

        // Spawn impact at cloud position
        const impact = scene.add
            .sprite(origin.x, origin.y, spriteImpact)
            .setDepth(Math.floor(origin.y) + 75)
            .setRotation(angle);
        impact.play(`${spriteImpact}`);

        // Fly impact down to target
        scene.tweens.add({
            targets: impact,
            x: targetX,
            y: targetY,
            duration: 150,
            onUpdate: () => {
                impact.setDepth(Math.floor(impact.y) + 75);
            },
            onComplete: () => {
                if (target && target.isAlive) {
                    target.takeDamage(damage);
                }
                impact.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    impact.destroy();
                });
                // If animation already finished during tween, destroy now
                if (!impact.anims.isPlaying) {
                    impact.destroy();
                }
                this.lightningShot(
                    scene,
                    target,
                    ignoreList,
                    spriteImpact,
                    damage,
                    impactRange,
                    maxTargets,
                );
            },
        });
    }

    // Not used for CrystalTower - projectile logic is handled in shoot()
    protected spawnProjectile(_target: Enemy): void {
        // Crystal tower handles projectile spawning directly in shoot()
    }
}

