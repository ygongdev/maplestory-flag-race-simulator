import Phaser from 'phaser';
import {
  PASS_THROUGH_PLATFORMS_COLLISION_GROUP,
} from './utils/constants';

export default class Platforms {
  scene;
  layer;
  matterTiles;
  maskGroup;

  constructor(scene, layer) {
    this.scene = scene;
    this.layer = layer;

    this.layer.setCollisionBetween(0, this.layer.tilesTotal, true);
    const tiles = this.layer.getTilesWithin(0, 0, this.layer.width, this.layer.height , { isColliding: true });

    const { TileBody: MatterTileBody } = Phaser.Physics.Matter;

    this.matterTiles = tiles.map(tile => new MatterTileBody(this.scene.matter.world, tile).setCollisionGroup(PASS_THROUGH_PLATFORMS_COLLISION_GROUP));
  }

  setupCollideWith(group) {
    this.maskGroup = group;
    for (let i = 0; i < this.matterTiles.length; i++) {
      const matterTile = this.matterTiles[i];
      matterTile.setCollidesWith(group);
    }
  }
}