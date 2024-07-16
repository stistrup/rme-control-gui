<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { RmeOutput } from "../types/rmeService.types";

const rmeService = inject<RmeService>("RmeService");
if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const monitorVolume = ref(0);
const headphonesVolume = ref(0);

const handleMonitor = (volume: number) => {
  rmeService.setMonitorVolume(RmeOutput.MONITORS, volume);
};

const handleHeadphones = (volume: number) => {
  rmeService.setMonitorVolume(RmeOutput.HEADPHONES, volume);
};

onMounted(async () => {
  const monitor = await rmeService.getOutputVolume(RmeOutput.MONITORS);
  const hp = await rmeService.getOutputVolume(RmeOutput.HEADPHONES);

  if (!hp || !monitor) return;

  const monitorAvarage = (monitor.left + monitor.right) / 2;
  const hpAvarage = (hp.left + hp.right) / 2;

  console.log(monitorAvarage);
  console.log(hpAvarage);

  monitorVolume.value = monitorAvarage;
  headphonesVolume.value = hpAvarage;
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
