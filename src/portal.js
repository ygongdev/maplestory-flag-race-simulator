import {
  TILEMAP_KEYS,
  IMAGE_KEYS,
  SPRITESHEET_KEYS,
  SOUND_KEYS
} from './utils/constants';

export default class Portal {
  scene;
  sprite;
  object;
  properties = {};

  constructor(scene, object) {
    this.scene = scene;
    this.object = object;
    this.sprite = this.scene.matter.add.sprite(0, 0, IMAGE_KEYS.PORTAL, 0);
    this.sprite
    .setFixedRotation()
    .setStatic(true)
    .setSensor(true)
    .setPosition(this.object.x - this.sprite.width / 2, this.object.y - this.sprite.height / 2);
  
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
      callback: () => {
        if (player.upInput.isDown) {
          player.sprite.setVelocity(0);
          player.sprite.setPosition(this.properties.moveToX === 0 ? player.sprite.x : this.properties.moveToX, this.properties.moveToY === 0 ? player.sprite.y : this.properties.moveToY);
        }
      }
    });
  }
}