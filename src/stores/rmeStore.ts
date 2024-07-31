import { defineStore } from "pinia";
import { ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";
import { AlsaInput, AlsaOutput, AudioProfile } from "../types/config.types";
import { audioProfilesConfig, babyfaceProConf } from "../config/soundCardConfig";

export const useRmeStore = defineStore("rme", () => {
  const soundCardConfig = ref(babyfaceProConf)
  const alsaControls = ref<AudioControls>({});
  const activeProfile = ref<null | AudioProfile>(null);
  const supportedProfiles = ref<string[]>([]);
  const inputs = ref<AlsaInput[]>(babyfaceProConf.inputs);
  const outputs = ref<AlsaOutput[]>(babyfaceProConf.outputs);

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
    console.error(newControls)
    alsaControls.value = newControls;
  };

  const getControlLimitsByName = (controlName: string) => {
    return alsaControls.value[controlName]?.limits
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
    soundCardConfig,
    supportedProfiles,
    getControlLimitsByName,
    setActiveProfile,
    setControls,
    setSupportedProfiles,
    updateControl,
  };
});
