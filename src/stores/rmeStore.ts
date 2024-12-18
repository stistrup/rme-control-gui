import { defineStore } from "pinia";
import { ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";
import { AlsaInput, AlsaOutput, AlsaPlayback, AudioProfile, TauriInputChannelConfig } from "../types/config.types";
import { audioProfilesConfig, babyfaceProConf } from "../config/soundCardConfig";

export const useRmeStore = defineStore("rme", () => {
  const soundCardConfig = ref(babyfaceProConf)
  const alsaControls = ref<AudioControls>({});
  const activeProfile = ref<null | AudioProfile>(null);
  const supportedProfiles = ref<string[]>([]);
  const inputs = ref<AlsaInput[]>(babyfaceProConf.inputs);
  const outputs = ref<AlsaOutput[]>(babyfaceProConf.outputs);
  const playback = ref<AlsaPlayback>(babyfaceProConf.playback)

  const isInitialized = ref<boolean | null>(null);

  const setActiveProfile = (newProfile: string) => {
    const isSupported = supportedProfiles.value.includes(newProfile)
    const targetProfile = audioProfilesConfig.find(profile => profile.profileName === newProfile)
    if (isSupported && targetProfile) {
      activeProfile.value = targetProfile;
    } else {
      console.warn(`Profile "${newProfile}" is not supported`);
    }
  };

  const setControls = (newControls: AudioControls) => {
    alsaControls.value = newControls;
  };

  const getControlByName = (controlName: string) => {
    return alsaControls.value[controlName]
  }

  const setInputChannelConfig = (inputChannels: TauriInputChannelConfig[]) => {
    inputs.value.forEach((input) => {
      const inputChannelConf = inputChannels.find(inputChannel => inputChannel.control_name === input.controlName)

      if (inputChannelConf) {
        input.displayName = inputChannelConf.display_name
        input.stereoCoupled = inputChannelConf.stereo_coupled
      }
    })
  }

  const setSupportedProfiles = (profiles: string[]) => {
    supportedProfiles.value = profiles;
  };

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (alsaControls.value[controlName]) {
      alsaControls.value[controlName] = updatedControl;
    }
  }

  return {
    activeProfile,
    alsaControls,
    inputs,
    isInitialized,
    outputs,
    playback,
    soundCardConfig,
    supportedProfiles,
    getControlByName,
    setActiveProfile,
    setControls,
    setInputChannelConfig,
    setSupportedProfiles,
    updateControl,
  };
});
