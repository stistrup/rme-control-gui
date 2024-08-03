<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Fader from "./Fader.vue"
import { RmeService } from "../services/RmeService";
import { AlsaPlayback, OutputType } from "../types/config.types";
import { useRmeStore } from "../stores/rmeStore";
import { alsaToDB } from "../utils/alsaValConversion";

interface MonitorControlProps {
  playbackChannel: AlsaPlayback;
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
  <div :class="$style.playbackControl">
    <p :class="$style.label">{{ playbackChannel.displayName }}</p>
    <Fader 
      :value="monitorVolumeLeft" 
      :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
      :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
      :stereo="true"
      :value-right="monitorVolumeRight"
    />
  </div>
</template>

<style module>
.playbackControl{
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 30px;
  --channel-border-color: rgb(190, 190, 190);
  border-right: 1px solid var(--channel-border-color);
}
</style>
