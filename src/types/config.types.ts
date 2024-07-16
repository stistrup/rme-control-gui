import { RmeInput, RmeOutput } from "./rmeService.types";

export interface StereoOutput {
  displayName: string;
  output: RmeOutput;
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
  playback: Omit<StereoOutput, "output">[];
}

export interface PipewireConfig {
  defaultProfile: string;
  proAudioProfile: string;
}
