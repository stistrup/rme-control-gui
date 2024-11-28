<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref } from "vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
import { AlsaInput, InputType, OutputType } from "../types/config.types";
import { alsaToDB } from "../utils/alsaValConversion";
import { formatRoutingControlName } from "../utils/bbfproControlName";

interface StereoChannelProps {
  leftChannel: AlsaInput;
  rightChannel: AlsaInput;
}

const props = defineProps<StereoChannelProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();
const routingVolumeMain = ref({left: 0, right: 0});
const routingVolumeHp = ref({left: 0, right: 0});
const inputGain = ref<{left: number | null, right: number | null}>({left: null, right: null});

const volumeBoundries = ref<{min: number, max: number} | null>(null);
const inputGainBoundries = ref<{min: number, max: number} | null>(null);

const channelIndices = computed(() => ({
  left: rmeStore.inputs.findIndex(input => input.controlName === props.leftChannel.controlName),
  right: rmeStore.inputs.findIndex(input => input.controlName === props.rightChannel.controlName)
}));

const currentPhantomState = ref<{left: boolean | null, right: boolean | null}>({left: null, right: null});
const currentPadState = ref<{left: boolean | null, right: boolean | null}>({left: null, right: null});
const currentLineSens = ref<{left: string | null, right: string | null}>({left: null, right: null});

if (!rmeService) {
  throw new Error("Could not load RME service");
}

const isEditing = ref(false);
const editedDisplayName = ref(props.leftChannel.displayName);
const inputRef = ref<HTMLInputElement | null>(null);

