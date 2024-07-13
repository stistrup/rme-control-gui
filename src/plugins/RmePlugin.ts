// src/plugins/RmePlugin.ts
import { App } from "vue";
import { useRmeStore } from "../stores/rmeStore";
import { formatControls } from "../utils/formatAlsaOutput";
import { invoke } from "@tauri-apps/api/core";
import { RmeInput, RmeOutput, InitialStates } from "../types/rmePlugin.types";
import { AlsaConfig } from "../types/alsaConfig.types";
import { alsaConfig } from "../config/alsaConfig";

export class RmePlugin {
  private store: ReturnType<typeof useRmeStore>;
  private config: AlsaConfig = alsaConfig;
  private name = "Babyface Pro";

  constructor() {
    this.store = useRmeStore();
  }

  async init() {
    try {
      const rawControls = (await invoke("get_soundcard_controls", {
        cardName: this.name,
      })) as Record<string, string[]>;
      const formattedControls = formatControls(rawControls);
      const soundCardNumber = await this.findSoundCardNumber(this.name);

      this.store.setControls(formattedControls);
      if (soundCardNumber) {
        this.store.setSoundcardNumber(soundCardNumber);
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  getControl(name: string) {
    return this.store.alsaControls[name];
  }

  async setVolume(controlName: string, volume: number) {
    if (!this.store.soundCardNumber) {
      console.error("Cant set volume, sound card number not set");
      return;
    }

    const cardNumber = this.store.soundCardNumber;
    try {
      await invoke("set_volume", { cardNumber, controlName, volume });
      // Update the store after setting the volume
      // const updatedControl = (await invoke("get_control", {
      //   controlName,
      // })) as string[];

      // const formattedControls = formatControls({
      //   [controlName]: updatedControl,
      // });
      // const formattedControl = formattedControls[controlName];

      // if (formattedControl) {
      //   this.store.updateControl(controlName, formattedControl);
      // } else {
      //   console.error(`Failed to format control: ${controlName}`);
      // }
    } catch (error) {
      console.error(`Error setting volume for ${controlName}:`, error);
    }
  }

  getVolume(controlName: string, channel: string): number {
    const control = this.getControl(controlName);
    return control?.values[channel] || 0;
  }

  async setMonitorVolume(destination: RmeOutput, volume: number) {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }

    if (volume < 0 || volume > 100) {
      console.warn("Volume out of range, will be clamped within 0 - 100");
    }

    const sourceLeft = this.config.playback[0].alsaNameLeft;
    const sourceRight = this.config.playback[0].alsaNameRight;

    let destinationLeft = "";
    let destinationRight = "";

    if (destination === RmeOutput.MONITORS) {
      destinationLeft = this.config.outputs[0].alsaNameLeft;
      destinationRight = this.config.outputs[0].alsaNameRight;
    } else if (destination === RmeOutput.HEADPHONES) {
      destinationLeft = this.config.outputs[1].alsaNameLeft;
      destinationRight = this.config.outputs[1].alsaNameRight;
    }

    const controlNameLeft = `${sourceLeft}-${destinationLeft}`;
    const controlNameRight = `${sourceRight}-${destinationRight}`;

    await this.setVolume(controlNameLeft, volume);
    await this.setVolume(controlNameRight, volume);
  }

  async findSoundCardNumber(soundCardName: string) {
    try {
      const cardNumber = await invoke("find_sound_card_number", {
        soundCardName,
      });

      console.log(typeof cardNumber);
      return cardNumber as number;
    } catch (error) {
      console.error("Failed to initialize sound card:", error);
      return null;
    }
  }

  async setChannelVolume(input: RmeInput, output: RmeOutput, volume: number) {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }
    // Define control name mapping based on input and output enums
    const controlName = `${RmeInput[input]}-${RmeOutput[output]}-Master`;
    await this.setVolume(controlName, volume);
  }

  async setPhantomPower(input: RmeInput, state: boolean) {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }

    let index = 0;

    switch (input) {
      case RmeInput.MIC1:
        index = 0;
        break;

      case RmeInput.MIC1:
        index = 1;
        break;

      default:
        throw new Error("Phantom power can only be set for microphone inputs");
    }

    const switchName = this.config.inputs[index].controls.sensitivity;
    if (!switchName) return;
    const sourceName = this.config.inputs[index].alsaName;

    const controlName = `${sourceName} ${switchName}`;
    const controlCommand = state ? "on" : "off";

    try {
      await invoke("set_switch", { controlName, controlCommand });
      console.log(`Phantom power set to ${state} for ${controlName}`);
    } catch (error) {
      console.error(`Failed to set phantom power for ${controlName}:`, error);
    }
  }

  async setLineSensitivity(input: RmeInput, sensitivity: number) {
    if (input !== RmeInput.LINE1 && input !== RmeInput.LINE2) {
      throw new Error("Line sensitivity can only be set for line inputs");
    }
    const controlName = `${RmeInput[input]}-Sens`;
    try {
      await invoke("set_sensitivity", { controlName, sensitivity });
      console.log(`Sensitivity set to ${sensitivity} for ${controlName}`);
    } catch (error) {
      console.error(`Failed to set sensitivity for ${controlName}:`, error);
    }
  }

  async getInitialStates(): Promise<InitialStates> {
    try {
      const states = (await invoke("get_initial_states")) as InitialStates;
      console.log("Initial states retrieved:", states);
      return states as InitialStates;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  }

  async getGain() {
    try {
      return await invoke("get_pipewire_gain", { cardName: this.name });
    } catch (error) {
      console.error("failed to fetch gain:", error);
      throw error;
    }
  }

  async setGain(gain: number) {
    if (gain < 0 || gain > 1) {
      console.warn("Volume out of range, will be clamped within 0 - 1");
    }
    invoke("set_pipewire_gain", { gain });
  }
}

export default {
  install: (app: App) => {
    app.provide("RmePlugin", new RmePlugin());
  },
};
