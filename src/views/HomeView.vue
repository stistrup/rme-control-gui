<script setup lang="ts">
import ChannelInputs from "../components/ChannelInputs.vue";
import MonitorControls from "../components/MonitorControls.vue";
import AudioControls from "../components/AudioControls.vue";
import { useRmeStore } from "../stores/rmeStore";

const rmeStore = useRmeStore();
</script>

<template>
  <div :class="$style.mainContainer">
    <div :class="$style.header">
      <p :class="$style.appTitle">RME Babyface control</p>
    </div>
    <div v-if="rmeStore.isInitialized" :class="$style.controlsContainer">
      <div :class="$style.channelControls">
        <ChannelInputs />
      </div>
      <div :class="$style.mainControls">
        <MonitorControls />
      </div>
    </div>
    <AudioControls />
    <p v-if="rmeStore.isInitialized === null">Getting sound card...</p>
    <p v-if="rmeStore.isInitialized === false">
      Could not initialize sound card
    </p>
  </div>
</template>

<style module>
.mainContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.controlsContainer {
  display: flex;
}
</style>
