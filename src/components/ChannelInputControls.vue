<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import ChannelInputSwitches from './ChannelInputSwitches.vue';
import Knob from './Knob.vue';
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
import { AlsaInput, InputType, OutputType } from "../types/config.types";

const props = defineProps<{
  input: AlsaInput;
}>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

const inputGain = ref<number | null>(null);
const inputGainBoundaries = ref<{min: number, max: number} | null>(null);
const currentPhantomState = ref<boolean | null>(null);
const currentPadState = ref<boolean | null>(null);
const currentLineSens = ref<string | null>(null);

const channelIndex = computed(() => {
  const index = rmeStore.inputs.findIndex(input => input.controlName === props.input.controlName)
  return index === -1 ? null : index
});

const getInputGain = async () => {
  if (channelIndex.value == null || !props.input.switchNames.gain) return null
  let gain = await rmeService?.getInputGain(props.input.switchNames.gain)

  if (gain && props.input.type === InputType.LINE) gain = gain / 2

  return gain ?? null
}

const setInputGain = async (newValue: number) => {
  if (props.input.type === InputType.LINE) newValue = newValue * 2
  if (!props.input.switchNames.gain) return
  rmeService?.setInputGain(props.input.switchNames.gain, newValue)
}

  // FIXME:
  // This is the dumbest fix. When setting gain. Somehow headphones volume also gets set to around -10 db.
  // (Regardless if gain is set directly in alsamixer or through gui. Issue persist outside this app)
  // On top of that, if i instantly just set the headphones to what it was just before, it doesn't always stick.
  // But setting it first to 1 db under it's actual value, followed by the actual value it works..
  // However, very notisable "stuttering" in the headphones
const resetHeadphones = () => {
  const hpOutput = rmeStore.outputs.find(out => out.type === OutputType.HEADPHONES)
  if (!hpOutput) return
  const hpVolume = rmeStore.mainVolumes[hpOutput.controlNameLeft]
  if (!hpVolume) return
  const dumbestFixEver = hpVolume.left - 1
  rmeService?.setAlsaVolumeStereo(hpOutput.controlNameLeft, hpOutput.controlNameRight, dumbestFixEver)
  rmeService?.setAlsaVolumeStereo(hpOutput.controlNameLeft, hpOutput.controlNameRight, hpVolume.left)
}

const setPhantomState = async () => {
  if (channelIndex.value == null) return
  if (!props.input.switchNames.phantom) return;
  const newState = !currentPhantomState.value;
  const result = await rmeService?.setPhantomPower(channelIndex.value, newState);

  if (result) {
    currentPhantomState.value = newState;
  }
};

const getPhantomState = async () => {
  if (channelIndex.value == null) return null
  if (!props.input.switchNames.phantom) return null;

  const phantomState = await rmeService?.getPhantomState(channelIndex.value);
  return phantomState ?? null;
};

const setLineSens = async (value: string) => {
//   const target = e.target as HTMLSelectElement;
//   const value = target.value;

  if (channelIndex.value == null) return
  if (!props.input.switchNames.lineSens) return;
  const result = await rmeService?.setLineSensitivity(channelIndex.value, value);
  if (result) {
    currentLineSens.value = value;
  }
};

const getLineSens = async () => {
  if (channelIndex.value == null) return null
  if (!props.input.switchNames.lineSens) return null;

  const newSens = await rmeService?.getLineSensitivity(channelIndex.value);
  return newSens ?? null;
};

const setPadState = async () => {
  if (channelIndex.value == null) return
  if (!props.input.switchNames.pad) return;
  const newState = !currentPadState.value;
  const result = await rmeService?.setPadState(channelIndex.value, newState);

  if (result) {
    currentPadState.value = newState;
  }
};

const getPadState = async () => {
  if (channelIndex.value == null) return null
  if (!props.input.switchNames.pad) return null;

  const padState = await rmeService?.getPadState(channelIndex.value);
  return padState ?? null;
};

onMounted(async () => {
  currentLineSens.value = await getLineSens();
  currentPhantomState.value = await getPhantomState();
  currentPadState.value = await getPadState();
  
  if (rmeStore.isCompatabilityMode) return

  inputGain.value = await getInputGain();

  if (!props.input.switchNames.gain){
    console.error("Gain switch name undefined despite not being in compatability mode")
    return
  }

  let inputControlsGain = rmeStore.getControlByName(props.input.switchNames.gain)
  if (props.input.type === InputType.LINE) {
    inputControlsGain.limits.max = inputControlsGain.limits.max / 2
  }
  inputGainBoundaries.value = inputControlsGain.limits;
});
</script>

<template>
  <div :class="$style.inputControls">
    <ChannelInputSwitches
      :phantom-enabled="currentPhantomState ?? false"
      :pad-enabled="currentPadState ?? false"
      :line-sens-value="currentLineSens"
      :has-phantom="!!props.input.switchNames.phantom"
      :has-pad="!!props.input.switchNames.pad"
      :is-line-input="props.input.type === InputType.LINE"
      :input-switch-values="rmeStore.soundCardConfig.inputSwitchValues"
      @update:phantom="setPhantomState"
      @update:pad="setPadState"
      @update:line-sens="setLineSens"
    />
    
    <Knob
      v-if="inputGain !== null && inputGainBoundaries"
      :class="$style.gainComponent"
      label="Gain"
      :value="inputGain"
      :min="inputGainBoundaries.min"
      :max="inputGainBoundaries.max"
      :size="60"
      :step="props.input.type === InputType.LINE ? 0.5 : 1"
      @newValue="setInputGain"
      @knob-released="resetHeadphones"
    />
  </div>
</template>

<style module>
.inputControls {
  --button-bg-color: #4d4d4d;
  --button-text-color: #ffffff;
  --border-radius: 3px;
  
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gainComponent {
  margin-bottom: 20px;
}
</style>