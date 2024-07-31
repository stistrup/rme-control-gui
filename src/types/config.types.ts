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
  type: OutputType;
}

export interface AlsaInputSwitchNames {
  phantom?: string;
  lineSens?: string;
  pad?: string;
}

export interface AlsaInputSwitchValues {
  lineSensHigh: string;
  lineSensLow: string;
}

export interface SoundcardConfig {
  inputs: AlsaInput[];
  outputs: AlsaOutput[];
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