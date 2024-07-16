import { RmeInput, RmeOutput, RmeReturn } from "./rmeService.types";

export interface StereoOutput {
  displayName: string;
  id: RmeOutput;
  alsaNameLeft: string;
  alsaNameRight: string;
}

export interface StereoReturn {
  displayName: string;
  id: RmeReturn;
  alsaNameLeft: string;
  alsaNameRight: string;
}

export interface MonoInput {
  alsaName: string;
  id: RmeInput;
  displayName: string;
  controls: {
    phantom?: string;
    sensitivity?: string;
  };
}

export interface AlsaConfig {
  outputs: StereoOutput[];
  inputs: MonoInput[];
  playback: StereoReturn[];
}

export interface PipewireConfig {
  defaultProfile: string;
  proAudioProfile: string;
}
