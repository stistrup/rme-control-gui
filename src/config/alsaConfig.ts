import { AlsaConfig } from "../types/config.types";
import { RmeInput, RmeOutput, RmeReturn } from "../types/rmeService.types";

export const alsaConfig: AlsaConfig = {
  outputs: [
    {
      displayName: "Main Output",
      id: RmeOutput.MONITORS,
      alsaNameLeft: "AN1",
      alsaNameRight: "AN2",
    },
    {
      displayName: "Headphones",
      id: RmeOutput.HEADPHONES,
      alsaNameLeft: "PH3",
      alsaNameRight: "PH4",
    },
  ],
  inputs: [
    {
      alsaName: "Mic-AN1",
      displayName: "Mic 1",
      id: RmeInput.MIC1,
      controls: {
        phantom: "48V",
      },
    },
    {
      alsaName: "Mic-AN2",
      displayName: "Mic 2",
      id: RmeInput.MIC2,
      controls: {
        phantom: "48V",
      },
    },
    {
      alsaName: "Line-IN3",
      displayName: "Line 3",
      id: RmeInput.LINE1,
      controls: {
        sensitivity: "Sens.",
      },
    },
    {
      alsaName: "Line-IN4",
      displayName: "Line 4",
      id: RmeInput.LINE2,
      controls: {
        sensitivity: "Sens.",
      },
    },
    {
      // Because default profile just have left and right, it will show the first 2 inputs:
      alsaName: "Mic-AN1",
      displayName: "Mic 1",
      id: RmeInput.CAPTURE_L,
      controls: {
        phantom: "48V",
      },
    },
    {
      alsaName: "Mic-AN2",
      displayName: "Mic 2",
      id: RmeInput.CAPTRUE_R,
      controls: {
        phantom: "48V",
      },
    },
  ],
  playback: [
    {
      id: RmeReturn.PLAYBACK,
      displayName: "Playback",
      alsaNameLeft: "PCM-AN1",
      alsaNameRight: "PCM-AN2",
    },
  ],
};

export const lineSensitivity = {
  high: "-10dBV",
  low: "+4dBu",
};
