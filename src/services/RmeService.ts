import { App } from "vue";
import { useRmeStore } from "../stores/rmeStore";
import { formatControls } from "../utils/formatAlsaOutput";
import { invoke } from "@tauri-apps/api/core";
import {
  RmeInput,
  RmeOutput,
  InitialStates,
  InputType,
  RmeReturn,
} from "../types/rmeService.types";
import {
  AlsaConfig,
  MonoInput,
  StereoOutput,
  StereoReturn,
} from "../types/config.types";
import { alsaConfig } from "../config/alsaConfig";
import { MixerChannel } from "../types/rmeStore.types";

export class RmeService {
  private store: ReturnType<typeof useRmeStore>;
  private config: AlsaConfig = alsaConfig;
  private alsaCardName = "Babyface Pro";
  private pipewireCardName = "RME_Babyface_Pro";

  constructor() {
    this.store = useRmeStore();
  }

  private getAlsaInputEntry(channel: RmeInput | RmeOutput | RmeReturn) {
    return alsaConfig.inputs.find((input) => input.id === channel);
  }

  public getCurrentStates = async () => {
    try {
      const rawControls = (await invoke("get_soundcard_controls", {
        cardName: this.alsaCardName,
      })) as Record<string, string[]>;
      const formattedControls = formatControls(rawControls);
      this.store.setControls(formattedControls);

      const soundCardNumber = await this.findSoundCardNumber(this.alsaCardName);
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
        this.store.setActiveProfile(activeProfile);
      } else {
        console.warn("Could not get active profiles");
      }
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };

