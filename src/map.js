import Platforms from './platforms';

import {
  TILEMAP_KEYS,
  TILESET_KEYS,
  IMAGE_KEYS,
  SPRITESHEET_KEYS,
  SOUND_KEYS
} from './utils/constants';

export default class Map {
  scene;
  tilemap;
  layers;
  platforms;

  constructor(scene) {
    this.scene = scene;

    this.tilemap = this.scene.add.tilemap(TILEMAP_KEYS.FLAG_RACE);

    const snowTileset = this.tilemap.addTilesetImage(TILESET_KEYS.SNOW, IMAGE_KEYS.SNOW, 75, 86, 0, 0);
    const slopeLeftTileset = this.tilemap.addTilesetImage(TILESET_KEYS.SLOPE_LEFT, IMAGE_KEYS.SLOPE_LEFT, 75, 86, 0, 0);
    const slopeRightTileset = this.tilemap.addTilesetImage(TILESET_KEYS.SLOPE_RIGHT, IMAGE_KEYS.SLOPE_RIGHT, 75, 86, 0, 0);

    this.layers = {
      slope: this.tilemap.createLayer('SlopeLayer', [slopeLeftTileset, slopeRightTileset], 0, 0),
      snow: this.tilemap.createLayer('SnowLayer', snowTileset, 0, 0),
      passPlatform: this.tilemap.createLayer('PassPlatformLayer', snowTileset, 0, 0)
    }

    this.layers.snow.setCollisionBetween(0, this.layers.snow.tilesTotal, true);
    this.layers.slope.setCollisionBetween(0, this.layers.slope.tilesTotal, true);

    this.scene.matter.world.convertTilemapLayer(this.layers.slope);
    this.scene.matter.world.convertTilemapLayer(this.layers.snow);

    this.platforms = new Platforms(this.scene, this.layers.passPlatform);
  }
}