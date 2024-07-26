import { InputType, RmeInput, RmeReturn } from "./rmeService.types";

export interface MixerChannelBase {
  name: string;
  pipewirePortName: string;
  monitorSendVolume?: number;
  headphonesSendVolume?: number;
}

export interface MixerChannelDefault extends MixerChannelBase {
  id: RmeInput.CAPTRUE_R | RmeInput.CAPTURE_L;
  inputType: InputType.GENERAL;
}

export interface MixerChannelMic extends MixerChannelBase {
  id: RmeInput.MIC1 | RmeInput.MIC2;
  inputType: InputType.MIC;
  gain?: number;
  phantomActive?: boolean;
}

export interface MixerChannelLine extends MixerChannelBase {
  id: RmeInput.LINE1 | RmeInput.LINE2;
  inputType: InputType.LINE;
  gain?: number;
  sens?: MixerLineSens;
}

export interface MixerChannelPlayback extends MixerChannelBase {
  id: RmeReturn.PLAYBACK;
  inputType: InputType.GENERAL;
}

export enum MixerLineSens {
  MINUS_10,
  PLUS_4,
}

export type MixerChannel =
  | MixerChannelDefault
  | MixerChannelMic
  | MixerChannelLine
  | MixerChannelPlayback;