  public findSoundCardNumber = async (cardName: string) => {
    try {
      const cardNumber = await invoke("find_sound_card_number", {
        cardName,
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
        cardName: this.pipewireCardName,
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

  public getSendLevel = async (channel: MixerChannel, output: RmeOutput) => {
    const alsaEntry = this.getAlsaInputEntry(channel.input);
    if (!alsaEntry)
      throw new Error(`No ALSA entry found for channel ${channel.name}`);

    const alsaOutput = alsaConfig.outputs.find((out) => out.id === output);

    if (!alsaOutput) {
      console.error("Alsa configuration not properly set up");
      return;
    }

    try {
      const left = (await invoke("get_channel_send_level", {
        cardName: this.alsaCardName,
        channel: alsaEntry.alsaName,
        destination: alsaOutput.alsaNameLeft,
      })) as number;
      const right = (await invoke("get_channel_send_level", {
        cardName: this.alsaCardName,
        channel: alsaEntry.alsaName,
        destination: alsaOutput.alsaNameRight,
      })) as number;

      return { left, right };
    } catch (error) {
      console.error(
        `Failed to fetch ${RmeOutput[output]} send level for ${channel.name}:`,
        error
      );
      throw error;
    }
  };

  public getPhantomState = async (channel: MixerChannel) => {
    const alsaEntry = alsaConfig.inputs.find(
      (input) => input.id === channel.input
    );

    if (!alsaEntry?.controls.phantom) return;

    const fullName = `${alsaEntry.alsaName} ${alsaEntry.controls.phantom}`;

    try {
      const phantomState = (await invoke("get_phantom_power_state", {
        cardName: this.alsaCardName,
        micAlsaName: fullName,
      })) as boolean;
      console.log("Phantom state for", phantomState);
      return phantomState;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  };

  public getLineSensitivity = async (channel: MixerChannel) => {
    const alsaEntry = alsaConfig.inputs.find(
      (input) => input.id === channel.input
    );

    if (!alsaEntry?.controls.sensitivity) return;

    const fullName = `${alsaEntry.alsaName} ${alsaEntry.controls.sensitivity}`;

    try {
      const sensitivity = (await invoke("get_line_input_sensitivity", {
        cardName: this.alsaCardName,
        lineInputName: fullName,
      })) as string;
      console.log("sensitivity for", channel.name, "is", sensitivity);
      return sensitivity;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
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
        cardName: this.pipewireCardName,
      });
      return profiles as string[];
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  };

  public getOutputVolume = async (target: RmeOutput) => {
    const alsaEntryTarget = alsaConfig.outputs.find(
      (entry) => entry.id === target
    );
    const alsaEntrySource = alsaConfig.playback.find(
      (entry) => entry.id === RmeReturn.PLAYBACK
    );

    if (!alsaEntryTarget || !alsaEntrySource) {
      console.error("Alsa entry not configured");
      return;
    }

    const fullAlsaNameLeft = `${alsaEntrySource.alsaNameLeft}-${alsaEntryTarget.alsaNameLeft}`;
    const fullAlsaNameRight = `${alsaEntrySource.alsaNameRight}-${alsaEntryTarget.alsaNameRight}`;

    try {
      const left = (await invoke("get_alsa_volume", {
        cardName: this.alsaCardName,
        controlName: fullAlsaNameLeft,
      })) as number;
      const right = (await invoke("get_alsa_volume", {
        cardName: this.alsaCardName,
        controlName: fullAlsaNameRight,
      })) as number;
      return { left, right };
    } catch (error) {
      console.error("Failed to output volume:", error);
      throw error;
    }
  };

  public setBufferSize = async (bufferSize: number) => {
    if (
      bufferSize < 32 ||
      bufferSize > 2048 ||
      (bufferSize & (bufferSize - 1)) != 0
    ) {
      console.error(
        "The buffer size must be a power of two between 32 and 8192"
      );
      return;
    }

    try {
      await invoke("set_buffer_size", {
        bufferSize,
      });
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  };

  public setLineSensitivity = async (
    channel: MixerChannel,
    newSens: string
  ) => {
    if (channel.inputType !== InputType.LINE) {
      console.error("This input type doesnt support line sensitivity");
      return;
    }

    const alsaEntry = alsaConfig.inputs.find(
      (input) => input.id === channel.input
    );

    if (!alsaEntry?.controls.sensitivity) {
      console.error("Alsa not properly configured for lineSensitivity");
      return;
    }

    const fullAlsaName = `${alsaEntry.alsaName} ${alsaEntry.controls.sensitivity}`;

    try {
      await invoke("set_line_input_sensitivity", {
        cardName: this.alsaCardName,
        lineInputName: fullAlsaName,
        sensitivity: newSens,
      });

      return true;
    } catch (error) {
      console.error("Failed to set line sensitivity", error);
      throw error;
    }
  };
  public setPhantomPower = async (channel: MixerChannel, newState: boolean) => {
    if (channel.inputType !== InputType.MIC) {
      console.error("This input type doesnt support phantom power");
      return;
    }

    const alsaEntry = alsaConfig.inputs.find(
      (input) => input.id === channel.input
    );

    if (!alsaEntry?.controls.phantom) {
      console.error("Alsa not properly configured for phantom");
      return;
    }

    const fullAlsaName = `${alsaEntry.alsaName} ${alsaEntry.controls.phantom}`;

    try {
      await invoke("set_phantom_power", {
        cardName: this.alsaCardName,
        micAlsaName: fullAlsaName,
        newState: newState,
      });

      return true;
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  };

  public setPipewireProfile = async (profile: string) => {
    try {
      await invoke("set_pipewire_profile", {
        cardName: this.pipewireCardName,
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

  public setSendLevel = async (
    channel: MixerChannel,
    output: RmeOutput,
    level: number
  ) => {
    if (level < 0 || level > 1) {
      console.warn("Send level out of range, will be clamped within 0 - 1");
    }

    const alsaEntry = this.getAlsaInputEntry(channel.input);
    if (!alsaEntry)
      throw new Error(`No ALSA entry found for channel ${channel.name}`);

    const alsaOutput = alsaConfig.outputs.find((out) => out.id === output);

    if (!alsaOutput) {
      console.error("Alsa configuration not properly set up");
      return;
    }

    try {
      await invoke("set_channel_send_level", {
        cardName: this.alsaCardName,
        channel: alsaEntry.alsaName,
        destination: alsaOutput.alsaNameLeft,
        level,
      });
      await invoke("set_channel_send_level", {
        cardName: this.alsaCardName,
        channel: alsaEntry.alsaName,
        destination: alsaOutput.alsaNameRight,
        level,
      });
    } catch (error) {
      console.error(
        `Failed to set ${RmeOutput[output]} send level for ${channel.name}:`,
        error
      );
      throw error;
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

  public setVolume = async (controlName: string, volume: number) => {
    if (!this.store.soundCardNumber) {
      console.error("Cant set volume, sound card number not set");
      return;
    }

    try {
      await invoke("set_alsa_volume", {
        cardName: this.alsaCardName,
        controlName,
        volume,
      });
    } catch (error) {
      console.error(`Error setting volume for ${controlName}:`, error);
    }
  };
}

export default {
  install: (app: App) => {
    app.provide("RmeService", new RmeService());
  },
};
