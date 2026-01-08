export class Enemy extends Phaser.GameObjects.PathFollower {
    duration = 40000;
    hp = 100;

    constructor(scene, path) {
        super(scene, path, path.startPoint.x, path.startPoint.y, "scorpion");
        scene.add.existing(this);
        // Animation abspielen, falls vorhanden
        if (scene.anims.exists("scorpion-walk")) {
            this.play("scorpion-walk");
        }
    }

    start() {
        this.startFollow({ rotateToPath: false, duration: this.duration });
    }
}

