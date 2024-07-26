<script setup lang="ts">
import { useRmeStore } from "../stores/rmeStore";
import Channel from "./Channel.vue";

const rmeStore = useRmeStore();
</script>

<template>
  <div :class="$style.mixer">
    <div :class="$style.channelInputs">
      <Channel
        v-for="channel in rmeStore.mixerChannels"
        :channel="channel"
        :key="channel.pipewirePortName"
      />
    </div>
    <div :class="$style.playback" v-if="rmeStore.playbackChannel">
      <Channel :channel="rmeStore.playbackChannel" />
    </div>
  </div>
</template>

<style module>
.mixer {
  display: flex;
}

.playback {
  margin-left: 30px;
}

.channelInputs {
  display: flex;
}
</style>
