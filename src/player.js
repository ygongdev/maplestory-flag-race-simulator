import Phaser from 'phaser';
import MultiKey from './multi-key';

export default class Player {
  scene;

  sprite;
  sensors;

  leftInput;
  rightInput;
  upInput;
  downInput;
  jumpinput;

  canJump = true;
  isClimbing = false;
  isTouching = {
    left: false,
    right: false,
    ground: false,
  };

  constructor(scene, positionX, positionY) {
    this.scene = scene;

    this._setupPlayerSprite(positionX, positionY);
    this._setupInputs();
    this._setupAnimations();

    this.scene.matter.world.on("beforeupdate", this._resetTouching, this);
    this.scene.events.on("update", this.update, this);

    this.scene.matterCollision.addOnCollideStart({
      objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
      callback: this._onSensorCollide,
      context: this
    });
    this.scene.matterCollision.addOnCollideActive({
      objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
      callback: this._onSensorCollide,
      context: this
    });
  }

  update() {
    const moveSpeed = this.isTouching.ground ? 0.05 : 0.01;

    if (this.isTouching.ground) {
      this.sprite.setIgnoreGravity(true);
    } else {
      this.sprite.setIgnoreGravity(false);
    }

    if (this.jumpInput.isDown && this.canJump && this.isTouching.ground) {
      this.scene.time.addEvent({
        delay: 250,
        callback: () => (this.canJump = true)
      });
      this.sprite.setVelocityY(-12);
      this.canJump = false;
      this.sprite.anims.play('jumping', true);
    } 

    if (this.leftInput.isDown && !this.isTouching.left) {
      this.sprite.setFlipX(false);
      if (!this.isTouchingLeft) {
        this.sprite.applyForce({ x: -moveSpeed, y: 0});
      }
      if (this.isTouching.ground && this.canJump) {
        this.sprite.anims.play('walking', true);
      }
      // console.log(this.sprite.body.velocity.x);
    } else if (this.rightInput.isDown && !this.isTouching.right) {
      this.sprite.setFlipX(true);

      if (!this.isTouching.right) {
        this.sprite.applyForce({ x: moveSpeed, y: 0});
      }

      if (this.isTouching.ground && this.canJump) {
        this.sprite.anims.play('walking', true);
      }
        // console.log(this.sprite.body.velocity.x);
    } else if (this.isTouching.ground && this.canJump) {
      this.sprite.anims.play('standing', true);
    }

    if (this.sprite.body.velocity.x > 5) {
      this.sprite.setVelocityX(5);
    } else if (this.sprite.body.velocity.x < -5) {
      this.sprite.setVelocityX(-5);
    }
  }

  _setupPlayerSprite(positionX, positionY) {
    this.sprite = this.scene.matter.add.sprite(0, 0, 'player_standing', 0);

    const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules

    const { width: w, height: h } = this.sprite;
    const mainBody = Bodies.rectangle(w / 2, h / 2, w*0.6, h*0.95, { chamfer: { radius: 10 } });
    // BigBottom is purely for detecting platforms that are meant to pass through earlier
    this.sensors = {
      bottom: Bodies.rectangle(w / 2, h, w*.5, 2, { isSensor: true }),
      bigBottom: Bodies.rectangle(w / 2, h, w*.5, 10, { isSensor: true }),
      left: Bodies.rectangle(w* 0.18, h / 2, 2, h * 0.5, { isSensor: true }),
      right: Bodies.rectangle(w * 0.82, h /2, 2, h * 0.5, { isSensor: true })
    };

    const compoundBody = Body.create({
      parts: [mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right, this.sensors.bigBottom],
      frictionStatic: 0,
      frictionAir: 0.01,
      friction: 0.005,
      restitution: 0,
      mass: 20,
    });

    this.sprite
      .setExistingBody(compoundBody)
      .setScale(1.5)
      .setFixedRotation() // Sets inertia to infinity so the player can't rotate
      .setPosition(positionX, positionY)
  }

  _setupInputs() {
    const { LEFT, RIGHT, UP, DOWN, SPACE, ALT } = Phaser.Input.Keyboard.KeyCodes;
    this.leftInput = new MultiKey(this.scene, [LEFT]);
    this.rightInput = new MultiKey(this.scene, [RIGHT]);
    this.jumpInput = new MultiKey(this.scene, [SPACE, ALT]);
    this.upInput = new MultiKey(this.scene, [UP]);
    this.downInput = new MultiKey(this.scene, [DOWN]);
  }

  _setupAnimations() {
    this.scene.anims.create({
      key: 'walking',
      frames: this.scene.anims.generateFrameNumbers('player_walking', { start: 0, end : 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'standing',
      frames: this.scene.anims.generateFrameNumbers('player_standing', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'jumping',
      frames: this.scene.anims.generateFrameNumbers('player_jumping', { frames: [0] }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: 'climbing',
      frames: this.scene.anims.generateFrameNumbers('player_climbing', { start: 0, end: 1 }),
      frameRate: 5,
    });
  }

  _resetTouching() {
    this.isTouching = {
      left: false,
      right: false,
      ground: false
    }
  }

  /**
   * 
   * @param {*} param0 
   * 
   * If bodyB is portal, allow portal
   * If bodyB is rope, allow climbing
   * If bodyB is slope or ground, is touching ground.
   */
  _onSensorCollide({bodyA, bodyB, pair}) {
    if (bodyB.isSensor) {
      return;
    } // We only care about collisions with physical objects
    if (bodyA === this.sensors.left) {
      this.isTouching.left = true;
    } else if (bodyA === this.sensors.right) {
      this.isTouching.right = true;
    } else if (bodyA === this.sensors.bottom) {
      this.isTouching.ground = true;
    }
  }
}