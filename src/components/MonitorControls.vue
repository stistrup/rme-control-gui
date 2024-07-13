<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import Knob from "./Knob.vue";
import {
  getInitialStates,
  setHeadphonesVolume,
  setMonitorVolume,
} from "../utils/rmeUtils";
import { useRmeStore } from "../stores/rmeStore";

const rmeStore = useRmeStore();

const monitorVolume = ref(0);
const headphonesVolume = ref(0);

const handleMonitor = (volume: number) => {
  setMonitorVolume(volume);
};

const handleHeadphones = (volume: number) => {
  setHeadphonesVolume(volume);
};

onMounted(async () => {
  const initialStates = await getInitialStates();

  if (initialStates) {
    monitorVolume.value = initialStates.monitors_volume;
    headphonesVolume.value = initialStates.headphones_volume;
  }
});
</script>

<template>
  <Knob
    :label="'Monitor volume'"
    :model-value="monitorVolume"
    :min="0"
    :max="100"
    :size="200"
    @new-value="handleMonitor"
  />
  <Knob
    :label="'Headphones volume'"
    :model-value="headphonesVolume"
    :min="0"
    :max="100"
    :size="200"
    @new-value="handleHeadphones"
  />
</template>

<style module></style>
