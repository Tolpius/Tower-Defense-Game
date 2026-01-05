export class Start extends Phaser.Scene {
  constructor() { super('Start'); }

  preload() {
    // Map JSON
    this.load.tilemapTiledJSON('level1', 'assets/maps/TD-map-lvl1 Kopie.json');

    // Tileset-Bild (prüfe Pfad + Name exakt!)
    this.load.image('grass_tiles', 'assets/tiles/TD-map-GrassTiles.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    const map = this.make.tilemap({ key: 'level1' });

    const tilesetGrass = map.addTilesetImage('Grass Tileset', 'grass_tiles');

    // Richtig benannte Layer aus der Map
    map.createLayer('Terrain_Background', tilesetGrass);
    map.createLayer('Terrain_Path', tilesetGrass);
    map.createLayer('Terrain_Water', tilesetGrass);
    map.createLayer('Terrain_Cliffs', tilesetGrass);
    map.createLayer('Props', tilesetGrass);
    map.createLayer('Details', tilesetGrass);

    console.log('✅ All 6 Tile Layers loaded from Grass Tileset');
  }
}
