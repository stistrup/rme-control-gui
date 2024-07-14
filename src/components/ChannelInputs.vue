<script setup lang="ts">
import { useRmeStore } from "../stores/rmeStore";
import Channel from "./Channel.vue";

const rmeStore = useRmeStore();
</script>

<template>
  <div :class="$style.channelInputs">
    <Channel
      v-for="channel in rmeStore.mixerChannels"
      :channel="channel"
      :key="channel.pipewirePortName"
    />
  </div>
</template>

<style module>
.channelInputs {
  display: flex;
}
</style>
