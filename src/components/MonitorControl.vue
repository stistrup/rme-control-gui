<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Knob from "./Knob.vue";
import Fader from "./Fader.vue"
import { RmeService } from "../services/RmeService";
import { AlsaOutput, OutputType } from "../types/config.types";
import { useRmeStore } from "../stores/rmeStore";
import { alsaToDB } from "../utils/alsaValConversion";

interface MonitorControlProps {
  outputs: AlsaOutput[];
}

defineProps<MonitorControlProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore()

if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const monitorVolumeLeft = ref(0);
const monitorVolumeRight = ref(0);
const headphonesVolume = ref(0);

const setOutputVolume = (outputType: OutputType, volume: number) => {
  rmeService.setOutputVolume(outputType, volume);
};

onMounted(async () => {
  const monitor = await rmeService.getOutputVolume(OutputType.SPEAKERS);
  const hp = await rmeService.getOutputVolume(OutputType.HEADPHONES);

  if (!hp || !monitor) return;

  const hpAvarage = (hp.left + hp.right) / 2;

  monitorVolumeLeft.value = monitor.left
  monitorVolumeRight.value = monitor.right
  headphonesVolume.value = hpAvarage;

  console.log(monitorVolumeLeft.value, monitorVolumeRight.value)
});
</script>

<template>
  <!-- <Knob
    :label="'Monitor volume'"
    :value="monitorVolume"
    :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
    :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
    :size="200"
    @new-value="value => setOutputVolume(OutputType.SPEAKERS, value)"
  />
  <Knob
    :label="'Headphones volume'"
    :value="headphonesVolume"
    :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
    :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
    :size="200"
    @new-value="value => setOutputVolume(OutputType.HEADPHONES, value)"
  /> -->
  <Fader 
    label="Monitors" 
    :value="monitorVolumeLeft" 
    :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
    :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
    :stereo="true"
    :value-right="monitorVolumeRight"
  />
</template>

<style module></style>
