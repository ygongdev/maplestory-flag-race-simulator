import {
  TILEMAP_KEYS,
  IMAGE_KEYS,
  SPRITESHEET_KEYS,
  SOUND_KEYS
} from './utils/constants';

export default class Rope {
  scene;
  sprite;
  object;
  properties = {};

  constructor(scene, object) {
    this.scene = scene;
    this.object = object;
    this.sprite = this.scene.matter.add.sprite(0, 0, IMAGE_KEYS.ROPE, 0);
    this.sprite
    .setFixedRotation()
    .setStatic(true)
    .setSensor(true)
    .setDisplaySize(20, 800)
    // .setDisplayOrigin(this.object.x, this.object.y + this.sprite.height / 2)
    this.sprite
    .setPosition(this.object.x, this.object.y + this.sprite.displayHeight / 2 );
  
    this.setupProperties();
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
    const playerSensors = Object.keys(player.sensors).map(key => player.sensors[key]);

    this.scene.matterCollision.addOnCollideActive({
      objectA: [ this.sprite ],
      objectB: playerSensors,
      callback: ({bodyA, bodyB, gameObjectA, gameObjectB, pair}) => {
        if (player.upInput.isDown || player.downInput.isDown) {
          // Is in middle of rope
          // debugger;
          if (Math.abs((bodyA.position.x + gameObjectA.displayWidth / 2) - bodyB.position.x) <= 1) {

            player.isClimbing = true;
          }
        }
      }
    });

    this.scene.matterCollision.addOnCollideEnd({
      objectA: [ this.sprite ],
      objectB: playerSensors,
      callback: () => {
        player.isClimbing = false;
      }
    });
  }
}