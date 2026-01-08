export abstract class Tower extends Phaser.GameObjects.Container {
    range = 120;
    fireRate = 1000;
    damage = 100;

    protected lastFired = 0;

    protected turret: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const towerBase = scene.add.sprite(0, 0, "tower3");
        this.turret = scene.add.sprite(0, -20, "tower3", 1);
        scene.add.existing(this);
    }

    protected canShoot(time: number): boolean {
        return time > this.lastFired + this.fireRate;
    }

   abstract update(time: number, delta: number, enemies: Phaser.GameObjects.GameObject[]): void
}
