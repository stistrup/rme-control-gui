export enum RmeInput {
  MIC1,
  MIC2,
  LINE1,
  LINE2,
  CAPTURE_L,
  CAPTRUE_R,
}

export enum RmeOutput {
  MONITORS,
  HEADPHONES,
}

export enum RmeReturn {
  PLAYBACK,
}

export enum InputType {
  MIC,
  LINE,
  GENERAL,
}

export enum RmeControl {
  PHANTOM,
  LINE_SENSITIVITY,
}

export interface InitialStates {
  headphones_volume: number;
  monitors_volume: number;
}
