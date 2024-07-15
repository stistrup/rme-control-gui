import { RmeInput } from "./rmePlugin.types";

export interface StereoOutput {
  displayName: string;
  alsaNameLeft: string;
  alsaNameRight: string;
}

export interface Input {
  alsaName: string;
  input: RmeInput;
  displayName: string;
  controls: {
    phantom?: string;
    sensitivity?: string;
  };
}

export interface AlsaConfig {
  outputs: StereoOutput[];
  inputs: Input[];
  playback: StereoOutput[];
}

export interface PipewireConfig {
  defaultProfile: string;
  proAudioProfile: string;
}
