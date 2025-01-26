<script setup lang="ts">
import { useRmeStore } from "../stores/rmeStore";
import ChannelInput from "./ChannelInput.vue";
import MonitorControl from "./MonitorControl.vue";
import PlaybackControl from "./PlaybackControl.vue";

const rmeStore = useRmeStore();
</script>

<template>
  <div :class="$style.mixer">
    <div :class="$style.channelInputs">
      <template v-for="channel in rmeStore.visibleChannels" :key="channel.controlName">
        <ChannelInput
          :leftInput="channel"
          :rightInput="rmeStore.getRightChannelFromStereo(channel.controlName)"
        />
      </template>
    </div>
    <div :class="$style.playback">
      <PlaybackControl :playbackChannel="rmeStore.playback"/>
    </div>
    <div :class="$style.channelOutputs">
      <MonitorControl
        :outputs="rmeStore.outputs"
      />
    </div>
  </div>
</template>

<style module>
.mixer {
  display: flex;
}

.channelOutputs {
  margin-left: 30px;
}

.channelInputs {
  display: flex;
}
</style>
