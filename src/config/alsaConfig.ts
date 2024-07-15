import { AlsaConfig } from "../types/config.types";
import { RmeInput } from "../types/rmePlugin.types";

export const alsaConfig: AlsaConfig = {
  outputs: [
    {
      displayName: "Main Output",
      alsaNameLeft: "AN1",
      alsaNameRight: "AN2",
    },
    {
      displayName: "Headphones",
      alsaNameLeft: "PH3",
      alsaNameRight: "PH4",
    },
  ],
  inputs: [
    {
      alsaName: "Mic-AN1",
      displayName: "Mic 1",
      input: RmeInput.MIC1,
      controls: {
        phantom: "48V",
      },
    },
    {
      alsaName: "Mic-AN2",
      displayName: "Mic 2",
      input: RmeInput.MIC2,
      controls: {
        phantom: "48V",
      },
    },
    {
      alsaName: "Line-IN3",
      displayName: "Line 3",
      input: RmeInput.LINE1,
      controls: {
        sensitivity: "Sens.",
      },
    },
    {
      alsaName: "Line-IN4",
      displayName: "Line 4",
      input: RmeInput.LINE2,
      controls: {
        sensitivity: "Sens.",
      },
    },
  ],
  playback: [
    {
      displayName: "Playback",
      alsaNameLeft: "PCM-AN1",
      alsaNameRight: "PCM-AN2",
    },
  ],
};
