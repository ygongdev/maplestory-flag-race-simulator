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
import Portal from './portal';

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
    this.map = new Map(this);
    this.music.audio.play()
    
    const spawnPoint = this.map.tilemap.findObject("Player", obj => obj.name === "Spawn point");
    const portal1 = this.map.tilemap.findObject("Portal", obj => obj.name === "portal1");
    
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);
    // this.player = new Player(this, 6000, 2500);

    this.player.sprite.depth = 500;

    this.map.platforms.setupPlayerCollision(this.player);

    this._createPortals();



    this.matter.world.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);

    this.cameras.main.startFollow(this.player.sprite);
  }

  _createPortals() {
    const portals = this.map.tilemap.getObjectLayer("Portal").objects.map(portal => new Portal(this, portal));

    for (let i = 0; i < portals.length; i++) {
      const portal = portals[i];
      portal.onPlayerCollision(this.player, () => {
        this.player.sprite.setVelocity(0);
        this.player.sprite.setPosition(portal.sprite.x + portal.properties.moveX, portal.sprite.y + portal.properties.moveY);
      });
    }
  }
}









