export enum OutputType {
  SPEAKERS,
  HEADPHONES
}

export enum InputType {
  MIC,
  LINE
}

export interface AlsaInput {
  displayName: string;
  controlName: string;
  switchNames: AlsaInputSwitchNames
  type: InputType;
}

export interface AlsaOutput {
  displayName: string;
  controlNameLeft: string;
  controlNameRight: string;
  routeNameLeft: string;
  routeNameRight: string
  type: OutputType;
}

export interface AlsaPlayback {
  displayName: string;
  controlNameLeft: string;
  controlNameRight: string;
}

export interface AlsaInputSwitchNames {
  phantom?: string;
  lineSens?: string;
  gain: string;
  pad?: string;
}

export interface AlsaInputSwitchValues {
  lineSensHigh: string;
  lineSensLow: string;
}


export interface AlsaInputControlValues {
  gain: string;
  pad: string;
}

export interface SoundcardConfig {
  inputs: AlsaInput[];
  outputs: AlsaOutput[];
  playback: AlsaPlayback;
  inputSwitchValues: AlsaInputSwitchValues;
  inputRange: InputRange
}

export interface InputRange {
  min: number,
  max: number
}

export interface AudioProfile {
  profileName: string;
  displayName: string;
}