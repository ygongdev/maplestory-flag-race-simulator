import {
  TILEMAP_KEYS,
  IMAGE_KEYS,
  SPRITESHEET_KEYS,
  SOUND_KEYS
} from './utils/constants';

export default class Booster {
  scene;
  sprite;
  object;
  properties = {};
  canDetect = true;

  constructor(scene, object) {
    this.scene = scene;
    this.object = object;

    this.setupProperties();

    let spriteImage;
    let useWidthSensor = true;
    switch(this.properties.direction) {
      case "LEFT":
        spriteImage = IMAGE_KEYS.BOOSTER.LEFT;
        useWidthSensor = false;
        break;
      case "RIGHT":
        spriteImage = IMAGE_KEYS.BOOSTER.RIGHT;
        useWidthSensor = false;
        break;
      case "UP":
        spriteImage = IMAGE_KEYS.BOOSTER.UP;
        break;
      case "UP_LEFT":
        spriteImage = IMAGE_KEYS.BOOSTER.UP_LEFT;
        break;
      default:
        break;
    }

    this.sprite = this.scene.matter.add.sprite(0, 0, spriteImage, 0);

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;

    this.sensor = Bodies.rectangle(
      this.sprite.width / 2,
      this.sprite.height / 2,
      useWidthSensor ? this.sprite.width : 2,
      useWidthSensor ? 2 : this.sprite.height,
      { isSensor: true }
    );

    this.sprite
    .setExistingBody(Body.create({
      parts: [this.sensor]
    }))
    .setFixedRotation()
    .setScale(3)
    .setStatic(true)
    .setPosition(this.object.x - this.sprite.width * 0.75, this.object.y - this.sprite.height * 1.5);
  }

  setupProperties() {
    if (!this.object.properties) {
      return;
    }
    this.object.properties.forEach(property => {
      this.properties[property.name] = property.value;
    })
  }

  addPlayerCollision(player) {
    // const playerSensors = Object.keys(player.sensors).map(key => player.sensors[key]);

    this.scene.matterCollision.addOnCollideStart({
      objectA: [ this.sensor ],
      objectB: [ player.sensors.bottom, player.sensors.left, player.sensors.bottom ],
      callback: () => {
        player.isBoostingX = true;
        player.sprite.setVelocity(player.sprite.body.velocity.x + this.properties.jumpX, player.sprite.body.velocity.y + this.properties.jumpY);
      }
    });
  }
}