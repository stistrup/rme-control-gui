<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
import {
  applyExponentialCurve,
  removeExponentialCurve,
} from "../utils/logConvertion";
import { AlsaInput, OutputType } from "../types/config.types";

interface ChannelProps {
  inputChannel: AlsaInput;
}

const props = defineProps<ChannelProps>();

const VISUAL_RANGE_MULTIPLIER = 100;

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();
const routingVolumeMain = ref({left: 0, right: 0});
const routingVolumeHp = ref({left: 0, right: 0});
const gain = ref<number | null>(null)
const gainBoundries = ref<{min: number, max: number} | null>(null)

const channelIndex = computed(() => {
  const index = rmeStore.inputs.findIndex(input => input.controlName === props.inputChannel.controlName)
  return index === -1 ? null : index
})

const currentPhantomState = ref<boolean | null>(null);
const currentLineSens = ref<string | null>(null);

if (!rmeService) {
  throw new Error("Could not load RME service");
}

const setGain = async (newValue: number) => {
  console.log('Set gain placeholder:', newValue)
}

const getOuputRoutingVolume = async (outputType: OutputType) => {
  if (!channelIndex.value) return null
  try {
    const levels = await rmeService.getOutputRoutingVolume(
      channelIndex.value,
      outputType
    );

    if (levels) {
      const left = removeExponentialCurve(levels.left);
      const right = removeExponentialCurve(levels.left);
      return {left, right};
    }
    return null
  } catch (error) {
    console.error("Failed to get main send level:", error);
    return null
  }
}

const setOutputRoutingVolume = (outputType: OutputType, newValue: number) => {
  if (!channelIndex.value) return
  const floatValue = newValue / VISUAL_RANGE_MULTIPLIER;
  const floatValueExp = applyExponentialCurve(floatValue);

  const outputIndex = rmeStore.soundCardConfig.outputs.findIndex(output => output.type === outputType)

  if (outputIndex !== -1) {
    rmeService
      .setOutputRoutingVolume( channelIndex.value, outputIndex, floatValueExp)
      .catch((error) => console.error("Failed to set main send level:", error));
  }
};


const setPhantomState = async () => {
  if (!channelIndex.value) return
  if (!props.inputChannel.switcheNames.phantom) return;
  const newState = !currentPhantomState.value;
  const result = await rmeService!.setPhantomPower(channelIndex.value, newState);

  if (result) {
    currentPhantomState.value = newState;
  }
};

const getPhantomState = async () => {
  if (!channelIndex.value) return null
  if (!props.inputChannel.switcheNames.phantom) return null;

  const phantomState = await rmeService!.getPhantomState(channelIndex.value);

  return phantomState ?? null;
};

const setLineSens = async (newSens: string) => {
  if (!channelIndex.value) return
  if (!props.inputChannel.switcheNames.lineSens) return;
  const result = await rmeService!.setLineSensitivity(channelIndex.value, newSens);
  if (result) {
    return newSens ?? null;
  }
};

const getLineSens = async () => {
  if (!channelIndex.value) return null
  if (!props.inputChannel.switcheNames.lineSens) return null;

  const newSens = await rmeService!.getLineSensitivity(channelIndex.value);

  return newSens ?? null;
};

onMounted(async () => {
  currentLineSens.value = await getLineSens();
  currentPhantomState.value = await getPhantomState();

  const levelsMain = await getOuputRoutingVolume(OutputType.SPEAKERS);
  const levelsHp = await getOuputRoutingVolume(OutputType.HEADPHONES);

  if (levelsMain) routingVolumeMain.value = levelsMain
  if (levelsHp) routingVolumeHp.value = levelsHp

});
</script>

<template>
  <div :class="$style.channelContainer">
    <p :class="$style.label">{{ inputChannel.displayName }}</p>
    <Knob
      v-if="gain && gainBoundries"
      label="Gain"
      :value="gain"
      :min="gainBoundries.min"
      :max="gainBoundries.max"
      @newValue="setGain"
    />
    <Knob
      label="HP volume"
      :value="(routingVolumeHp.left + routingVolumeHp.right) / 2"
      :min="0"
      :max="VISUAL_RANGE_MULTIPLIER"
      :step="1"
      @newValue="value => setOutputRoutingVolume(OutputType.HEADPHONES, value)"
    />
    <Fader
      label="Main volume"
      :value="(routingVolumeMain.left + routingVolumeMain.right) / 2"
      :min="0"
      :max="VISUAL_RANGE_MULTIPLIER"
      :step="1"
      @newValue="value => setOutputRoutingVolume(OutputType.SPEAKERS, value)"
    />
    <button
      v-if="inputChannel.switcheNames.phantom"
      :class="[$style.phantomButton, { [$style.phantomActive]: currentPhantomState }]"
      @click="setPhantomState"
    >
      48v
    </button>
    <!-- This down here isn't pretty -->
    <div v-if="currentLineSens" :class="$style.lineSensContainer">
      <button
        :class="[
          $style.lineSens,
          { [$style.lineSensActive]: currentLineSens === rmeStore.soundCardConfig.inputControlValues.lineSensHigh },
        ]"
        @click="setLineSens(rmeStore.soundCardConfig.inputControlValues.lineSensHigh)"
      >
        {{ rmeStore.soundCardConfig.inputControlValues.lineSensHigh }}
      </button>
      <button
        :class="[
          $style.lineSens,
          { [$style.lineSensActive]: currentLineSens === rmeStore.soundCardConfig.inputControlValues.lineSensHigh },
        ]"
        @click="setLineSens(rmeStore.soundCardConfig.inputControlValues.lineSensLow)"
      >
        {{ rmeStore.soundCardConfig.inputControlValues.lineSensLow }}
      </button>
    </div>
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
  filter: opacity(0.6);

  &.phantomActive {
    color: #ff7676;
    filter: unset;
  }
}

.lineSensContainer {
  display: flex;
  flex-direction: column;
  .lineSens {
    background-color: #3a3a3a;
    border: unset;
    border-radius: 4px;
    color: #aaaaaa;
    filter: opacity(0.6);

    &.lineSensActive {
      color: #f5f5f5;
      filter: unset;
    }
  }
}
</style>
