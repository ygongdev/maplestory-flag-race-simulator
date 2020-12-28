export const DAMPING_X = 0.40;
export const MAX_VELOCITY_X = 150;
export const MAX_ACCELERATION_X = 100;
export const GRAVITY_Y = 2;
export const JUMP_VELOCITY_Y = -1 * (GRAVITY_Y + 50);

export const SOUND_KEYS = {
  FLAG_RACE: "flagMusic"
}

export const TILEMAP_KEYS = {
  FLAG_RACE: "flagMap"
}

export const TILESET_KEYS = {
  SNOW: "snow",
  SLOPE_LEFT: "slope_left",
  SLOPE_RIGHT: "slope_right",
}

export const IMAGE_KEYS = {
  SNOW: "snowTiles",
  SLOPE_LEFT: "slopeLeftTiles",
  SLOPE_RIGHT: "slopeRightTiles",
  PORTAL: "portal",
}

export const SPRITESHEET_KEYS = {
  PLAYER: {
    WALKING: "player_walking",
    STANDING: "player_standing",
    JUMPING: "player_jumping",
    CLIMBING: "player_climbing",
  }
}