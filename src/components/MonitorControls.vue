<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { RmeOutput } from "../types/rmeService.types";
import {
  applyExponentialCurve,
  removeExponentialCurve,
} from "../utils/logConvertion";

const rmeService = inject<RmeService>("RmeService");
if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const monitorVolume = ref(0);
const headphonesVolume = ref(0);

const handleMonitor = (volume: number) => {
  const monitorExpFloat = applyExponentialCurve(volume / 100);
  const monitorExp = Math.floor(monitorExpFloat * 100);
  rmeService.setMonitorVolume(RmeOutput.MONITORS, monitorExp);
};

const handleHeadphones = (volume: number) => {
  const hpLinearFloat = applyExponentialCurve(volume / 100);
  const hpLinear = Math.floor(hpLinearFloat * 100);
  rmeService.setMonitorVolume(RmeOutput.HEADPHONES, hpLinear);
};

onMounted(async () => {
  const monitor = await rmeService.getOutputVolume(RmeOutput.MONITORS);
  const hp = await rmeService.getOutputVolume(RmeOutput.HEADPHONES);

  if (!hp || !monitor) return;

  const monitorAvarage = (monitor.left + monitor.right) / 2;
  const hpAvarage = (hp.left + hp.right) / 2;

  const monitorLinear = removeExponentialCurve(monitorAvarage / 100);
  const hpLinear = removeExponentialCurve(hpAvarage / 100);
  monitorVolume.value = monitorLinear * 100;
  headphonesVolume.value = hpLinear * 100;
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
