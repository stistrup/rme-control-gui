import { InputType, RmeInput } from "../types/rmeService.types";
import { MixerChannel } from "../types/rmeStore.types";

export const mixerChannelsPro: MixerChannel[] = [
  {
    name: "Mic 1",
    pipewirePortName: "capture_AUX0",
    input: RmeInput.MIC1,
    inputType: InputType.MIC,
  },
  {
    name: "Mic 2",
    pipewirePortName: "capture_AUX1",
    input: RmeInput.MIC2,
    inputType: InputType.MIC,
  },
  {
    name: "Line 1",
    pipewirePortName: "capture_AUX2",
    input: RmeInput.LINE1,
    inputType: InputType.LINE,
  },
  {
    name: "Line 2",
    pipewirePortName: "capture_AUX3",
    input: RmeInput.LINE2,
    inputType: InputType.LINE,
  },
];

export const mixerChannelsDefault: MixerChannel[] = [
  {
    name: "Input Left",
    pipewirePortName: "capture_FL",
    input: RmeInput.CAPTURE_L,
    inputType: InputType.GENERAL,
  },
  {
    name: "Input Right",
    pipewirePortName: "capture_FR",
    input: RmeInput.CAPTRUE_R,
    inputType: InputType.GENERAL,
  },
];
