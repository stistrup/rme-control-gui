import { InputType, RmeInput, RmeReturn } from "../types/rmeService.types";
import { MixerChannel } from "../types/rmeStore.types";

export const mixerChannelsPro: MixerChannel[] = [
  {
    name: "Mic 1",
    pipewirePortName: "capture_AUX0",
    id: RmeInput.MIC1,
    inputType: InputType.MIC,
  },
  {
    name: "Mic 2",
    pipewirePortName: "capture_AUX1",
    id: RmeInput.MIC2,
    inputType: InputType.MIC,
  },
  {
    name: "Line 1",
    pipewirePortName: "capture_AUX2",
    id: RmeInput.LINE1,
    inputType: InputType.LINE,
  },
  {
    name: "Line 2",
    pipewirePortName: "capture_AUX3",
    id: RmeInput.LINE2,
    inputType: InputType.LINE,
  },
];

export const mixerChannelsDefault: MixerChannel[] = [
  {
    name: "Input Left",
    pipewirePortName: "capture_FL",
    id: RmeInput.CAPTURE_L,
    inputType: InputType.GENERAL,
  },
  {
    name: "Input Right",
    pipewirePortName: "capture_FR",
    id: RmeInput.CAPTRUE_R,
    inputType: InputType.GENERAL,
  },
];

export const playbackChannelConfig: MixerChannel = {
  id: RmeReturn.PLAYBACK,
  name: "Playback",
  pipewirePortName: "", // i know..
  inputType: InputType.GENERAL,
};
