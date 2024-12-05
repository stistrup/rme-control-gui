<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import Fader from "./Fader.vue";
import ChannelInputLabel from "./ChannelInputLabel.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
import { AlsaInput, InputType, OutputType } from "../types/config.types";
import { alsaToDB } from "../utils/alsaValConversion";
import { formatRoutingControlName } from "../utils/bbfproControlName";
import linkIcon from '../assets/images/link.png'

interface ChannelProps {
  leftInput: AlsaInput;
  rightInput?: AlsaInput;
}

const props = defineProps<ChannelProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();
const routingVolumeMain = ref({left: 0, right: 0});
const routingVolumeHp = ref({left: 0, right: 0});
const inputGain = ref<number | null>(null)

const volumeBoundries = ref<{min: number, max: number} | null>(null)
const inputGainBoundries = ref<{min: number, max: number} | null>(null)

const canBeStereoCoupled = ref(true);

const channelIndex = computed(() => {
  const index = rmeStore.inputs.findIndex(input => input.controlName === props.leftInput.controlName)
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
  let gain = await rmeService.getInputGain(props.leftInput.switchNames.gain)

  if (gain && props.leftInput.type === InputType.LINE) gain = gain / 2

  return gain ?? null
}

const setInputGain = async (newValue: number) => {
  if (props.leftInput.type === InputType.LINE) newValue = newValue * 2
  rmeService.setInputGain(props.leftInput.switchNames.gain, newValue)
}

const getOuputRoutingVolume = async (outputType: OutputType) => {
  
  const controlNames = formatRoutingControlName(
    props.leftInput.controlName, 
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

  const controlNames = formatRoutingControlName(props.leftInput.controlName, outputType,rmeStore.soundCardConfig.outputs)
  if(!controlNames) return

  rmeService.setAlsaVolumeStereo(controlNames.left, controlNames.right, newValue)
};


const setPhantomState = async () => {
  if (channelIndex.value == null) return
  if (!props.leftInput.switchNames.phantom) return;
  const newState = !currentPhantomState.value;
  const result = await rmeService!.setPhantomPower(channelIndex.value, newState);

  if (result) {
    currentPhantomState.value = newState;
  }
};

const getPhantomState = async () => {
  if (channelIndex.value == null) return null
  if (!props.leftInput.switchNames.phantom) return null;

  const phantomState = await rmeService!.getPhantomState(channelIndex.value);

  return phantomState ?? null;
};

const setLineSens = async (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const value = target.value;

  if (channelIndex.value == null) return
  if (!props.leftInput.switchNames.lineSens) return;
  const result = await rmeService!.setLineSensitivity(channelIndex.value, value);
  if (result) {
    currentLineSens.value = value;
  }
};

const getLineSens = async () => {
  if (channelIndex.value == null) return null
  if (!props.leftInput.switchNames.lineSens) return null;

  const newSens = await rmeService!.getLineSensitivity(channelIndex.value);

  return newSens ?? null;
};

const setPadState = async () => {
  if (channelIndex.value == null) return
  if (!props.leftInput.switchNames.pad) return;
  const newState = !currentPadState.value;
  const result = await rmeService.setPadState(channelIndex.value, newState);

  if (result) {
    currentPadState.value = newState;
  }
};

const getPadState = async () => {
  if (channelIndex.value == null) return null
  if (!props.leftInput.switchNames.pad) return null;

  const padState = await rmeService.getPadState(channelIndex.value);

  return padState ?? null;
};

const handleStereoCouple = (e: any) => {
  if (!canBeStereoCoupled.value) return
  rmeStore.addStereoMapping(props.leftInput.inputIndex)
  console.error(props.leftInput.displayName)
}

onMounted(async () => {
  currentLineSens.value = await getLineSens();
  currentPhantomState.value = await getPhantomState();
  inputGain.value = await getInputGain();
  currentPadState.value = await getPadState();

  let inputControls = rmeStore.getControlByName(props.leftInput.switchNames.gain)

  if (props.leftInput.type === InputType.LINE) inputControls.limits.max = inputControls.limits.max / 2

  const volBoundriesAlsa = rmeStore.getControlByName(`${props.leftInput.controlName}-AN1`) // FIXME: Takes analog input 1 as truth for all channels

  const volBoundriesDbMin = alsaToDB(volBoundriesAlsa.limits.min)
  const volBoundriesDbMax = alsaToDB(volBoundriesAlsa.limits.max)

  inputGainBoundries.value = inputControls.limits
  volumeBoundries.value = {min: volBoundriesDbMin, max: volBoundriesDbMax}

  const levelsMain = await getOuputRoutingVolume(OutputType.SPEAKERS);
  const levelsHp = await getOuputRoutingVolume(OutputType.HEADPHONES);

  if (levelsMain) routingVolumeMain.value = levelsMain
  if (levelsHp) routingVolumeHp.value = levelsHp

  console.log(props.leftInput.displayName, levelsMain, levelsHp)
  console.log('boundries', volumeBoundries.value)

});
</script>

<template>
  <div :class="[$style.channelContainer, { [$style.firstChannel]: channelIndex === 0 }]">
    <ChannelInputLabel :input="leftInput"/>
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
              v-if="leftInput.switchNames.phantom"
              :class="[$style.switchButton, $style.phantomButton, { [$style.active]: currentPhantomState }]"
              @click="setPhantomState"
            >
              48v
            </button>
            <button
              v-if="leftInput.switchNames.pad"
              :class="[$style.switchButton, $style.padButton, { [$style.active]: currentPadState }]"
              @click="setPadState"
            >
              PAD
            </button>
          </div>
          <select
            v-if="leftInput.type === InputType.LINE"
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
          :step="leftInput.type === InputType.LINE ? 0.5 : 1"
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
        <div :class="$style.stereoButtonContainer">
          <button 
            v-if="canBeStereoCoupled"
            :class="$style.stereoButton"
            @click="handleStereoCouple"
          >
          <img :class="$style.linkIcon" :src="linkIcon"/>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style module>

.channelContainer {
  --channel-border-color: rgb(190, 190, 190);
  --button-bg-color: #4d4d4d;
  --button-text-color: #ffffff;
  --button-active-color: #ff7676;
  --control-width: 75px;
  --border-radius: 3px;
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
  padding: 6px 0;
  background-color: var(--button-bg-color);
  height: 30px;
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
  padding-left: 8px;
  height: 30px;
  background-color: var(--button-bg-color);
  border: none;
  border-radius: var(--border-radius);
  color: var(--button-text-color);
  font-size: 11px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px auto;
}

.lineSensText{
  font-size: 2px;
}

.gainComponent {
  margin-bottom: 20px;
}

.stereoButtonContainer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.stereoButton {
  padding: 3px 6px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  background: none;
}

.stereoButton:hover {
  background-color: var(--button-bg-color);
  color: var(--button-text-color)
}

.linkIcon{
  height: 15px;
  filter:opacity(0.7);
}
</style>