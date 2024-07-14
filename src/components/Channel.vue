<script setup lang="ts">
import { inject, onMounted, ref, watch } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmePlugin } from "../plugins/RmePlugin";
import { RmeInput } from "../types/rmePlugin.types";
import { useRmeStore } from "../stores/rmeStore";

const MIC_INPUT_GAIN_RANGE = 78;

const rmePlugin = inject<RmePlugin>("RmePlugin");
const rmeStore = useRmeStore();
const gain = ref(0);

if (!rmePlugin) {
  throw new Error("Could not load rme plugin");
}

const handleGainInput = (newValue: number) => {
  const floatValue = newValue / MIC_INPUT_GAIN_RANGE;
  rmePlugin.setGain(RmeInput.MIC1, floatValue);
};

onMounted(async () => {
  if (rmeStore.activeProfile) {
    const initialGain = (await rmePlugin.getGain(RmeInput.MIC1)) as number;
    gain.value = initialGain * MIC_INPUT_GAIN_RANGE;
  } else {
    watch(
      () => rmeStore.activeProfile,
      async () => {
        const initialGain = (await rmePlugin.getGain(RmeInput.MIC1)) as number;
        console.log("yoooo", initialGain);
        gain.value = initialGain * MIC_INPUT_GAIN_RANGE;
      }
    );
  }
});
</script>

<template>
  <div :class="$style.channelContainer">
    <Knob
      label="gain"
      :model-value="gain"
      :min="0"
      :max="MIC_INPUT_GAIN_RANGE"
      :step="0.001"
      @newValue="handleGainInput"
    />
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
