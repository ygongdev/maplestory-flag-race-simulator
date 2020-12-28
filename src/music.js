import {
  SOUND_KEYS
} from './utils/constants';

export default class Music {
  scene;
  audio;

  constructor(scene) {
    this.scene = scene;

    this.audio = this.scene.sound.add(SOUND_KEYS.FLAG_RACE);
    this.scene.sound.pauseOnBlur = false;
    this.audio.setLoop(true);
  }
}