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
  displayNameStereo?: string;
  controlName: string;
  inputIndex: number;
  switchNames: AlsaInputSwitchNames
  type: InputType;
  stereoCoupled: boolean
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
  controlNameMonitorLeft: string;
  controlNameMonitorRight: string;
  controlNameHPLeft: string;
  controlNameHPRight: string;
}

export interface AlsaInputSwitchNames {
  phantom?: string;
  lineSens?: string;
  gain?: string;
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
  inputRange: InputRange;
}

export interface InputRange {
  min: number,
  max: number
}

export interface AudioProfile {
  profileName: string;
  displayName: string;
}

export interface TauriInputChannelConfig {
  control_name: string, 
  display_name: string, 
  stereo_coupled: boolean
}