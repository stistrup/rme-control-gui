// src/plugins/RmePlugin.ts
import { App } from "vue";
import { useRmeStore } from "../stores/rmeStore";
import { formatControls } from "../utils/formatAlsaOutput";
import { invoke } from "@tauri-apps/api/core";
import { RmeInput, RmeOutput, InitialStates } from "../types/rmePlugin.types";
import { AlsaConfig } from "../types/config.types";
import { alsaConfig } from "../config/alsaConfig";
import { profiles } from "../config/pipewireConfig";

export class RmePlugin {
  private store: ReturnType<typeof useRmeStore>;
  private config: AlsaConfig = alsaConfig;
  private alsaName = "Babyface Pro";
  private pipewireName = "RME_Babyface_Pro";

  constructor() {
    this.store = useRmeStore();
  }

  public getCurrentStates = async () => {
    try {
      const rawControls = (await invoke("get_soundcard_controls", {
        cardName: this.alsaName,
      })) as Record<string, string[]>;
      const formattedControls = formatControls(rawControls);
      this.store.setControls(formattedControls);

      const soundCardNumber = await this.findSoundCardNumber(this.alsaName);
      if (soundCardNumber) {
        this.store.setSoundcardNumber(soundCardNumber);
      }

      const profiles = await this.getSoundCardProfiles();
      if (profiles) {
        this.store.setSupportedProfiles(profiles);
      } else {
        console.warn("Could not get supported profiles");
      }

      const activeProfile = await this.getActiveProfile();
      if (activeProfile) {
        console.log("Setting profile yo");
        this.store.setActiveProfile(activeProfile);
      } else {
        console.warn("Could not get active profiles");
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };

  private convertInputToPortName = (input: RmeInput) => {
    let portName;
    if (this.store.activeProfile === profiles.proAudio) {
      if (input === RmeInput.MIC1) portName = "capture_AUX0";
      else if (input === RmeInput.MIC2) portName = "capture_AUX1";
      else if (input === RmeInput.LINE1) portName = "capture_AUX2";
      else if (input === RmeInput.LINE2) portName = "capture_AUX3";
      else {
        console.error("Unsopported input type when getting gain");
        return;
      }
    } else {
      console.error("This command is only supported in pro-audio profile");
      return;
    }
    return portName;
  };

  public findSoundCardNumber = async (soundCardName: string) => {
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
  };

  private getActiveProfile = async () => {
    try {
      const activeProfile = await invoke("get_pipewire_active_profile", {
        cardName: this.pipewireName,
      });
      console.log("Active profile retrieved:", activeProfile);
      return activeProfile as string;
    } catch (error) {
      console.error("Failed to get active profile:", error);
      throw error;
    }
  };

  public getControl = (name: string) => {
    return this.store.alsaControls[name];
  };

  public getGain = async (input: RmeInput) => {
    // let portName = this.convertInputToPortName(input);
    // if (!portName) return;
    // try {
    //   return await invoke("get_pipewire_gain", { portName });
    // } catch (error) {
    //   console.error("failed to fetch gain:", error);
    //   throw error;
    // }
  };

  public getInitialStates = async (): Promise<InitialStates> => {
    try {
      const states = (await invoke("get_initial_states")) as InitialStates;
      console.log("Initial states retrieved:", states);
      return states as InitialStates;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  };

  private getSoundCardProfiles = async () => {
    try {
      const profiles = await invoke("get_pipewire_profiles", {
        cardName: this.pipewireName,
      });
      return profiles as string[];
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  };

  public getVolume = (controlName: string, channel: string): number => {
    const control = this.getControl(controlName);
    return control?.values[channel] || 0;
  };

  public setPipewireProfile = async (profile: string) => {
    try {
      await invoke("set_pipewire_profile", {
        cardName: this.pipewireName,
        profile,
      });

      this.getCurrentStates();
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  };

  public setChannelVolume = async (
    input: RmeInput,
    output: RmeOutput,
    volume: number
  ) => {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }
    const controlName = `${RmeInput[input]}-${RmeOutput[output]}-Master`;
    await this.setVolume(controlName, volume);
  };

  public setGain = async (input: RmeInput, gain: number) => {
    const portName = this.convertInputToPortName(input);
    if (!portName) {
      console.error("Could not get port name when setting name");
      return;
    }

    if (gain < 0 || gain > 1) {
      console.warn("Volume out of range, will be clamped within 0 - 1");
    }
    invoke("set_pipewire_gain", { portName, gain });
  };

  public setLineSensitivity = async (input: RmeInput, sensitivity: number) => {
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
  };

  public setMonitorVolume = async (destination: RmeOutput, volume: number) => {
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
  };

  public setPhantomPower = async (input: RmeInput, state: boolean) => {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }

    let index = 0;

    switch (input) {
      case RmeInput.MIC1:
        index = 0;
        break;

      case RmeInput.MIC2:
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
  };

  public setVolume = async (controlName: string, volume: number) => {
    if (!this.store.soundCardNumber) {
      console.error("Cant set volume, sound card number not set");
      return;
    }

    const cardNumber = this.store.soundCardNumber;
    try {
      await invoke("set_volume", { cardNumber, controlName, volume });
    } catch (error) {
      console.error(`Error setting volume for ${controlName}:`, error);
    }
  };
}

export default {
  install: (app: App) => {
    app.provide("RmePlugin", new RmePlugin());
  },
};
