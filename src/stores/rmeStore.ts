import { defineStore } from "pinia";
import { ref } from "vue";
import { AudioControl, AudioControls } from "../types/alsaOutput.types";

export const useRmeStore = defineStore("rme", () => {
  const controls = ref<AudioControls>({});
  const headphoneVolume = ref(0);
  const monitorVolume = ref(0);
  const soundCardNumber = ref<number | null>(null);

  const isInitialized = ref<boolean | null>(null);

  const setSoundcardNumber = (cardNumber: number) => {
    soundCardNumber.value = cardNumber;
    isInitialized.value = true;
  };

  const setControls = (newControls: AudioControls) => {
    controls.value = newControls;
  };

  function updateControl(controlName: string, updatedControl: AudioControl) {
    if (controls.value[controlName]) {
      controls.value[controlName] = updatedControl;
    }
  }

  return {
    controls,
    isInitialized,
    monitorVolume,
    headphoneVolume,
    soundCardNumber,
    setSoundcardNumber,
    setControls,
    updateControl,
  };
});
