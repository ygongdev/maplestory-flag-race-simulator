export default class Pit {
  scene;
  sensor;
  object;
  properties = {};

  constructor(scene, object) {
    this.scene = scene;
    this.object = object;

    this.sensor = this.scene.matter.add.rectangle(this.object.x, this.object.y, 2, 2, { isStatic: true });
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
      objectA: [ this.sensor ],
      objectB: playerSensors,
      callback: () => {
        player.sprite.setVelocity(player.sprite.body.velocity.x + this.properties.jumpX, player.sprite.body.velocity.y + this.properties.jumpY);
      }
    });
  }
}