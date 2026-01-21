import { Preloader } from "../../scenes/Preloader";

export default function loadTowerSprites(preloader: Preloader) {
    //SLINGSHOT

    preloader.load.spritesheet(
        "slingshot1base",
        "/towers/slingshot/slingshot1base.png",
        {
            frameWidth: 64,
            frameHeight: 128,
        },
    );
    preloader.load.spritesheet(
        "slingshot1weapon",
        "/towers/slingshot/slingshot1weapon.png",
        {
            frameWidth: 96,
            frameHeight: 96,
        },
    );
    preloader.load.spritesheet(
        "slingshot1projectile",
        "/towers/slingshot/slingshot1projectile.png",
        {
            frameWidth: 10,
            frameHeight: 10,
        },
    );
    preloader.load.spritesheet(
        "slingshot1impact",
        "/towers/slingshot/slingshot1impact.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );

    //CATAPULT

    preloader.load.spritesheet(
        "catapult1base",
        "/towers/catapult/catapult1base.png",
        {
            frameWidth: 64,
            frameHeight: 128,
        },
    );
    preloader.load.spritesheet(
        "catapult1weapon",
        "/towers/catapult/catapult1weapon.png",
        {
            frameWidth: 128,
            frameHeight: 128,
        },
    );
    preloader.load.spritesheet(
        "catapult1projectile",
        "/towers/catapult/catapult1projectile.png",
        {
            frameWidth: 8,
            frameHeight: 8,
        },
    );
    preloader.load.spritesheet(
        "catapult1impact",
        "/towers/catapult/catapult1impact.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );

    //Crystal Tower

    preloader.load.spritesheet(
        "crystal1base",
        "/towers/crystal/crystal1base.png",
        {
            frameWidth: 64,
            frameHeight: 192,
        },
    );
    preloader.load.spritesheet(
        "crystal1weapon",
        "/towers/crystal/crystal1weapon.png",
        {
            frameWidth: 48,
            frameHeight: 48,
        },
    );
    preloader.load.spritesheet(
        "crystal1projectile",
        "/towers/crystal/crystal1projectile.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    preloader.load.spritesheet(
        "crystal1impact",
        "/towers/crystal/crystal1impact.png",
        {
            frameWidth: 32,
            frameHeight: 32,
        },
    );
}

