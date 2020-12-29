'use strict';

import SnowTileset from './assets/tileset/flag_texture_75_86.png';
import SlopeLeftTileset from './assets/tileset/slope_texture_75_86.png';
import SlopeRightTileset from './assets/tileset/slope_texture_75_86_right.png';
import PortalImage from './assets/images/portal.png';
import BoosterLeftImage from './assets/images/booster_left.png';
import BoosterUpLeftImage from './assets/images/booster_up_left.png';
import BoosterRightImage from './assets/images/booster_right.png';
import BoosterUpImage from './assets/images/booster_up.png';
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
import Pit from './pit';
import Booster from './booster';

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
    this.load.image(IMAGE_KEYS.BOOSTER.LEFT, BoosterLeftImage);
    this.load.image(IMAGE_KEYS.BOOSTER.RIGHT, BoosterRightImage);
    this.load.image(IMAGE_KEYS.BOOSTER.UP_LEFT, BoosterUpLeftImage);
    this.load.image(IMAGE_KEYS.BOOSTER.UP, BoosterUpImage);
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
    
    this.player = new Player(this, spawnPoint.x, spawnPoint.y);
    // this.player = new Player(this, 6000, 3300);

    this.player.sprite.depth = 500;

    this.map.platforms.setupPlayerCollision(this.player);

    this._createPortals();
    this._createPits();
    this._createBoosters();

    // Mini map
    const zoom = 400 / this.map.tilemap.widthInPixels;

    this.minimap = this.cameras.add(10, 10, 400, zoom*this.map.tilemap.heightInPixels).setZoom(zoom).setName('mini');
    this.minimap.setBackgroundColor(0x002244);
    this.minimap.scrollX = this.map.tilemap.widthInPixels * 0.47;
    this.minimap.scrollY = this.map.tilemap.heightInPixels / 2;

    this.matter.world.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels).setName('main');

    this.cameras.main.startFollow(this.player.sprite);
  }

  _createPortals() {
    const portals = this.map.tilemap.getObjectLayer("Portal").objects.map(portal => new Portal(this, portal));

    portals.forEach(portal => {
      portal.addPlayerCollision(this.player);
    });
  }

  _createPits() {
    const pits = this.map.tilemap.getObjectLayer("Pit").objects.map(pit => new Pit(this, pit));

    pits.forEach(pit => {
      pit.addPlayerCollision(this.player);
    });
  }

  _createBoosters() {
    const boosters = this.map.tilemap.getObjectLayer("Booster").objects.map(booster => new Booster(this, booster));

    boosters.forEach(booster => {
      booster.addPlayerCollision(this.player);
    })
  }
}









