<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import {
  applyExponentialCurve,
  removeExponentialCurve,
} from "../utils/logConvertion";
import { AlsaOutput, OutputType } from "../types/config.types";
import { useRmeStore } from "../stores/rmeStore";

interface MonitorControlProps {
  outputs: AlsaOutput[];
}

defineProps<MonitorControlProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore()

if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const monitorVolume = ref(0);
const headphonesVolume = ref(0);

const setOutputVolume = (outputType: OutputType, volume: number) => {
  // const monitorExpFloat = applyExponentialCurve(volume / 100);
  // const monitorExp = Math.floor(monitorExpFloat * 100);
  rmeService.setOutputVolume(outputType, volume);
};

onMounted(async () => {
  const monitor = await rmeService.getOutputVolume(OutputType.SPEAKERS);
  const hp = await rmeService.getOutputVolume(OutputType.HEADPHONES);

  if (!hp || !monitor) return;

  const monitorAvarage = (monitor.left + monitor.right) / 2;
  const hpAvarage = (hp.left + hp.right) / 2;

  // const monitorLinear = removeExponentialCurve(monitorAvarage / 100);
  // const hpLinear = removeExponentialCurve(hpAvarage / 100);
  monitorVolume.value = monitorAvarage
  headphonesVolume.value = hpAvarage;
});
</script>

<template>
  <Knob
    :label="'Monitor volume'"
    :value="monitorVolume"
    :min="rmeStore.soundCardConfig.inputRange.min"
    :max="rmeStore.soundCardConfig.inputRange.max"
    :size="200"
    @new-value="value => setOutputVolume(OutputType.SPEAKERS, value)"
  />
  <Knob
    :label="'Headphones volume'"
    :value="headphonesVolume"
    :min="rmeStore.soundCardConfig.inputRange.min"
    :max="rmeStore.soundCardConfig.inputRange.max"
    :size="200"
    @new-value="value => setOutputVolume(OutputType.HEADPHONES, value)"
  />
</template>

<style module></style>
