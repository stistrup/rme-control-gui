<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
// import {
//   applyExponentialCurve,
//   removeExponentialCurve,
// } from "../utils/logConvertion";
import { AlsaInput, InputType, OutputType } from "../types/config.types";
import { alsaToDB } from "../utils/alsaValConversion";

interface ChannelProps {
  inputChannel: AlsaInput;
}

const props = defineProps<ChannelProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();
const routingVolumeMain = ref({left: 0, right: 0});
const routingVolumeHp = ref({left: 0, right: 0});
const inputGain = ref<number | null>(null)

const volumeBoundries = ref<{min: number, max: number} | null>(null)
const inputGainBoundries = ref<{min: number, max: number} | null>(null)

const channelIndex = computed(() => {
  const index = rmeStore.inputs.findIndex(input => input.controlName === props.inputChannel.controlName)
  return index === -1 ? null : index
})

const currentPhantomState = ref<boolean | null>(null);
const currentLineSens = ref<string | null>(null);

if (!rmeService) {
  throw new Error("Could not load RME service");
}

const getInputGain = async () => {
  if (channelIndex.value == null) return null
  let gain = await rmeService.getInputGain(channelIndex.value)

  if (gain && props.inputChannel.type === InputType.LINE) gain = gain / 2

  return gain ?? null
}

const setInputGain = async (newValue: number) => {
  if (props.inputChannel.type === InputType.LINE) newValue = newValue * 2
  console.log('Set gain placeholder:', newValue)
}

const getOuputRoutingVolume = async (outputType: OutputType) => {
  if (channelIndex.value == null) return null
  try {
    const levels = await rmeService.getOutputRoutingVolume(
      channelIndex.value,
      outputType
    );

    if (levels) {
      // const left = removeExponentialCurve(levels.left);
      // const right = removeExponentialCurve(levels.left);
      return {left: levels.left, right: levels.right};
    }
    return null
  } catch (error) {
    console.error("Failed to get main send level:", error);
    return null
  }
}

const setOutputRoutingVolume = (outputType: OutputType, newValue: number) => {
  if (channelIndex.value == null) return
  // const floatValue = newValue / VISUAL_RANGE_MULTIPLIER;
  // const floatValueExp = applyExponentialCurve(floatValue);

  const outputIndex = rmeStore.soundCardConfig.outputs.findIndex(output => output.type === outputType)

  if (outputIndex !== -1) {
    rmeService
      .setOutputRoutingVolume(channelIndex.value, outputIndex, newValue)
      .catch((error) => console.error("Failed to set main send level:", error));
  }
};


const setPhantomState = async () => {
  if (channelIndex.value == null) return
  if (!props.inputChannel.switchNames.phantom) return;
  const newState = !currentPhantomState.value;
  const result = await rmeService!.setPhantomPower(channelIndex.value, newState);

  if (result) {
    currentPhantomState.value = newState;
  }
};

const getPhantomState = async () => {
  if (channelIndex.value == null) return null
  if (!props.inputChannel.switchNames.phantom) return null;

  const phantomState = await rmeService!.getPhantomState(channelIndex.value);

  return phantomState ?? null;
};

const setLineSens = async (newSens: string) => {
  if (channelIndex.value == null) return
  if (!props.inputChannel.switchNames.lineSens) return;
  const result = await rmeService!.setLineSensitivity(channelIndex.value, newSens);
  if (result) {
    currentLineSens.value = newSens
  }
};

const getLineSens = async () => {
  if (channelIndex.value == null) return null
  if (!props.inputChannel.switchNames.lineSens) return null;

  const newSens = await rmeService!.getLineSensitivity(channelIndex.value);

  return newSens ?? null;
};

