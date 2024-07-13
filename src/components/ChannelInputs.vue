<script setup lang="ts">
import Channel from "./Channel.vue";
</script>

<template>
  <div :class="$style.channelInputs">
    <Channel />
  </div>
</template>

<style module>
.channelInputs {
  display: flex;
}
</style>
