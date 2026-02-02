import { Preloader } from "../../scenes/Preloader";
import loadCatapultSprites from "./towerSprites/catapultSprites";
import loadCrystalSprites from "./towerSprites/crystalSprites";
import loadSlingshotSprites from "./towerSprites/slingshotSprites";
export default function loadTowerSprites(preloader: Preloader) {
    //Load Sprites of all towers
    loadCatapultSprites(preloader);
    loadCrystalSprites(preloader);
    loadSlingshotSprites(preloader);
}