onMounted(async () => {
  currentLineSens.value = await getLineSens();
  currentPhantomState.value = await getPhantomState();
  inputGain.value = await getInputGain();

  let inputControls = rmeStore.getControlByName(props.inputChannel.switchNames.gain)

  if (props.inputChannel.type === InputType.LINE) inputControls.limits.max = inputControls.limits.max / 2

  const volBoundriesAlsa = rmeStore.getControlByName(`${props.inputChannel.controlName}-AN1`) // FIXME:

  const volBoundriesDbMin = alsaToDB(volBoundriesAlsa.limits.min)
  const volBoundriesDbMax = alsaToDB(volBoundriesAlsa.limits.max)



  inputGainBoundries.value = inputControls.limits
  volumeBoundries.value = {min: volBoundriesDbMin, max: volBoundriesDbMax}

  const levelsMain = await getOuputRoutingVolume(OutputType.SPEAKERS);
  const levelsHp = await getOuputRoutingVolume(OutputType.HEADPHONES);

  if (levelsMain) routingVolumeMain.value = levelsMain
  if (levelsHp) routingVolumeHp.value = levelsHp

  console.log(props.inputChannel.displayName, levelsMain, levelsHp)
  console.log('boundries', volumeBoundries.value)

});
</script>

<template>
  <div :class="[$style.channelContainer, { [$style.firstChannel]: channelIndex === 0 }]">
    <p :class="$style.label">{{ inputChannel.displayName }}</p>
    <div :class="$style.controlsContainer">
      <Fader
        v-if="volumeBoundries"
        label="Speakers"
        :value="(routingVolumeMain.left + routingVolumeMain.right) / 2"
        :min="volumeBoundries.min"
        :max="volumeBoundries.max"
        :step="1"
        @newValue="value => setOutputRoutingVolume(OutputType.SPEAKERS, value)"
      />
      <div :class="$style.inputControls">
  
        <Knob
          v-if="inputGain !== null && inputGainBoundries"
          label="Gain"
          :value="inputGain"
          :min="inputGainBoundries.min"
          :max="inputGainBoundries.max"
          :step="inputChannel.type === InputType.LINE ? 0.5 : 1"
          @newValue="setInputGain"
        />
        <Knob
          v-if="volumeBoundries"
          label="Headphones"
          :value="(routingVolumeHp.left + routingVolumeHp.right) / 2"
          :min="volumeBoundries.min"
          :max="volumeBoundries.max"
          @newValue="value => setOutputRoutingVolume(OutputType.HEADPHONES, value)"
        />
        <button
          v-if="inputChannel.switchNames.phantom"
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
              { [$style.lineSensActive]: currentLineSens === rmeStore.soundCardConfig.inputSwitchValues.lineSensHigh },
            ]"
            @click="setLineSens(rmeStore.soundCardConfig.inputSwitchValues.lineSensHigh)"
          >
            {{ rmeStore.soundCardConfig.inputSwitchValues.lineSensHigh }}
          </button>
          <button
            :class="[
              $style.lineSens,
              { [$style.lineSensActive]: currentLineSens === rmeStore.soundCardConfig.inputSwitchValues.lineSensLow },
            ]"
            @click="setLineSens(rmeStore.soundCardConfig.inputSwitchValues.lineSensLow)"
          >
            {{ rmeStore.soundCardConfig.inputSwitchValues.lineSensLow }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style module>
.channelContainer {
  --channel-border-color: rgb(190, 190, 190);

  border-right: 1px solid var(--channel-border-color);
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  &.firstChannel{
    border-left: 1px solid var(--channel-border-color);
  }
}

.controlsContainer{
  display: flex;
}

.inputControls{
  display: flex;
  flex-direction: column;
}

.phantomButton {
  margin: 20px auto;
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
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;

  .lineSens {
    background-color: #3a3a3a;
    border: unset;
    border-radius: 4px;
    width: 60px;
    color: #aaaaaa;
    filter: opacity(0.6);

    &.lineSensActive {
      color: #f5f5f5;
      filter: unset;
    }
  }
}

button {
  cursor: pointer;
}
</style>
