'use strict';

import SnowTileset from './assets/tileset/flag_texture_75_86.png';
import SlopeLeftTileset from './assets/tileset/slope_texture_75_86.png';
import SlopeRightTileset from './assets/tileset/slope_texture_75_86_right.png';
import PortalImage from './assets/images/portal.png';
import PlayerWalkingSpriteSheet from './assets/spritesheet/walking.png';
import PlayerClimbingSpriteSheet from './assets/spritesheet/climbing.png';
import PlayerJumpingSpriteSheet from './assets/spritesheet/jumping.png';
import PlayerStandingSpriteSheet from './assets/spritesheet/standing.png';
import FlagRaceTilemap from './assets/tilemap/map.json';
import FlagRaceMusic from './assets/audio/captureTheFlag.mp3';

import Player from './player';
import Music from './music';
import Map from './map';

import {
  TILEMAP_KEYS,
  IMAGE_KEYS,
  SPRITESHEET_KEYS,
  SOUND_KEYS
} from './utils/constants';

export default class MaplestoryFlagRaceSimulator extends Phaser.Scene {
  player;
  platforms;
  cursors;
  slopeLayer;
  snowLayer;
  map;
  music;

  constructor() {
    super();
  }

  preload () {
    this.load.image(IMAGE_KEYS.SNOW, SnowTileset);
    this.load.image(IMAGE_KEYS.SLOPE_LEFT, SlopeLeftTileset);
    this.load.image(IMAGE_KEYS.SLOPE_RIGHT, SlopeRightTileset);
    this.load.image(IMAGE_KEYS.PORTAL, PortalImage);
    this.load.spritesheet(SPRITESHEET_KEYS.PLAYER.STANDING, PlayerStandingSpriteSheet, { frameWidth: 75.5, frameHeight: 86, });
    this.load.spritesheet(SPRITESHEET_KEYS.PLAYER.WALKING, PlayerWalkingSpriteSheet, { frameWidth: 75.5, frameHeight: 86 });
    this.load.spritesheet(SPRITESHEET_KEYS.PLAYER.JUMPING, PlayerJumpingSpriteSheet, { frameWidth: 76, frameHeight: 82 });
    this.load.spritesheet(SPRITESHEET_KEYS.PLAYER.CLIMBING, PlayerClimbingSpriteSheet, { frameWidth: 62, frameHeight: 86 });
    this.load.tilemapTiledJSON(TILEMAP_KEYS.FLAG_RACE, FlagRaceTilemap);
    this.load.audio(SOUND_KEYS.FLAG_RACE, FlagRaceMusic);
  }

  create () {
    this.music = new Music(this);
    this.music.audio.play()

    this.map = new Map(this);

    const spawnPoint = this.map.tilemap.findObject("Player", obj => obj.name === "Spawn point");
    const portal1 = this.map.tilemap.findObject("Portal", obj => obj.name === "portal1")

    this.portal1 = this.matter.add.sprite(0, 0, 'portal', 0);
    this.portal1
      .setFixedRotation()
      .setStatic(true)
      .setSensor(true)
      .setPosition(portal1.x, portal1.y - this.portal1.height / 2);
  
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);

    this.matterCollision.addOnCollideActive({
      objectA: [ this.portal1],
      objectB: [ this.player.sensors.right ],
      callback: () => {
        if (this.player.upInput.isDown) {
          this.player.sprite.setVelocity(0);
          this.player.sprite.setPosition(this.player.sprite.x + 400, this.player.sprite.y);
        }
      }
    });

    this.map.layers.passPlatform.setCollisionBetween(0, this.map.layers.passPlatform.tilesTotal, true);
    const tiles = this.map.layers.passPlatform.getTilesWithin(0, 0, this.map.layers.passPlatform.width, this.map.layers.passPlatform.height , { isColliding: true });

    const { TileBody: MatterTileBody } = Phaser.Physics.Matter;

    const matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));

    for (let i = 0; i < matterTiles.length; i++) {
      const tile = matterTiles[i];
      tile.setSensor(true);

      this.matterCollision.addOnCollideStart({
        objectA: [tile.body],
        objectB: [ this.player.sensors.bigBottom ],
        callback: () => tile.setSensor(false)
      });
      this.matterCollision.addOnCollideActive({
        objectA: [tile.body],
        objectB: [ this.player.sensors.bigBottom ],
        callback: () => tile.setSensor(false)
      });
      this.matterCollision.addOnCollideEnd({
        objectA: [tile.body],
        objectB: [ this.player.sensors.bottom ],
        callback: () => tile.setSensor(true)
      });
    }

    this.matter.world.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);

    this.cameras.main.startFollow(this.player.sprite);
  }

  /**
   * Mechanics Explanation
   * 
   * Walking animation
   * 1. When the player is on the ground
   * 2. Can not walk in midair
   * 3. When not using snowshoe, should experience acceleration up to a certain velocity
   * 4. When using snowshoe, should not exprience acceleration, only a higher constant velocity
   * 5. Walking on edge of slope in same direction should gain a velocity boost.
   * 
   * Climbing animation
   * 1. Can only climb up or down when encountering a rope
   * 2. Ignores gravity 
   * 3. Can not walk left or right during climbing
   * 4. Can jump left or right off the rope.
   * 
   * Standing animation
   * 1. When not performing other animations
   * 
   * Jumping animation
   * 1. Can not change velocity while in middle of jump, direction the player faces can be changed
   * 2. Can only jump once every time player touches the ground or climbing onto another rope
   * 3. Should gain a velocity boost from jumping off edge of slope in the same direction
   * 4. If jumping on the opposite direction of slope, velocity gets reduced significantly.
   * 5. Can receive significant velocity boost from using jump portals.
   * 
   * Walls
   * 1. Velocity is reduced to 0 when unsuccessfully jump over a wall
   */
}







