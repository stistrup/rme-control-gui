import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";

export const useRmeStore = defineStore("rme", () => {
  const alsaControls = ref<AudioControls>({});
  const headphoneVolume = ref(0);
  const monitorVolume = ref(0);
  const soundCardNumber = ref<number | null>(null);
  const supportedProfiles = ref<string[]>([]);
  const preferedProfiles = ref<string[]>([]);

  const isInitialized = ref<boolean | null>(null);

  const setSoundcardNumber = (cardNumber: number) => {
    soundCardNumber.value = cardNumber;
    isInitialized.value = true;
  };

  const setControls = (newControls: AudioControls) => {
    alsaControls.value = newControls;
  };

  const setPreferedProfiles = (profiles: string[]) => {
    preferedProfiles.value = profiles;
  };

  const setSupportedProfiles = (profiles: string[]) => {
    supportedProfiles.value = profiles;
  };

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (alsaControls.value[controlName]) {
      alsaControls.value[controlName] = updatedControl;
    }
  }

  const availableProfiles = computed(() => {
    return preferedProfiles.value.filter((profile) =>
      supportedProfiles.value.includes(profile)
    );
  });

  return {
    availableProfiles,
    alsaControls,
    isInitialized,
    monitorVolume,
    headphoneVolume,
    soundCardNumber,
    supportedProfiles,
    setSoundcardNumber,
    setPreferedProfiles,
    setSupportedProfiles,
    setControls,
    updateControl,
  };
});
