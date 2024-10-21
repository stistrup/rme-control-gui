import { App } from "vue";
import { useRmeStore } from "../stores/rmeStore";
import { formatControls } from "../utils/formatAlsaOutput";
import { invoke } from "@tauri-apps/api/core";
import { alsaToDB, dbToALSA } from "../utils/alsaValConversion";
import { TauriInputChannelConfig } from "../types/config.types";

export class RmeService {
  private store: ReturnType<typeof useRmeStore>;

  constructor() {
    this.store = useRmeStore();
  }

  public init = async () => {
    try {
      const rawControls = (await invoke("get_soundcard_controls") as Record<string, string[]>)
      const formattedControls = formatControls(rawControls);
      this.store.setControls(formattedControls);

      const profiles = await this.getAllProfiles();
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

      const inputChannelsConfig = await this.getInputChannelsConfig() as TauriInputChannelConfig[];

      // Check if all channels have stored configs tauri storage. Otherwise init with soundCardConfig.ts
      this.store.inputs.forEach((input) => {
        const inputHasConfig = inputChannelsConfig.some(config => config.control_name === input.controlName)
        if (!inputHasConfig) {
          console.log('No input channel config found for', input.displayName, '. Setting default from soundCardConfig.ts')
          this.setInputChannelConfig(input.controlName, input.displayName, input.stereoCoupled)
        }
      })

      this.store.setInputChannelConfig(inputChannelsConfig)

      this.store.isInitialized = true
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  };


  private getAllProfiles = async () => {
    try {
      const profiles = await invoke("get_pipewire_profiles");
      return profiles as string[];
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      return null
    }
  };

  private getActiveProfile = async () => {
    try {
      const activeProfile = await invoke("get_pipewire_active_profile");
      console.log("Active profile retrieved:", activeProfile);
      return activeProfile as string;
    } catch (error) {
      console.error("Failed to get active profile:", error);
      return null
    }
  };

  public setActiveProfile = async (profile: string) => {
    try {
      await invoke("set_pipewire_profile", {
        profile,
      });

      this.init();
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      return null
    }
  };

  public getAlsaVolumeStereo = async (controlNameLeft: string, controlNameRight: string) => {
    try {
      const left = (await invoke("get_alsa_volume", {
        controlName: controlNameLeft,
      })) as number;
      const right = (await invoke("get_alsa_volume", {
        controlName: controlNameRight,
      })) as number;

      return { left: alsaToDB(left), right: alsaToDB(right) };
    } catch (error) {
      console.error(
        `Failed to get volume for ${controlNameLeft} or ${controlNameRight}:`,
        error
      );
      return null
    }
  }

  public setAlsaVolumeStereo = async (controlNameLeft: string, controlNameRight: string, db: number) => {
   
    const alsaValue = dbToALSA(db)

    try {
      await invoke("set_alsa_volume", {
        controlName: controlNameLeft,
        volume: alsaValue,
      });
      await invoke("set_alsa_volume", {
        controlName: controlNameRight,
        volume: alsaValue,
      });
      return 1
    } catch (error) {
      console.error(
        `Failed to set volume for ${controlNameLeft} or ${controlNameRight}:`,
        error
      );
      throw error;
    }
  }

  public getAlsaVolumeMono = async (controlName: string) => {
    try {
      const volume = (await invoke("get_alsa_volume", {
        controlName,
      })) as number;

      return alsaToDB(volume)
    } catch (error) {
      console.error(
        `Failed to get volume for ${controlName}:`,
        error
      );
      return null
    }
  }

  public setAlsaVolumeMono = async (controlName: string, db: number) => {
    
    const alsaValue = dbToALSA(db)

    try {
      await invoke("set_alsa_volume", {
        controlName,
        level: alsaValue,
      });

      return 1
    } catch (error) {
      console.error(
        `Failed to set volume for ${controlName}:`,
        error
      );
      return null
    }
  }

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

  public getInputChannelsConfig = async () => {
    try {
      const config = (await invoke("load_all_channels"));

      return config
    } catch (error) {
      console.error(
        `Failed to get volume for input channels config:`,
        error
      );
      return null
    }
  }

  public setInputChannelConfig = async (controlName: string, displayName: string, stereoCoupled: boolean) => {
    try {
      const result = (await invoke("save_channel_config", {
        controlName,
        displayName,
        stereoCoupled
      }) as number);

      return result;
    } catch (error) {
      console.error("Failed to set channelConfig", error);
      throw error;
    }
  }

  public setMainOutVolume = async (volume: number) => {
    const value = dbToALSA(volume)
    try {
      await invoke("set_main_out_volume", {
        channel: 0,
        value
      });
      await invoke("set_main_out_volume", {
        channel: 1,
        value
      });
    } catch (error) {
      console.error("Set main out volume error::", error);
      throw error;
    }
  }

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

  public getInputGain = async (controlName: string) => {
    try {
      const gain = (await invoke("get_input_gain", {
        controlName,
      }) as number);

      return gain;
    } catch (error) {
      console.error("Failed to set line sensitivity", error);
      throw error;
    }
  }

  public setInputGain = async (controlName: string, gain: number) => {
    try {
      const result = (await invoke("set_input_gain", {
        controlName,
        gain
      }) as number);

      return result;
    } catch (error) {
      console.error("Failed to set gain", error);
      throw error;
    }
  }

  public setPadState = async (inputIndex: number, newState: boolean) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return
    if (!this.store.soundCardConfig.inputs[inputIndex].switchNames.phantom) {
      console.error('This input does not support line sensitivity')
      return
    }

    const switchName = this.store.soundCardConfig.inputs[inputIndex].switchNames.pad

    try {
      await invoke("set_pad_state", {
        controlName: switchName,
        newState: newState,
      });

      return true;
    } catch (error) {
      console.error("Failed to get pipewire profiles:", error);
      throw error;
    }
  }

  public getPadState = async (inputIndex: number) => {
    if (inputIndex > this.store.soundCardConfig.inputs.length) return

    const input = this.store.soundCardConfig.inputs[inputIndex]

    if (!input.switchNames.phantom) {
      console.error('This input does not support phantom. Cannot get')
      return
    }

    try {
      const phantomState = (await invoke("get_pad_state", {
        controlName: input.switchNames.phantom,
      })) as boolean;
      console.log("Phantom state for", input.displayName, ':', phantomState);
      return phantomState;
    } catch (error) {
      console.error("Failed to get initial states:", error);
      throw error;
    }
  }

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
}

export default {
  install: (app: App) => {
    app.provide("RmeService", new RmeService());
  },
};
