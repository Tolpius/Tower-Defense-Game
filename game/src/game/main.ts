import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { UI } from "./scenes/UI";
import { GameOver } from "./scenes/GameOver";
import { GameWon } from "./scenes/GameWon";
import MainMenu from "./scenes/MainMenu";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 576,
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [Boot, Preloader, MainMenu, MainGame, UI, GameOver, GameWon],
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
