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
import { MixerChannel } from "../types/rmeStore.types";
import { audioProfilesConfig, babyfaceProConf } from "../config/soundCardConfig";
import { OutputType } from "../types/config.types";

export class RmeService {
  private store: ReturnType<typeof useRmeStore>;
  private config = babyfaceProConf;
  private profiles = audioProfilesConfig

  constructor() {
    this.store = useRmeStore();
  }

  // private getAlsaInputEntry(channel: RmeInput | RmeOutput | RmeReturn) {
  //   return alsaConfig.inputs.find((input) => input.id === channel);
  // }

  public init = async () => {
    try {
      const rawControls = (await invoke("get_soundcard_controls") as Record<string, string[]>)
      const formattedControls = formatControls(rawControls);
      this.store.setControls(formattedControls);

      const profiles = await this.getSoundCardProfiles();
      if (profiles) {
        this.store.setSupportedProfiles(profiles);
      } else {
        console.warn("Could not get supported profiles");
      }

      this.store.setPreferedProfiles(audioProfilesConfig)

      const activeProfile = await this.getActiveProfile();
      if (activeProfile) {
        this.store.setActiveProfile(activeProfile);
      } else {
        console.warn("Could not get active profiles");
      }

      this.store.isInitialized = true
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };

  private getActiveProfile = async () => {
    try {
      const activeProfile = await invoke("get_pipewire_active_profile");
      console.log("Active profile retrieved:", activeProfile);
      return activeProfile as string;
    } catch (error) {
      console.error("Failed to get active profile:", error);
      throw error;
    }
  };

  public getRoutingVolume = async (inputIndex: number, outputIndex: number) => {
    if (inputIndex > this.config.inputs.length) return
    if (outputIndex > this.config.outputs.length) return


    try {
      const left = (await invoke("get_channel_send_level", {
        channel: this.config.inputs[inputIndex].controlName,
        destination: this.config.outputs[outputIndex].controlNameLeft,
      })) as number;
      const right = (await invoke("get_channel_send_level", {
        channel: this.config.inputs[inputIndex].controlName,
        destination: this.config.outputs[outputIndex].controlNameRight,
      })) as number;

      return { left, right };
    } catch (error) {
      console.error(
        `Failed to fetch send level for ${this.config.inputs[inputIndex].displayName}:`,
        error
      );
      throw error;
    }
  };

  public getPhantomState = async (inputIndex: number) => {
    if (inputIndex > this.config.inputs.length) return
    if (!this.config.inputs[inputIndex].switcheNames.phantom) {
      console.error('This input does not support phantom. Cannot get')
      return
    }

    const inputName = this.config.inputs[inputIndex].controlName
    const switchName = this.config.inputs[inputIndex].switcheNames.phantom
    const fullControlName = `${inputName} ${switchName}`;

    try {
      const phantomState = (await invoke("get_phantom_power_state", {
        micAlsaName: fullControlName,
      })) as boolean;
      console.log("Phantom state for", phantomState);
      return phantomState;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  };

  public getLineSensitivity = async (inputIndex: number) => {
    if (inputIndex > this.config.inputs.length) return
    if (!this.config.inputs[inputIndex].switcheNames.lineSens) {
      console.error('This input does not support phantom. Cannot get')
      return
    }

    const inputName = this.config.inputs[inputIndex].controlName
    const switchName = this.config.inputs[inputIndex].switcheNames.lineSens
    const fullControlName = `${inputName} ${switchName}`;

    try {
      const sensitivity = (await invoke("get_line_input_sensitivity", {
        lineInputName: fullControlName,
      })) as string;
      console.log("sensitivity for", this.config.inputs[inputIndex].displayName, "is", sensitivity);
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
      const profiles = await invoke("get_pipewire_profiles");
      return profiles as string[];
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  };

  public getOutputVolume = async (outputType: OutputType) => {
    const output = this.config.outputs.find(output => output.type === outputType)

    if (!output){
      console.error('Could not find output in configuration')
      return
    }

    try {
      const left = (await invoke("get_alsa_volume", {
        controlName: output.controlNameLeft,
      })) as number;
      const right = (await invoke("get_alsa_volume", {
        controlName: output.controlNameRight,
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
    inputIndex: number,
    newSens: string
  ) => {
    if (inputIndex > this.config.inputs.length) return
    if (!this.config.inputs[inputIndex].switcheNames.lineSens) {
      console.error('This input does not support line sensitivity')
      return
    }


    const inputName = this.config.inputs[inputIndex].controlName
    const switchName = this.config.inputs[inputIndex].switcheNames.lineSens
    const fullControlName = `${inputName} ${switchName}`;

    try {
      await invoke("set_line_input_sensitivity", {
        lineInputName: fullControlName,
        sensitivity: newSens,
      });

      return true;
    } catch (error) {
      console.error("Failed to set line sensitivity", error);
      throw error;
    }
  };

  public setPhantomPower = async (inputIndex: number, newState: boolean) => {
    if (inputIndex > this.config.inputs.length) return
    if (!this.config.inputs[inputIndex].switcheNames.lineSens) {
      console.error('This input does not support line sensitivity')
      return
    }

    const inputName = this.config.inputs[inputIndex].controlName
    const switchName = this.config.inputs[inputIndex].switcheNames.phantom
    const fullControlName = `${inputName} ${switchName}`;

    try {
      await invoke("set_phantom_power", {
        micAlsaName: fullControlName,
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
        profile,
      });

      this.init();
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

  public setRoutingVolume = async (
    inputIndex: number,
    outputIndex: number,
    level: number
  ) => {
    if (level < 0 || level > 1) {
      console.warn("Send level out of range, will be clamped within 0 - 1");
    }
    if (inputIndex > this.config.inputs.length) return
    if (outputIndex > this.config.outputs.length) return

    // const inputName = this.config.inputs[inputIndex].controlName
    // const outputName = this.config.outputs[outputIndex].controlNameLeft
    // const fullControlName = `${inputName} ${switchName}`;


    // try {
    //   await invoke("set_routing_volume", {
    //     source: alsaEntry.alsaName,
    //     destination: alsaOutput.alsaNameLeft,
    //     level,
    //   });
    // } catch (error) {
    //   console.error(
    //     `Failed to set routing volume for ${this.config.inputs[inputIndex].displayName}`,
    //     error
    //   );
    //   throw error;
    // }
  };

  public setOutputVolume = async (outputType: OutputType, volume: number) => {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }

    if (volume < 0 || volume > 100) {
      console.warn("Volume out of range, will be clamped within 0 - 100");
    }

    const output = this.config.outputs.find(output => output.type === outputType)

    if (!output){
      console.error('Could not find output in configuration')
      return
    }

    await this.setVolume(output.controlNameLeft, volume);
    await this.setVolume(output.controlNameRight, volume);
  };

  public setMainOutVolume = async (outputIndex: number, volume: number) => {
    if (!this.config) {
      console.error("RmePlugin not initialized");
      return;
    }

    if (volume < 0 || volume > 100) {
      console.warn("Volume out of range, will be clamped within 0 - 100");
    }

    const controlNameLeft = this.config.outputs[outputIndex].controlNameLeft;
    const controlNameRight = this.config.outputs[outputIndex].controlNameRight;

    await this.setVolume(controlNameLeft, volume);
    await this.setVolume(controlNameRight, volume);
  };

  public setVolume = async (controlName: string, volume: number) => {
    try {
      await invoke("set_alsa_volume", {
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