const startEditing = () => {
  isEditing.value = true;
  editedDisplayName.value = props.leftChannel.displayName;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const saveDisplayName = async () => {
  if (!rmeService) return;
  
  try {
    // Update both channels to maintain stereo naming
    await Promise.all([
      rmeService.setInputChannelConfig(
        props.leftChannel.controlName,
        editedDisplayName.value + " L",
        true
      ),
      rmeService.setInputChannelConfig(
        props.rightChannel.controlName,
        editedDisplayName.value + " R",
        true
      )
    ]);
    
    // Update the store for both channels
    const leftIndex = rmeStore.inputs.findIndex(input => input.controlName === props.leftChannel.controlName);
    const rightIndex = rmeStore.inputs.findIndex(input => input.controlName === props.rightChannel.controlName);
    
    if (leftIndex !== -1) {
      rmeStore.inputs[leftIndex].displayName = editedDisplayName.value + " L";
    }
    if (rightIndex !== -1) {
      rmeStore.inputs[rightIndex].displayName = editedDisplayName.value + " R";
    }
    
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save display name:", error);
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  editedDisplayName.value = props.leftChannel.displayName;
};

const getInputGain = async () => {
  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return {left: null, right: null};
  
  const [leftGain, rightGain] = await Promise.all([
    rmeService.getInputGain(props.leftChannel.switchNames.gain),
    rmeService.getInputGain(props.rightChannel.switchNames.gain)
  ]);

  if (props.leftChannel.type === InputType.LINE) {
    return {
      left: leftGain ? leftGain / 2 : null,
      right: rightGain ? rightGain / 2 : null
    };
  }

  return {
    left: leftGain ?? null,
    right: rightGain ?? null
  };
};

const setInputGain = async (newValue: number) => {
  const gainValue = props.leftChannel.type === InputType.LINE ? newValue * 2 : newValue;
  await Promise.all([
    rmeService.setInputGain(props.leftChannel.switchNames.gain, gainValue),
    rmeService.setInputGain(props.rightChannel.switchNames.gain, gainValue)
  ]);
};

const getOuputRoutingVolume = async (outputType: OutputType) => {
  const leftControls = formatRoutingControlName(
    props.leftChannel.controlName, 
    outputType, 
    rmeStore.soundCardConfig.outputs
  );
  const rightControls = formatRoutingControlName(
    props.rightChannel.controlName, 
    outputType, 
    rmeStore.soundCardConfig.outputs
  );
  
  if (!leftControls || !rightControls) return;

  const levels = await rmeService.getAlsaVolumeStereo(
    leftControls.left,
    rightControls.left
  );
  
  return levels;
};

const setOutputRoutingVolume = (outputType: OutputType, newValue: number) => {
  const leftControls = formatRoutingControlName(
    props.leftChannel.controlName, 
    outputType,
    rmeStore.soundCardConfig.outputs
  );
  const rightControls = formatRoutingControlName(
    props.rightChannel.controlName, 
    outputType,
    rmeStore.soundCardConfig.outputs
  );
  
  if (!leftControls || !rightControls) return;

  Promise.all([
    rmeService.setAlsaVolumeStereo(leftControls.left, leftControls.right, newValue),
    rmeService.setAlsaVolumeStereo(rightControls.left, rightControls.right, newValue)
  ]);
};

// Synchronize phantom power for both channels
const setPhantomState = async () => {
  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return;
  if (!props.leftChannel.switchNames.phantom || !props.rightChannel.switchNames.phantom) return;
  
  const newState = !currentPhantomState.value.left;
  const results = await Promise.all([
    rmeService.setPhantomPower(channelIndices.value.left, newState),
    rmeService.setPhantomPower(channelIndices.value.right, newState)
  ]);

  if (results[0] && results[1]) {
    currentPhantomState.value = {left: newState, right: newState};
  }
};

const getPhantomState = async () => {
  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return {left: null, right: null};
  if (!props.leftChannel.switchNames.phantom || !props.rightChannel.switchNames.phantom) return {left: null, right: null};

  const [leftState, rightState] = await Promise.all([
    rmeService.getPhantomState(channelIndices.value.left),
    rmeService.getPhantomState(channelIndices.value.right)
  ]);

  return {left: leftState ?? null, right: rightState ?? null};
};

const setLineSens = async (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const value = target.value;

  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return;
  if (!props.leftChannel.switchNames.lineSens || !props.rightChannel.switchNames.lineSens) return;
  
  const results = await Promise.all([
    rmeService.setLineSensitivity(channelIndices.value.left, value),
    rmeService.setLineSensitivity(channelIndices.value.right, value)
  ]);

  if (results[0] && results[1]) {
    currentLineSens.value = {left: value, right: value};
  }
};

const getLineSens = async () => {
  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return {left: null, right: null};
  if (!props.leftChannel.switchNames.lineSens || !props.rightChannel.switchNames.lineSens) return {left: null, right: null};

  const [leftSens, rightSens] = await Promise.all([
    rmeService.getLineSensitivity(channelIndices.value.left),
    rmeService.getLineSensitivity(channelIndices.value.right)
  ]);

  return {left: leftSens ?? null, right: rightSens ?? null};
};

const setPadState = async () => {
  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return;
  if (!props.leftChannel.switchNames.pad || !props.rightChannel.switchNames.pad) return;
  
  const newState = !currentPadState.value.left;
  const results = await Promise.all([
    rmeService.setPadState(channelIndices.value.left, newState),
    rmeService.setPadState(channelIndices.value.right, newState)
  ]);

  if (results[0] && results[1]) {
    currentPadState.value = {left: newState, right: newState};
  }
};

const getPadState = async () => {
  if (channelIndices.value.left === -1 || channelIndices.value.right === -1) return {left: null, right: null};
  if (!props.leftChannel.switchNames.pad || !props.rightChannel.switchNames.pad) return {left: null, right: null};

  const [leftState, rightState] = await Promise.all([
    rmeService.getPadState(channelIndices.value.left),
    rmeService.getPadState(channelIndices.value.right)
  ]);

  return {left: leftState ?? null, right: rightState ?? null};
};

onMounted(async () => {
  const [lineSens, phantomState, padState, gains] = await Promise.all([
    getLineSens(),
    getPhantomState(),
    getPadState(),
    getInputGain()
  ]);

  currentLineSens.value = lineSens;
  currentPhantomState.value = phantomState;
  currentPadState.value = padState;
  inputGain.value = gains;

  let inputControls = rmeStore.getControlByName(props.leftChannel.switchNames.gain);

  if (props.leftChannel.type === InputType.LINE) {
    inputControls.limits.max = inputControls.limits.max / 2;
  }

  const volBoundriesAlsa = rmeStore.getControlByName(`${props.leftChannel.controlName}-AN1`);

  const volBoundriesDbMin = alsaToDB(volBoundriesAlsa.limits.min);
  const volBoundriesDbMax = alsaToDB(volBoundriesAlsa.limits.max);

  inputGainBoundries.value = inputControls.limits;
  volumeBoundries.value = {min: volBoundriesDbMin, max: volBoundriesDbMax};

  const [levelsMain, levelsHp] = await Promise.all([
    getOuputRoutingVolume(OutputType.SPEAKERS),
    getOuputRoutingVolume(OutputType.HEADPHONES)
  ]);

  if (levelsMain) routingVolumeMain.value = levelsMain;
  if (levelsHp) routingVolumeHp.value = levelsHp;
});
</script>

<template>
  <div :class="[$style.channelContainer, { [$style.firstChannel]: channelIndices.left === 0 }]">
    <div :class="$style.labelContainer">
      <p v-if="!isEditing" :class="$style.label" @click="startEditing">
        {{ editedDisplayName }}
      </p>
      <input
        v-else
        ref="inputRef"
        v-model="editedDisplayName"
        :class="$style.labelInput"
        @keyup.enter="saveDisplayName"
        @keyup.esc="cancelEditing"
        @blur="saveDisplayName"
      />
    </div>
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
              v-if="leftChannel.switchNames.phantom"
              :class="[$style.switchButton, $style.phantomButton, { [$style.active]: currentPhantomState.left }]"
              @click="setPhantomState"
            >
              48v
            </button>
            <button
              v-if="leftChannel.switchNames.pad"
              :class="[$style.switchButton, $style.padButton, { [$style.active]: currentPadState.left }]"
              @click="setPadState"
            >
              PAD
            </button>
          </div>
          <select
            v-if="leftChannel.type === InputType.LINE"
            :class="$style.lineSensSelect"
            :value="currentLineSens.left"
            @change="setLineSens"
          >
            <option :value="rmeStore.soundCardConfig.inputSwitchValues.lineSensLow">+4dBV</option>
            <option :value="rmeStore.soundCardConfig.inputSwitchValues.lineSensHigh">-10dBu</option>
          </select>
        </div>

        <Knob
          v-if="inputGain.left !== null && inputGainBoundries"
          :class="$style.gainComponent"
          label="Gain"
          :value="inputGain.left"
          :min="inputGainBoundries.min"
          :max="inputGainBoundries.max"
          :size="60"
          :step="leftChannel.type === InputType.LINE ? 0.5 : 1"
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

.labelContainer {
  width: 100%;
  text-align: center;
}

.label {
  cursor: pointer;
}

.labelInput {
  width: 134px;
  text-align: center;
  font-family: inherit;
  font-weight: inherit;
  font-size: inherit;
  padding: 2px;
  margin: 13px 0;
  border: 1px solid var(--channel-border-color);
  border-radius: 3px;
}
</style>