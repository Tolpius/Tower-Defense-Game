export class Enemy extends Phaser.GameObjects.PathFollower {
    duration = 40000;
    hp = 100;

    constructor(scene, path) {
        super(scene, path, path.startPoint.x, path.startPoint.y, "enemy");
        scene.add.existing(this);
    }

    start() {
        this.startFollow({ rotateToPath: false, duration: this.duration });
    }
}

