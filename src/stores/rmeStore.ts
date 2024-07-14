import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";
import { profiles } from "../config/pipewireConfig";

export const useRmeStore = defineStore("rme", () => {
  const activeProfile = ref<null | string>(null);
  const alsaControls = ref<AudioControls>({});
  const headphoneVolume = ref(0);
  const monitorVolume = ref(0);
  const soundCardNumber = ref<number | null>(null);
  const supportedProfiles = ref<string[]>([]);

  const isInitialized = ref<boolean | null>(null);

  const isSupportedProfile = (profile: string) => {
    return supportedProfiles.value.some(
      (supportedProfile) => supportedProfile === profile
    );
  };

  const setActiveProfile = (profile: string) => {
    if (supportedProfiles.value.includes(profile)) {
      activeProfile.value = profile;
    } else {
      console.warn(`Profile "${profile}" is not supported`);
    }
  };

  const setSoundcardNumber = (cardNumber: number) => {
    soundCardNumber.value = cardNumber;
    isInitialized.value = true;
  };

  const setControls = (newControls: AudioControls) => {
    alsaControls.value = newControls;
  };

  const setSupportedProfiles = (profiles: string[]) => {
    supportedProfiles.value = profiles;
  };

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (alsaControls.value[controlName]) {
      alsaControls.value[controlName] = updatedControl;
    }
  }

  const profileProAudio = computed(() => {
    return supportedProfiles.value.find(
      (profile) => profile === profiles.proAudio
    );
  });

  const profileDefault = computed(() => {
    return supportedProfiles.value.find(
      (profile) => profile === profiles.default
    );
  });

  return {
    activeProfile,
    alsaControls,
    headphoneVolume,
    isInitialized,
    monitorVolume,
    profileDefault,
    profileProAudio,
    soundCardNumber,
    supportedProfiles,
    isSupportedProfile,
    setActiveProfile,
    setControls,
    setSoundcardNumber,
    setSupportedProfiles,
    updateControl,
  };
});
