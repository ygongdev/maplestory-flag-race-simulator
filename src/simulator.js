'use strict';

import SnowTileset from './assets/tileset/flag_texture_75_86.png';
import SlopeLeftTileset from './assets/tileset/slope_texture_75_86.png';
import SlopeRightTileset from './assets/tileset/slope_texture_75_86_right.png';
import PlayerWalkingSpriteSheet from './assets/spritesheet/walking.png';
import PlayerClimbingSpriteSheet from './assets/spritesheet/climbing.png';
import PlayerJumpingSpriteSheet from './assets/spritesheet/jumping.png';
import PlayerStandingSpriteSheet from './assets/spritesheet/standing.png';
import FlagRaceTilemap from './assets/tilemap/test_tilemap.json';

import Player from './player';

export default class MaplestoryFlagRaceSimulator extends Phaser.Scene {
  player;
  platforms;
  cursors;
  slopeLayer;
  snowLayer;
  map;
  isJumping = false;
  isClimbing = false;
  isOnSlope = false;

  constructor() {
    super();
  }

  preload () {
    this.load.image('snowTiles', SnowTileset);
    this.load.image('slopeLeftTiles', SlopeLeftTileset);
    this.load.image('slopeRightTiles', SlopeRightTileset);
    this.load.spritesheet('player_standing', PlayerStandingSpriteSheet, { frameWidth: 75.5, frameHeight: 86, });
    this.load.spritesheet('player_walking', PlayerWalkingSpriteSheet, { frameWidth: 75.5, frameHeight: 86 });
    this.load.spritesheet('player_jumping', PlayerJumpingSpriteSheet, { frameWidth: 76, frameHeight: 82 });
    this.load.spritesheet('player_climbing', PlayerClimbingSpriteSheet, { frameWidth: 62, frameHeight: 86 });
    this.load.tilemapTiledJSON('map', FlagRaceTilemap);
  }

  create () {
    this.map = this.add.tilemap('map');
    const snowTileset = this.map.addTilesetImage('snow', 'snowTiles', 75, 86, 0, 0);
    const slopeLeftTileset = this.map.addTilesetImage('slope_left', 'slopeLeftTiles', 75, 86, 0, 0);
    const slopeRightTileset = this.map.addTilesetImage('slope_right', 'slopeRightTiles', 75, 86, 0, 0);

    this.slopeLayer = this.map.createLayer('SlopeLayer', [slopeLeftTileset, slopeRightTileset], 0, 0);
    this.snowLayer = this.map.createLayer('SnowLayer', snowTileset, 0, 0);

    this.snowLayer.setCollisionBetween(0, 1000);
    this.slopeLayer.setCollisionBetween(0, 1000);

    this.matter.world.convertTilemapLayer(this.slopeLayer);
    this.matter.world.convertTilemapLayer(this.snowLayer);

    this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    this.player = new Player(this, 2000, this.map.heightInPixels - 300);
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







