export enum RmeInput {
  MIC1,
  MIC2,
  LINE1,
  LINE2,
}

export enum RmeOutput {
  MONITORS,
  HEADPHONES,
}

export enum RmeControl {
  PHANTOM,
  LINE_SENSITIVITY,
}

export interface InitialStates {
  headphones_volume: number;
  monitors_volume: number;
}
