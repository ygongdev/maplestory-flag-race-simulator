import Phaser from 'phaser';
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import Simulator from './simulator';
import { GRAVITY_Y } from './utils/constants';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: GRAVITY_Y },
      debug: process.env.DEBUG
    }
  },
  plugins: {
    scene: [ 
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
      }
    ]
  },
  scene: [ Simulator ]
};

const game = new Phaser.Game(config);
