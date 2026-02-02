import { Preloader } from "../../../scenes/Preloader";
export default function loadCrystalSprites(preloader: Preloader) {
    //BASE
    preloader.load.spritesheet(
        "crystalbase",
        "/towers/crystal/crystalbase.png",
        {
            frameWidth: 64,
            frameHeight: 192,
        },
    );
    //LEVEL 1
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
    //LEVEL 2
    preloader.load.spritesheet(
        "crystal2weapon",
        "/towers/crystal/crystal2weapon.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    preloader.load.spritesheet(
        "crystal2projectile",
        "/towers/crystal/crystal2projectile.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    preloader.load.spritesheet(
        "crystal2impact",
        "/towers/crystal/crystal2impact.png",
        {
            frameWidth: 32,
            frameHeight: 32,
        },
    );
    //LEVEL 3
    preloader.load.spritesheet(
        "crystal3weapon",
        "/towers/crystal/crystal3weapon.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    preloader.load.spritesheet(
        "crystal3projectile",
        "/towers/crystal/crystal3projectile.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
    preloader.load.spritesheet(
        "crystal3impact",
        "/towers/crystal/crystal3impact.png",
        {
            frameWidth: 32,
            frameHeight: 32,
        },
    );
}

