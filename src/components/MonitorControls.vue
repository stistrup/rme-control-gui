<script setup lang="ts">
import { inject, onMounted, ref, watchEffect } from "vue";
import Knob from "./Knob.vue";
// import {
//   getInitialStates,
//   setHeadphonesVolume,
//   setMonitorVolume,
// } from "../utils/rmeUtils";
import { useRmeStore } from "../stores/rmeStore";
import { RmePlugin } from "../plugins/RmePlugin";
import { RmeOutput } from "../types/rmePlugin.types";

// const rmeStore = useRmeStore();
const rmePlugin = inject<RmePlugin>("RmePlugin");
if (!rmePlugin) {
  throw new Error("Could not inject RME plugin");
}

const monitorVolume = ref(0);
const headphonesVolume = ref(0);

const handleMonitor = (volume: number) => {
  rmePlugin.setMonitorVolume(RmeOutput.MONITORS, volume);
};

const handleHeadphones = (volume: number) => {
  rmePlugin.setMonitorVolume(RmeOutput.HEADPHONES, volume);
};

onMounted(async () => {
  const initialStates = await rmePlugin.getInitialStates();

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
