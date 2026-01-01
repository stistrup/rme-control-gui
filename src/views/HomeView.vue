<script setup lang="ts">
import Mixer from "../components/Mixer.vue";
import AudioSettings from "../components/AudioSettings.vue";
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
        <Mixer />
      </div>
    </div>
    <p v-else-if="rmeStore.isInitialized === null">Getting sound card...</p>
    <p v-else-if="rmeStore.isInitialized === false">
      Could not initialize sound card
    </p>
    <div v-if="rmeStore.isInitialized" :class="$style.footer">
      <AudioSettings />
    </div>
  </div>
</template>

<style module>
.mainContainer {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header {
  width: 100%;
  text-align: center;
}

.controlsContainer {
  display: flex;
  margin: 0 auto;
}

.footer {
  width: 100%;
}
</style>
