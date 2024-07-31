import { App } from "vue";
import { useRmeStore } from "../stores/rmeStore";
import { formatControls } from "../utils/formatAlsaOutput";
import { invoke } from "@tauri-apps/api/core";
import { OutputType } from "../types/config.types";
import { alsaToDB, dbToALSA } from "../utils/alsaValConversion";

export class RmeService {
  private store: ReturnType<typeof useRmeStore>;

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

  public getOutputRoutingVolume = async (inputIndex: number, outputType: OutputType) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return

    const output = this.store.outputs.find(output => output.type === outputType)

    if (!output) {
      console.error('Could not find output in config')
      return
    }

    try {
      const left = (await invoke("get_routing_volume", {
        source: this.store.soundCardConfig.inputs[inputIndex].controlName,
        destination: output.routeNameLeft,
      })) as number;
      const right = (await invoke("get_routing_volume", {
        source: this.store.soundCardConfig.inputs[inputIndex].controlName,
        destination: output.routeNameRight,
      })) as number;

      return { left: alsaToDB(left), right: alsaToDB(right) };
    } catch (error) {
      console.error(
        `Failed to fetch send level for ${this.store.soundCardConfig.inputs[inputIndex].displayName}:`,
        error
      );
      throw error;
    }
  };

  public getPhantomState = async (inputIndex: number) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return

    const input = this.store.soundCardConfig.inputs[inputIndex]

    if (!input.switchNames.phantom) {
      console.error('This input does not support phantom. Cannot get')
      return
    }

    try {
      const phantomState = (await invoke("get_phantom_power_state", {
        controlName: input.switchNames.phantom,
      })) as boolean;
      console.log("Phantom state for", input.displayName, ':', phantomState);
      return phantomState;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  };

  public getLineSensitivity = async (inputIndex: number) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return
    if (!this.store.soundCardConfig.inputs[inputIndex].switchNames.lineSens) {
      console.error('This input does not support phantom. Cannot get')
      return
    }

    const inputName = this.store.soundCardConfig.inputs[inputIndex].controlName
    const switchName = this.store.soundCardConfig.inputs[inputIndex].switchNames.lineSens
    const fullControlName = `${inputName} ${switchName}`;

    try {
      const sensitivity = (await invoke("get_line_input_sensitivity", {
        lineInputName: fullControlName,
      })) as string;
      console.log("sensitivity for", this.store.soundCardConfig.inputs[inputIndex].displayName, "is", sensitivity);
      return sensitivity;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  };

  // TODO:
  public getInitialStates = async (): Promise<any> => {
    try {
      const states = (await invoke("get_initial_states")) as any;
      console.log("Initial states retrieved:", states);
      return states as any;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  };

  public getInputGain = async (inputIndex: number) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return

    const controlName = this.store.soundCardConfig.inputs[inputIndex].switchNames.gain

    try {
      const gain = (await invoke("get_input_gain", {
        controlName: controlName,
      }) as number);

      return gain;
    } catch (error) {
      console.error("Failed to set line sensitivity", error);
      throw error;
    }
  }

  public setInputGain = async (inputIndex: number, gain: number) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return

    const controlName = this.store.soundCardConfig.inputs[inputIndex].switchNames.gain

    try {
      const result = (await invoke("set", {
        controlName: controlName,
        gain
      }) as number);

      return result;
    } catch (error) {
      console.error("Failed to set line sensitivity", error);
      throw error;
    }
  }

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
    const output = this.store.soundCardConfig.outputs.find(output => output.type === outputType)

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

      return { left: alsaToDB(left), right: alsaToDB(right) };
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
    if (inputIndex > this.store.soundCardConfig.inputs.length) return
    if (!this.store.soundCardConfig.inputs[inputIndex].switchNames.lineSens) {
      console.error('This input does not support line sensitivity')
      return
    }


    const inputName = this.store.soundCardConfig.inputs[inputIndex].controlName
    const switchName = this.store.soundCardConfig.inputs[inputIndex].switchNames.lineSens
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
    if (inputIndex > this.store.soundCardConfig.inputs.length) return
    if (!this.store.soundCardConfig.inputs[inputIndex].switchNames.phantom) {
      console.error('This input does not support line sensitivity')
      return
    }

    const switchName = this.store.soundCardConfig.inputs[inputIndex].switchNames.phantom

    try {
      await invoke("set_phantom_power", {
        controlName: switchName,
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

  public setOutputRoutingVolume = async (
    inputIndex: number,
    outputIndex: number,
    level: number
  ) => {
    const input = this.store.soundCardConfig.inputs[inputIndex]
    const output = this.store.soundCardConfig.outputs[outputIndex]

    if (!input || !output) {
      console.error('Error setting output routing volume', input, output)
      return
    }

    const alsaValue = dbToALSA(level)

    try {
      await invoke("set_routing_volume", {
        source: input.controlName,
        destination: output.routeNameLeft,
        level: alsaValue,
      });
      await invoke("set_routing_volume", {
        source: input.controlName,
        destination: output.routeNameRight,
        level: alsaValue,
      });
    } catch (error) {
      console.error(
        `Failed to set routing volume for ${this.store.soundCardConfig.inputs[inputIndex].displayName}`,
        error
      );
      throw error;
    }
  };

  public setOutputVolume = async (outputType: OutputType, volume: number) => {
    if (!this.store.soundCardConfig) {
      console.error("RmePlugin not initialized");
      return;
    }

    const output = this.store.soundCardConfig.outputs.find(output => output.type === outputType)

    if (!output){
      console.error('Could not find output in configuration')
      return
    }

    const alsaValue = dbToALSA(volume)

    try {
      await invoke("set_alsa_volume", {
        controlName: output.controlNameLeft,
        volume: alsaValue,
      });
      await invoke("set_alsa_volume", {
        controlName: output.controlNameRight,
        volume: alsaValue,
      });
    } catch (error) {
      console.error(`Error setting volume`, error);
    }
  };
}

export default {
  install: (app: App) => {
    app.provide("RmeService", new RmeService());
  },
};
