<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { RmeOutput } from "../types/rmeService.types";

// const rmeStore = useRmeStore();
const rmePlugin = inject<RmeService>("RmeService");
if (!rmePlugin) {
  throw new Error("Could not inject RME service");
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
