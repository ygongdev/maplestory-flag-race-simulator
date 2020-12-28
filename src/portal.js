import {
  TILEMAP_KEYS,
  IMAGE_KEYS,
  SPRITESHEET_KEYS,
  SOUND_KEYS
} from './utils/constants';

export default class Portal {
  scene;
  sprite;
  portalObject;

  constructor(scene, portalObject) {
    this.scene = scene;

    this.sprite = this.scene.matter.add.sprite(0, 0, IMAGE_KEYS.PORTAL, 0);
    this.sprite
    .setFixedRotation()
    .setStatic(true)
    .setSensor(true)
    .setPosition(portalObject.x, portalObject.y - this.sprite.height / 2);
  }

  onPlayerCollision(player, playerCallback) {
    const playerSensors = Object.keys(player.sensors).map(key => player.sensors[key]);

    this.scene.matterCollision.addOnCollideActive({
      objectA: [ this.sprite],
      objectB: playerSensors,
      callback: () => {
        if (player.upInput.isDown) {
          playerCallback();
          // this.player.sprite.setVelocity(0);
          // this.player.sprite.setPosition(this.player.sprite.x + 400, this.player.sprite.y);
        }
      }
    });
  }
}