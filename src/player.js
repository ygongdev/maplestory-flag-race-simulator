import Phaser from 'phaser';
import MultiKey from './utils/multi-key';
import {
  MAX_WALK_VELOCITY_X,
  JUMP_VELOCITY_Y
} from './utils/constants';

/**
 * Mechanics Explanation
 * 
 * Walking animation
 * 1. When the player is on the ground
 * 2. Can not walk in midair
 * 3. When not using snowshoe, should experience acceleration up to a certain velocity
 * 4. When using snowshoe, should not exprience acceleration, only a higher constant velocity
 * 5. Walking on edge of slope in same direction should gain a velocity boost.
 * 
 * Climbing animation
 * 1. Can only climb up or down when encountering a rope
 * 2. Ignores gravity 
 * 3. Can not walk left or right during climbing
 * 4. Can jump left or right off the rope.
 * 
 * Standing animation
 * 1. When not performing other animations
 * 
 * Jumping animation
 * 1. Can not change velocity while in middle of jump, direction the player faces can be changed
 * 2. Can only jump once every time player touches the ground or climbing onto another rope
 * 3. Should gain a velocity boost from jumping off edge of slope in the same direction
 * 4. If jumping on the opposite direction of slope, velocity gets reduced significantly.
 * 5. Can receive significant velocity boost from using jump portals.
 * 
 * Walls
 * 1. Velocity is reduced to 0 when unsuccessfully jump over a wall
 */
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
  // Bypass velocity limits if we're using boosters.
  isBoostingX = false;
  isBoostingY = false;
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
    // move slower in air please.
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
      this.sprite.setVelocityY(JUMP_VELOCITY_Y);
      this.canJump = false;
      this.sprite.anims.play('jumping', true);
    } 

    if (this.leftInput.isDown && !this.isTouching.left) {
      this.sprite.setFlipX(false);
      if (!this.isTouchingLeft) {
        this.sprite.applyForce({ x: -moveSpeed, y: 0});
      }
      if (this.isTouching.ground && this.canJump) {
        this.isBoostingX = false;
        this.sprite.anims.play('walking', true);
      }
      // console.log(this.sprite.body.velocity.x);
    } else if (this.rightInput.isDown && !this.isTouching.right) {
      this.sprite.setFlipX(true);

      if (!this.isTouching.right) {
        this.sprite.applyForce({ x: moveSpeed, y: 0});
      }

      if (this.isTouching.ground && this.canJump) {
        this.isBoostingX = false;
        this.sprite.anims.play('walking', true);
      }
        // console.log(this.sprite.body.velocity.x);
    } else if (this.isTouching.ground && this.canJump) {
      this.sprite.anims.play('standing', true);
    }

    if (!this.isBoostingX) {
      if (this.sprite.body.velocity.x > MAX_WALK_VELOCITY_X) {
        this.sprite.setVelocityX(MAX_WALK_VELOCITY_X);
      } else if (this.sprite.body.velocity.x < -MAX_WALK_VELOCITY_X) {
        this.sprite.setVelocityX(-MAX_WALK_VELOCITY_X);
      }
    }

    // if (!this.isBoostingY) {
    //   if (this.sprite.body.velocity.y < JUMP_VELOCITY_Y) {
    //     this.sprite.setVelocityY(JUMP_VELOCITY_Y);
    //   }
    // }
  }

  _setupPlayerSprite(positionX, positionY) {
    this.sprite = this.scene.matter.add.sprite(0, 0, 'player_standing', 0);

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;

    const { width: w, height: h } = this.sprite;
    const mainBody = Bodies.rectangle(w / 2, h / 2, w*0.6, h*0.95, { chamfer: { radius: 10 } });
    // BigBottom is purely for detecting platforms that are meant to pass through earlier.
    // TODO: Would like a better solution
    this.sensors = {
      bottom: Bodies.rectangle(w / 2, h, w*.5, 2, { isSensor: true }),
      bigBottom: Bodies.rectangle(w / 2, h + 2, w*.5, 50, { isSensor: true }),
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
      .setFixedRotation()
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
    } 
    
    // We only care about collisions with physical objects
    if (bodyA === this.sensors.left) {
      this.isTouching.left = true;
    } else if (bodyA === this.sensors.right) {
      this.isTouching.right = true;
    } else if (bodyA === this.sensors.bottom) {
      this.isTouching.ground = true;
    }
  }
}