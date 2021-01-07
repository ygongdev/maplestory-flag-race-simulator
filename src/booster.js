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
  direction;
  properties = {};
  canDetect = true;

  constructor(scene, object) {
    this.scene = scene;
    this.object = object;

    this.setupProperties();
    this.direction = this.properties.direction;

    let spriteImage;

    switch(this.properties.direction) {
      case "LEFT":
        spriteImage = IMAGE_KEYS.BOOSTER.LEFT;
        break;
      case "RIGHT":
        spriteImage = IMAGE_KEYS.BOOSTER.RIGHT;
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

    this.sensors = {
      vertical: Bodies.rectangle(this.sprite.width / 2, this.sprite.height / 2, 2, this.sprite.height / 2, { isSensor: true }),
      horizontal: Bodies.rectangle(this.sprite.width / 2, this.sprite.height, this.sprite.width / 2, 2, { isSensor: true }),
    }

    // this.mainSensor = Bodies.rectangle(
    //   this.sprite.width / 2,
    //   this.sprite.height / 2,
    //   this.sprite.width / 2,
    //   this.sprite.height / 2,
    //   { isSensor: true }
    // );

    this.sprite 
    .setExistingBody(Body.create({
      parts: [ this.sensors.horizontal, this.sensors.vertical ]
    }))
    .setFixedRotation()
    .setScale(3)
    .setStatic(true)
    .setPosition(this.object.x - this.sprite.displayWidth / 4, this.object.y - this.sprite.displayHeight / 4)

    
    // this.sensor = Bodies.rectangle(
    //   this.sprite.width / 2,
    //   this.sprite.height / 2,
    //   useWidthSensor ? this.sprite.width : 2,
    //   useWidthSensor ? 2 : this.sprite.height,
    //   { isSensor: true }
    // );
    
    // this.sprite
    // .setExistingBody(Body.create({
    //   parts: [this.sensor]
    // }))
    // .setPosition(this.object.x - this.sprite.width * 0.75, this.object.y - this.sprite.height * 1.5);
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

    let boosterSensor;
    let playerSensor;

    switch (this.direction) {
      case "LEFT":
        playerSensor = player.sensors.right;
        boosterSensor = this.sensors.vertical;
        break;
      case "RIGHT":
        playerSensor = player.sensors.left;
        boosterSensor = this.sensors.vertical;
        break;
      case "UP":
      default:
        playerSensor = player.sensors.bottom;
        boosterSensor = this.sensors.horizontal;
        break;
    }
    this.scene.matterCollision.addOnCollideActive({
      objectA: [ boosterSensor ],
      objectB: [ playerSensor ],
      callback: () => {
        player.isBoostingX = true;
        player.sprite.setVelocity(player.sprite.body.velocity.x + this.properties.jumpX, player.sprite.body.velocity.y + this.properties.jumpY);
      }
    });

    this.scene.matterCollision.addOnCollideStart({
      objectA: [ boosterSensor ],
      objectB: [ playerSensor ],
      callback: () => {
        player.isBoostingX = true;
        player.sprite.setVelocity(player.sprite.body.velocity.x + this.properties.jumpX, player.sprite.body.velocity.y + this.properties.jumpY);
      }
    });
  }
}