<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, watchEffect } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmePlugin } from "../plugins/RmePlugin";
import { InputType, RmeInput } from "../types/rmePlugin.types";
import { useRmeStore } from "../stores/rmeStore";
import { MixerChannel } from "../types/rmeStore.types";
import { alsaConfig } from "../config/alsaConfig";

interface ChannelProps {
  channel: MixerChannel;
}

const props = defineProps<ChannelProps>();

const INPUT_GAIN_RANGE = props.channel.inputType === InputType.MIC ? 78 : 20;

const hasPhantomSupport = computed(() => {
  const alsaEntry = alsaConfig.inputs.find(
    (entry) => entry.input === props.channel.input
  );

  if (alsaEntry?.controls.phantom) return true;
  return false;
});
const phantomOn = ref(false);

const rmePlugin = inject<RmePlugin>("RmePlugin");
const rmeStore = useRmeStore();
const gain = ref(0);

if (!rmePlugin) {
  throw new Error("Could not load rme plugin");
}

const handleGainInput = (newValue: number) => {
  const floatValue = newValue / INPUT_GAIN_RANGE;
  rmePlugin.setGain(props.channel.pipewirePortName, floatValue);
};

watchEffect(() => {
  console.log(props.channel.name, "gain value:", gain.value);
});

const getGain = async () => {
  if (rmeStore.activeProfile !== rmeStore.profileProAudio) return;
  const initialGainFloat = (await rmePlugin.getGain(
    props.channel.pipewirePortName
  )) as number;
  gain.value = initialGainFloat * INPUT_GAIN_RANGE;
};

const handlePhantom = async () => {
  if (props.channel.inputType !== InputType.MIC) return;
  const newState = !phantomOn.value;
  const result = await rmePlugin.setPhantomPower(props.channel, newState);
  if (result) {
    phantomOn.value = newState;
  }
};

const getPhantom = async () => {
  if (props.channel.inputType === InputType.MIC) {
    const phantomState = await rmePlugin.getPhantomState(props.channel);
    if (phantomState) {
      phantomOn.value = phantomState;
    }
  }
};

onMounted(async () => {
  getPhantom();
  getGain();
  watch(
    () => rmeStore.activeProfile,
    async () => {
      getGain();
    }
  );
});
</script>

<template>
  <div :class="$style.channelContainer">
    <Knob
      label="gain"
      :model-value="gain"
      :min="0"
      :max="INPUT_GAIN_RANGE"
      :step="1"
      @newValue="handleGainInput"
    />
    <Fader label="volume" :model-value="0" />
    <button
      v-if="hasPhantomSupport"
      :class="[$style.phantomButton, { [$style.phantomActive]: phantomOn }]"
      @click="handlePhantom"
    >
      48v
    </button>
  </div>
</template>

<style module>
.channelContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.phantomButton {
  background-color: #3a3a3a;
  border: unset;
  border-radius: 4px;
  color: #aaaaaa;

  &.phantomActive {
    color: #ff7676;
  }
}
</style>
