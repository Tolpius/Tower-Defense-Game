import { Preloader } from "../../scenes/Preloader";

export default function loadEnemySprites(preloader: Preloader) {
    //ENEMY GENERATION
    preloader.load.spritesheet("scorpion", "/enemies/scorpion/Scorpion.png", {
        frameWidth: 64,
        frameHeight: 64,
    });

    preloader.load.spritesheet("leafbug", "/enemies/leafbug/Leafbug.png", {
        frameWidth: 64,
        frameHeight: 64,
    });

    preloader.load.spritesheet("firebug", "/enemies/firebug/Firebug.png", {
        frameWidth: 128,
        frameHeight: 64,
    });

    preloader.load.spritesheet("firewasp", "/enemies/firewasp/Firewasp.png", {
        frameWidth: 96,
        frameHeight: 96,
    });

    preloader.load.spritesheet("magmacrab", "/enemies/magmacrab/Magmacrab.png", {
        frameWidth: 64,
        frameHeight: 64,
    });

    preloader.load.spritesheet(
        "clampbeetle",
        "/enemies/clampbeetle/Clampbeetle.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );

    preloader.load.spritesheet(
        "flyinglocust",
        "/enemies/flyinglocust/FlyingLocust.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );

    preloader.load.spritesheet(
        "voidbutterfly",
        "/enemies/voidbutterfly/Voidbutterfly.png",
        {
            frameWidth: 64,
            frameHeight: 64,
        },
    );
}
