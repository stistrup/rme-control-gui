export enum OutputType {
  SPEAKERS,
  HEADPHONES
}

export enum InputType {
  MIC,
  LINE
}

export interface Input {
  displayName: string;
  controlName: string;
  switcheNames: InputSwitchNames
  type: InputType;
}

export interface Output {
  displayName: string;
  controlNameLeft: string;
  controlNameRight: string;
  type: OutputType;
}

export interface InputSwitchNames {
  phantom?: string;
  lineSens?: string;
  pad?: string;
}

export interface InputSwitchValues {
  lineSensHigh: string;
  lineSensLow: string;
}

export interface SoundcardConfig {
  inputs: Input[];
  outputs: Output[];
  inputControlValues: InputSwitchValues;
}

export interface AudioProfile {
  profileName: string;
  displayName: string;
}

export interface AudioProfiles {
  proAudio: AudioProfile;
  default: AudioProfile;
}