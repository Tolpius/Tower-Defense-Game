import { Enemy } from "./enemy";
import { Game as GameScene } from "../scenes/Game";
import { TowerConfig } from "../../config/towerConfig";

export enum TargetPriority {
    First = "first",
    Strongest = "strongest",
}

export abstract class Tower extends Phaser.GameObjects.Container {
    protected config: TowerConfig;
    protected _range: number;
    protected _fireRate: number;
    protected _damage: number;
    protected lastFired = 0;
    protected rangeCircle!: Phaser.GameObjects.Arc;
    protected isPreview: boolean;
    protected targetPriority: TargetPriority = TargetPriority.First;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        config: TowerConfig,
        isPreview: boolean,
    ) {
        super(scene, x, y);
        this.config = config;
        this._range = config.range;
        this._fireRate = config.fireRate;
        this._damage = config.damage;
        this.isPreview = isPreview;
        console.log(this.config);
        console.log(isPreview);
        if (scene.layerHighground.getTileAtWorldXY(x, y, false)) {
            this._range *= config.highgroundRangeMultiplier;
        }
    }

    get range() {
        return this._range;
    }

    get fireRate() {
        return this._fireRate;
    }

    get damage() {
        return this._damage;
    }

    showRange() {
        this.rangeCircle.setPosition(this.x, this.y + 32);
        this.rangeCircle.setVisible(true);
    }

    hideRange() {
        this.rangeCircle.setVisible(false);
    }

    protected updateDepth() {
        // Set depth based on Y position for proper rendering order
        // Higher Y position = higher depth (rendered in front)
        this.depth = Math.floor(this.y);
    }

    protected canShoot(time: number): boolean {
        return !this.isPreview && time > this.lastFired + this.fireRate;
    }

    protected abstract createAnimations(): void;

    abstract update(
        time: number,
        delta: number,
        enemies: Phaser.GameObjects.Group,
    ): void;

    protected getTargets(
        enemies: Phaser.GameObjects.Group,
        radius?: number,
        position?: Phaser.Types.Math.Vector2Like,
    ): Enemy[] {
        const searchRadius = radius ?? this.range;
        return enemies
            .getChildren()
            .filter((gameObject: Phaser.GameObjects.GameObject) => {
                const e = gameObject as Enemy;
                return (
                    Phaser.Math.Distance.Between(
                        position?.x ?? this.x,
                        position?.y ?? this.y + 32,
                        e.x,
                        e.y,
                    ) <= searchRadius && e.isAlive
                );
            }) as Enemy[];
    }

    protected getTarget(enemies: Phaser.GameObjects.Group): Enemy | undefined {
        const targets = this.getTargets(enemies);
        if (targets.length === 0) return undefined;

        switch (this.targetPriority) {
            case TargetPriority.Strongest:
                // Get the enemy with the highest health
                return targets.reduce((strongest, current) =>
                    current.hp > strongest.hp ? current : strongest,
                );
            case TargetPriority.First:
            default:
                // Get the enemy furthest along the path (highest progress)
                return targets.reduce((first, current) => {
                    return current.pathProgress > first.pathProgress
                        ? current
                        : first;
                });
        }
    }

    setTargetPriority(priority: TargetPriority): void {
        this.targetPriority = priority;
    }

    getTargetPriority(): TargetPriority {
        return this.targetPriority;
    }

    protected abstract shoot(target: Enemy): void;

    protected abstract spawnProjectile(target: Enemy): void;
}

