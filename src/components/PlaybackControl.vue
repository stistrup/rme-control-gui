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
const controlLeft = rmeStore.soundCardConfig.playback.controlNameLeft
const controlRight = rmeStore.soundCardConfig.playback.controlNameRight

if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const playbackVolume = ref(0);

const setPlaybackVolume = (volume: number) => {
  rmeService.setAlsaVolumeStereo(controlLeft, controlRight, volume);
};

onMounted(async () => {
  const playback = await rmeService.getAlsaVolumeStereo(controlLeft, controlRight);

  if (!playback) return;

  const playBackAvarage = (playback.left + playback.right) / 2;

  playbackVolume.value = playBackAvarage
});
</script>

<template>
  <div :class="$style.playbackControl">
    <p :class="$style.label">{{ playbackChannel.displayName }}</p>
    <Fader 
      :value="playbackVolume" 
      :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
      :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
      @new-value="setPlaybackVolume"
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
