import { Preloader } from "../../../scenes/Preloader";
export default function loadCatapultSprites(preloader: Preloader) {
    //BASE
    preloader.load.spritesheet(
        "catapultbase",
        "/towers/catapult/catapultbase.png",
        {
            frameWidth: 64,
            frameHeight: 128,
        },
    );
    //LEVEL 1
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
    //LEVEL 2
    preloader.load.spritesheet(
        "catapult2weapon",
        "/towers/catapult/catapult2weapon.png",
        {
            frameWidth: 128,
            frameHeight: 128,
        },
    );
    preloader.load.spritesheet(
        "catapult2projectile",
        "/towers/catapult/catapult2projectile.png",
        {
            frameWidth: 15,
            frameHeight: 12,
        },
    );
    preloader.load.spritesheet(
        "catapult2impact",
        "/towers/catapult/catapult2impact.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    //LEVEL 3
    preloader.load.spritesheet(
        "catapult3weapon",
        "/towers/catapult/catapult3weapon.png",
        {
            frameWidth: 128,
            frameHeight: 128,
        },
    );
    preloader.load.spritesheet(
        "catapult3projectile",
        "/towers/catapult/catapult3projectile.png",
        {
            frameWidth: 10,
            frameHeight: 10,
        },
    );
    preloader.load.spritesheet(
        "catapult3impact",
        "/towers/catapult/catapult3impact.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
}

