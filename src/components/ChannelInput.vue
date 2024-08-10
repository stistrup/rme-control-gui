<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
import { AlsaInput, InputType, OutputType } from "../types/config.types";
import { alsaToDB } from "../utils/alsaValConversion";
import { formatRoutingControlName } from "../utils/bbfproControlName";

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
const currentPadState = ref<boolean | null>(null);
const currentLineSens = ref<string | null>(null);

if (!rmeService) {
  throw new Error("Could not load RME service");
}

const getInputGain = async () => {
  if (channelIndex.value == null) return null
  let gain = await rmeService.getInputGain(props.inputChannel.switchNames.gain)

  if (gain && props.inputChannel.type === InputType.LINE) gain = gain / 2

  return gain ?? null
}

const setInputGain = async (newValue: number) => {
  if (props.inputChannel.type === InputType.LINE) newValue = newValue * 2
  rmeService.setInputGain(props.inputChannel.switchNames.gain, newValue)
}

const getOuputRoutingVolume = async (outputType: OutputType) => {
  
  const controlNames = formatRoutingControlName(
    props.inputChannel.controlName, 
    outputType, 
    rmeStore.soundCardConfig.outputs
  )
  if(!controlNames) return

  const levels = await rmeService.getAlsaVolumeStereo(
    controlNames.left,
    controlNames.right
  );
  if (!levels) return


  return {left: levels.left, right: levels.right};
}

const setOutputRoutingVolume = (outputType: OutputType, newValue: number) => {

  const controlNames = formatRoutingControlName(props.inputChannel.controlName, outputType,rmeStore.soundCardConfig.outputs)
  if(!controlNames) return

  rmeService.setAlsaVolumeStereo(controlNames.left, controlNames.right, newValue)
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

const setLineSens = async (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const value = target.value;

  console.log('VALUE!!', value)

  if (channelIndex.value == null) return
  if (!props.inputChannel.switchNames.lineSens) return;
  const result = await rmeService!.setLineSensitivity(channelIndex.value, value);
  if (result) {
    currentLineSens.value = value;
  }
};

const getLineSens = async () => {
  if (channelIndex.value == null) return null
  if (!props.inputChannel.switchNames.lineSens) return null;

  const newSens = await rmeService!.getLineSensitivity(channelIndex.value);

  return newSens ?? null;
};

const setPadState = async () => {
  if (channelIndex.value == null) return
  if (!props.inputChannel.switchNames.pad) return;
  const newState = !currentPadState.value;
  const result = await rmeService.setPadState(channelIndex.value, newState);

  if (result) {
    currentPadState.value = newState;
  }
};

const getPadState = async () => {
  if (channelIndex.value == null) return null
  if (!props.inputChannel.switchNames.pad) return null;

  const padState = await rmeService.getPadState(channelIndex.value);

  return padState ?? null;
};

onMounted(async () => {
  currentLineSens.value = await getLineSens();
  currentPhantomState.value = await getPhantomState();
  inputGain.value = await getInputGain();
  currentPadState.value = await getPadState();

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
        :value="(routingVolumeMain.left + routingVolumeMain.right) / 2"
        :min="volumeBoundries.min"
        :max="volumeBoundries.max"
        :step="1"
        @newValue="value => setOutputRoutingVolume(OutputType.SPEAKERS, value)"
      />
      <div :class="$style.inputControls">
        <div :class="$style.inputSwitchesContainer">
          <div :class="$style.buttonGroup">
            <button
              v-if="inputChannel.switchNames.phantom"
              :class="[$style.switchButton, $style.phantomButton, { [$style.active]: currentPhantomState }]"
              @click="setPhantomState"
            >
              48v
            </button>
            <button
              v-if="inputChannel.switchNames.pad"
              :class="[$style.switchButton, $style.padButton, { [$style.active]: currentPadState }]"
              @click="setPadState"
            >
              PAD
            </button>
          </div>
          <select
            v-if="inputChannel.type === InputType.LINE"
            :class="$style.lineSensSelect"
            :value="currentLineSens"
            @change="setLineSens"
          >
          <option :value="rmeStore.soundCardConfig.inputSwitchValues.lineSensLow">+4dBV</option>
          <option :value="rmeStore.soundCardConfig.inputSwitchValues.lineSensHigh">-10dBu</option>
          </select>
        </div>

        <Knob
          v-if="inputGain !== null && inputGainBoundries"
          :class="$style.gainComponent"
          label="Gain"
          :value="inputGain"
          :min="inputGainBoundries.min"
          :max="inputGainBoundries.max"
          :size="60"
          :step="inputChannel.type === InputType.LINE ? 0.5 : 1"
          @newValue="setInputGain"
        />
        <Knob
          v-if="volumeBoundries"
          :value="(routingVolumeHp.left + routingVolumeHp.right) / 2"
          :min="volumeBoundries.min"
          :max="volumeBoundries.max"
          :size="60"
          icon="headphones.png"
          @newValue="value => setOutputRoutingVolume(OutputType.HEADPHONES, value)"
        />
      </div>
    </div>
  </div>
</template>

<style module>
.channelContainer {
  --channel-border-color: rgb(190, 190, 190);
  --button-bg-color: #3a3a3a;
  --button-text-color: #aaaaaa;
  --button-active-color: #ff7676;
  --control-width: 80px;
  --border-radius: 4px;
  --delimiter-color: rgba(255, 255, 255, 0.2);

  border-right: 1px solid var(--channel-border-color);
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  &.firstChannel {
    border-left: 1px solid var(--channel-border-color);
  }
}

.controlsContainer {
  display: flex;
}

.inputControls {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
}

.inputSwitchesContainer {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;
  width: var(--control-width);
}

.buttonGroup {
  display: flex;
  width: 100%;
  position: relative;
}

.switchButton {
  flex: 1;
  padding: 8px 0;
  background-color: var(--button-bg-color);
  border: none;
  color: var(--button-text-color);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    color: var(--button-active-color);
    filter: brightness(1.2);
  }

  &:hover {
    filter: brightness(1.1);
  }
}

.phantomButton {
  border-top-left-radius: var(--border-radius);
  border-bottom-left-radius: var(--border-radius);
}

.padButton {
  border-top-right-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background-color: var(--delimiter-color);
  }
}

.lineSensSelect {
  width: 100%;
  padding: 8px 24px 8px 8px;
  background-color: var(--button-bg-color);
  border: none;
  border-radius: var(--border-radius);
  color: var(--button-text-color);
  font-size: 12px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%23aaaaaa' d='M0 2l4 4 4-4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 8px;
}

.gainComponent {
  margin-bottom: 20px;
}
</style>