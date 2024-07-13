// src/plugins/RmePlugin.ts
import { App } from "vue";
import { useRmeStore } from "../stores/rmeStore";
import { formatControls } from "../utils/formatAlsaOutput";
import { invoke } from "@tauri-apps/api/core";
// import { AudioControls } from '../types/rme.types.ts';

export const AlsaDestinations = {
  headphones: {
    left: "PH3",
    right: "PH3",
  },
  monitors: {
    left: "AN1",
    right: "AN2",
  },
};

export const AlsaSources = {
  mic1: "Mic-AN1",
  mic2: "Mic-AN2",
  line1: "Line-IN3",
  line2: "Line-IN4",
};

export class RmePlugin {
  private store: ReturnType<typeof useRmeStore>;

  constructor() {
    this.store = useRmeStore();
  }

  install(app: App) {
    app.config.globalProperties.$rme = this;
    this.initializeAudio();
  }

  async initializeAudio() {
    try {
      const cardName = "Babyface Pro";
      const rawControls = (await invoke("get_soundcard_controls", {
        cardName,
      })) as Record<string, string[]>;
      const formattedControls = formatControls(rawControls);
      this.store.setControls(formattedControls);
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  getControl(name: string) {
    return this.store.controls[name];
  }

  async setVolume(controlName: string, channel: string, volume: number) {
    try {
      await invoke("set_volume", { controlName, channel, volume });
      // Update the store after setting the volume
      const updatedControl = (await invoke("get_control", {
        controlName,
      })) as string[];

      const formattedControls = formatControls({
        [controlName]: updatedControl,
      });
      const formattedControl = formattedControls[controlName];

      if (formattedControl) {
        this.store.updateControl(controlName, formattedControl);
      } else {
        console.error(`Failed to format control: ${controlName}`);
      }
    } catch (error) {
      console.error(`Error setting volume for ${controlName}:`, error);
    }
  }

  getVolume(controlName: string, channel: string): number {
    const control = this.getControl(controlName);
    return control?.values[channel] || 0;
  }

  // Add more methods as needed for other functionalities
}

export default {
  install: (app: App) => {
    app.provide("RmePlugin", new RmePlugin());
  },
};
