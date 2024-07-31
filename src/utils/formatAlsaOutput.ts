import { AudioControl, AudioControls } from "../types/alsaOutput.types";

export const formatControls = (
  rawControls: Record<string, string[]>
): AudioControls => {
  const processedControls: AudioControls = {};

  for (const [name, info] of Object.entries(rawControls)) {
    const control: AudioControl = {
      name,
      capabilities: [],
      channels: "",
      limits: { min: 0, max: 0 },
      values: {},
    };

    for (const line of info) {
      if (line.includes("Capabilities:")) {
        control.capabilities = line.split(":")[1].trim().split(" ");
      } else if (line.includes("Playback channels:")) {
        control.channels = line.split(":")[1].trim();
      } else if (line.includes("Limits:")) {
        const limits = line.match(/Limits:(?:\s*Playback)?\s*(\d+)\s*-\s*(\d+)/);
        if (limits) {
          control.limits.min = parseInt(limits[1]);
          control.limits.max = parseInt(limits[2]);
        }
      } else if (
        line.includes("Mono:") ||
        line.includes("Front Left:") ||
        line.includes("Front Right:")
      ) {
        const parts = line.split(":");
        const channel = parts[0].trim();
        const valueMatch = parts[1].match(/(?:Playback\s*)?(\d+)\s*\[(\d+)%\]/);
        if (valueMatch) {
          control.values[channel] = parseInt(valueMatch[1]);
        }
      } else if (
        line.includes("Item0: 'On'") ||
        line.includes("Item0: 'Off'")
      ) {
        control.values.phantom = line.includes("Item0: 'On'") ? 1 : 0;
      }
    }

    processedControls[name] = control;
  }

  return processedControls;
};
