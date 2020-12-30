import Phaser from 'phaser';

export default class Platforms {
  scene;
  layer;
  matterTiles;

  constructor(scene, layer) {
    this.scene = scene;
    this.layer = layer;

    this.layer.setCollisionBetween(0, this.layer.tilesTotal, true);
    const tiles = this.layer.getTilesWithin(0, 0, this.layer.width, this.layer.height , { isColliding: true });

    const { TileBody: MatterTileBody } = Phaser.Physics.Matter;

    this.matterTiles = tiles.map(tile => new MatterTileBody(this.scene.matter.world, tile).setSensor(true));
  }

  /**
   * 
   * @param {*} player 
   * TODO: Need to refactor this, maybe set up a sensor below and above the tile. Below sensor for disabling collision, above tile for enabling collision. Tried, but rendering got so slow.
   */
  setupPlayerCollision(player) {
    for (let i = 0; i < this.matterTiles.length; i++) {
      const matterTile = this.matterTiles[i];
  
      this.scene.matterCollision.addOnCollideStart({
        objectA: [matterTile.body],
        objectB: [ player.sensors.bigBottom ],
        callback: () => matterTile.setSensor(false)
      });
      this.scene.matterCollision.addOnCollideActive({
        objectA: [matterTile.body],
        objectB: [ player.sensors.bigBottom ],
        callback: () => matterTile.setSensor(false)
      });
      this.scene.matterCollision.addOnCollideEnd({
        objectA: [matterTile.body],
        objectB: [ player.sensors.bigBottom ],
        callback: () => matterTile.setSensor(true)
      });
    }
  }
}