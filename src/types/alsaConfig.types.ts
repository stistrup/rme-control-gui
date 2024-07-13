export interface StereoOutput {
  displayName: string;
  alsaNameLeft: string;
  alsaNameRight: string;
}

export interface Input {
  alsaName: string;
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
