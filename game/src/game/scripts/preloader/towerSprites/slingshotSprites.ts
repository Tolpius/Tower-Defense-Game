import { Preloader } from "../../../scenes/Preloader";
export default function loadSlingshotSprites(preloader: Preloader) {
    //BASE
    preloader.load.spritesheet(
        "slingshotbase",
        "/towers/slingshot/slingshotbase.png",
        {
            frameWidth: 64,
            frameHeight: 128,
        },
    );
    //LEVEL 1
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
    //LEVEL 2
    preloader.load.spritesheet(
        "slingshot2weapon",
        "/towers/slingshot/slingshot2weapon.png",
        {
            frameWidth: 96,
            frameHeight: 96,
        },
    );
    preloader.load.spritesheet(
        "slingshot2projectile",
        "/towers/slingshot/slingshot2projectile.png",
        {
            frameWidth: 10,
            frameHeight: 10,
        },
    );
    preloader.load.spritesheet(
        "slingshot2impact",
        "/towers/slingshot/slingshot2impact.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    //LEVEL 3
    preloader.load.spritesheet(
        "slingshot3weapon",
        "/towers/slingshot/slingshot3weapon.png",
        {
            frameWidth: 96,
            frameHeight: 96,
        },
    );
    preloader.load.spritesheet(
        "slingshot3projectile",
        "/towers/slingshot/slingshot3projectile.png",
        {
            frameWidth: 10,
            frameHeight: 10,
        },
    );
    preloader.load.spritesheet(
        "slingshot3impact",
        "/towers/slingshot/slingshot3impact.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
}

