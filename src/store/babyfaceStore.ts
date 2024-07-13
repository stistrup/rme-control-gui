import { defineStore } from "pinia";
import { ref } from "vue";
import { RmeChannel } from "../types/rme.types";

export const useRmeStore = defineStore("rme", () => {
  const channels = ref<RmeChannel[]>([]);
  const headphoneVolume = ref(0);
  const monitorVolume = ref(0);
  const isInitialized = ref<boolean | null>(null);

  return { isInitialized, monitorVolume, headphoneVolume };
});
