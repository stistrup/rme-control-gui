<script setup lang="ts">
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
</script>

<template>
  <div :class="$style.channelContainer">
    <Knob label="gain" :model-value="20" />
    <Fader label="volume" :model-value="0" />
  </div>
</template>

<style module>
.channelContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>
