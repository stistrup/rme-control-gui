<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import Knob from "./Knob.vue";
import Fader from "./Fader.vue"
import { RmeService } from "../services/RmeService";
import { AlsaOutput, OutputType } from "../types/config.types";
import { useRmeStore } from "../stores/rmeStore";
import { alsaToDB } from "../utils/alsaValConversion";

interface MonitorControlProps {
  outputs: AlsaOutput[];
}

defineProps<MonitorControlProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore()

if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const monitorVolumeLeft = ref(0);
const monitorVolumeRight = ref(0);
const headphonesVolume = ref(0);

const setOutputVolume = (outputType: OutputType, volume: number) => {
  const output = rmeStore.soundCardConfig.outputs.find(output => output.type === outputType)

  if (!output){
    console.error('Could not find output in config')
    return
  }

  rmeService.setAlsaVolumeStereo(output.controlNameLeft, output.controlNameRight, volume);
};

onMounted(async () => {
  const outputMonitor = rmeStore.soundCardConfig.outputs.find(output => output.type === OutputType.SPEAKERS)
  const outputHeadphones = rmeStore.soundCardConfig.outputs.find(output => output.type === OutputType.HEADPHONES)
  if (!outputMonitor || !outputHeadphones){
    console.error('Could not find outputs in config')
    return
  }

  const monitor = await rmeService.getAlsaVolumeStereo(outputMonitor.controlNameLeft, outputMonitor.controlNameRight);
  const hp = await rmeService.getAlsaVolumeStereo(outputHeadphones.controlNameLeft, outputHeadphones.controlNameRight);

  if (!hp || !monitor) return;

  const hpAvarage = (hp.left + hp.right) / 2;

  monitorVolumeLeft.value = monitor.left
  monitorVolumeRight.value = monitor.right
  headphonesVolume.value = hpAvarage;

  console.log(monitorVolumeLeft.value, monitorVolumeRight.value)
});
</script>

<template>
  <div :class="$style.monitorControl">
    <p :class="$style.label">Monitor</p>
    <div :class="$style.controls">
      <div :class="$style.mainVolume">
        <Fader 
          :value="monitorVolumeLeft" 
          :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
          :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
          :stereo="true"
          :value-right="monitorVolumeRight"
          @new-value="value => setOutputVolume(OutputType.SPEAKERS, value)"
        />
      </div>
      <Knob
        :label="'Headphones'"
        :value="headphonesVolume"
        :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
        :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
        :size="80"
        @new-value="value => setOutputVolume(OutputType.HEADPHONES, value)"
      />
    </div>
  </div>


</template>

<style module>
  .monitorControl{
    display: flex;
    gap: 20px;
    flex-direction: column;
  }
  
  .controls{
    display: flex;
  }

  .mainVolume {
    margin-right: 20px;
  }
</style>
