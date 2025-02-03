<script setup lang="ts">
import { computed, inject, onMounted, ref } from "vue";
import ChannelInputLabel from "./ChannelInputLabel.vue";
import ChannelInputControls from "./ChannelInputControls.vue";
import Fader from "./Fader.vue";
import Knob from "./Knob.vue";
import { RmeService } from "../services/RmeService";
import { useRmeStore } from "../stores/rmeStore";
import { AlsaInput, OutputType } from "../types/config.types";
import { alsaToDB } from "../utils/alsaValConversion";
import { formatRoutingControlName } from "../utils/bbfproControlName";
import linkIcon from '../assets/images/link.png';

interface ChannelProps {
  leftInput: AlsaInput;
  rightInput?: AlsaInput;
}

const props = defineProps<ChannelProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

const volumes = computed(() =>{
  return rmeStore.channelVolumes[props.leftInput.controlName]
})

const volumeBoundaries = ref<{min: number, max: number} | null>(null);
const canBeStereoCoupled = ref(props.leftInput.inputIndex % 2 === 0);

const getOutputRoutingVolume = async (outputType: OutputType) => {

  const controlNames = formatRoutingControlName(
    props.leftInput.controlName, 
    outputType, 
    rmeStore.soundCardConfig.outputs,
    rmeStore.isCompatabilityMode
  )

  if(!controlNames) {
    console.error('Could not format control names for output')
    return
  }

  const levels = await rmeService?.getAlsaVolumeStereo(
    controlNames.left,
    controlNames.right
  );
  if (!levels) return

  return {left: levels.left, right: levels.right};
}

const setOutputRoutingVolume = (outputType: OutputType, newValue: number) => {

    const controlNames = formatRoutingControlName(
      props.leftInput.controlName, 
      outputType,
      rmeStore.soundCardConfig.outputs,
      rmeStore.isCompatabilityMode
    )
  
  if(!controlNames) return

  rmeService?.setAlsaVolumeStereo(controlNames.left, controlNames.right, newValue)
};

const toggleStereoCouple = () => {
  if (!canBeStereoCoupled.value) return
  const newState = !props.leftInput.stereoCoupled

  console.debug(props.leftInput.displayName, 'stereo coupling changed to', newState)
  rmeStore.setStereoCouple(props.leftInput.controlName, newState)
  rmeService?.setInputChannelConfig(props.leftInput.controlName, props.leftInput.displayName, props.leftInput.displayNameStereo ?? "", newState)
}

onMounted(async () => {
  const volBoundriesAlsa = rmeStore.getControlByName(`${props.leftInput.controlName}-AN1`)
  const volBoundriesDbMin = alsaToDB(volBoundriesAlsa.limits.min)
  const volBoundriesDbMax = alsaToDB(volBoundriesAlsa.limits.max)
  volumeBoundaries.value = {min: volBoundriesDbMin, max: volBoundriesDbMax}

  const levelsMain = await getOutputRoutingVolume(OutputType.SPEAKERS);
  const levelsHp = await getOutputRoutingVolume(OutputType.HEADPHONES);

  if (levelsMain) rmeStore.setChannelMonitorSend(props.leftInput.controlName, levelsMain.left, levelsMain.right)
  if (levelsHp) rmeStore.setChannelHpSend(props.leftInput.controlName, levelsHp.left, levelsHp.right)
});

</script>

<template>
  <div :class="[$style.channelContainer, { [$style.firstChannel]: leftInput.inputIndex === 0 }]">
    <ChannelInputLabel :input="leftInput"/>
    <div :class="$style.controlsContainer">
      <div :class="$style.stereoButtonContainer">
        <button 
          v-if="canBeStereoCoupled"
          :class="$style.stereoButton"
          @click="toggleStereoCouple"
        >
          <img :class="$style.linkIcon" :src="linkIcon"/>
          <span>→</span>
        </button>
      </div>
      
      <Fader
        v-if="volumes && volumeBoundaries"
        :value="(volumes.monitorSendDb.left + volumes.monitorSendDb.right) / 2"
        :min="volumeBoundaries.min"
        :max="volumeBoundaries.max"
        :step="1"
        @newValue="value => setOutputRoutingVolume(OutputType.SPEAKERS, value)"
      />
      
      <div :class="$style.rightControls">
        <ChannelInputControls :input="leftInput" />
        <Knob
          v-if="volumes && volumeBoundaries"
          :value="(volumes.hpSendDb.left + volumes.hpSendDb.right) / 2"
          :min="volumeBoundaries.min"
          :max="volumeBoundaries.max"
          :size="60"
          icon="headphones.png"
          :exponent-curve="2.5"
          @newValue="value => setOutputRoutingVolume(OutputType.HEADPHONES, value)"
        />
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

  &.firstChannel {
    border-left: 1px solid var(--channel-border-color);
  }
}

.controlsContainer {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  position: relative;
}

.stereoButtonContainer {
  position: absolute;
  top: -20px;
  right: 0;
}

.stereoButton {
  padding: 3px 6px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  background: none;
  --button-bg-color: #4d4d4d;
  --button-text-color: #ffffff;

  &:hover {
    background-color: var(--button-bg-color);
    color: var(--button-text-color)
  }
}

.linkIcon {
  height: 15px;
  filter: opacity(0.7);
}

.rightControls {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
