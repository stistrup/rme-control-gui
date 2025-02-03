<script setup lang="ts">
import { computed, inject, onMounted } from "vue";
import Knob from "./Knob.vue";
import Fader from "./Fader.vue"
import { RmeService } from "../services/RmeService";
import { AlsaOutput, OutputType } from "../types/config.types";
import { useRmeStore } from "../stores/rmeStore";
import { alsaToDB } from "../utils/alsaValConversion";

interface MonitorControlProps {
  outputs: AlsaOutput[];
}

const props = defineProps<MonitorControlProps>();

const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore()

if (!rmeService) {
  throw new Error("Could not inject RME service");
}

const monitorConf = computed(() => {
  return props.outputs.find(out => out.type === OutputType.SPEAKERS)
})

const hpConf = computed(() => {
  return props.outputs.find(out => out.type === OutputType.HEADPHONES)
})

const monitorVolume = computed(() => {
  if (!monitorConf.value) return
  return rmeStore.mainVolumes[monitorConf.value.controlNameLeft]
})

const hpVolume = computed(() => {
  if (!hpConf.value) return
  return rmeStore.mainVolumes[hpConf.value.controlNameLeft]
})

const setOutputVolume = (outputType: OutputType, volume: number) => {
  const output = rmeStore.soundCardConfig.outputs.find(output => output.type === outputType)

  if (!output){
    console.error('Could not find output in config')
    return
  }

  rmeService.setAlsaVolumeStereo(output.controlNameLeft, output.controlNameRight, volume);
};

const getHeadphoneStates = async () => {
  if (!hpConf.value) {
    console.error('Could not headphones in config')
    return
  }

  const hp = await rmeService.getAlsaVolumeStereo(hpConf.value.controlNameLeft, hpConf.value.controlNameRight);
  if (!hp) return

  rmeStore.setMainVolume(hpConf.value?.controlNameLeft, hp.left, hp.right)
}

const getSpeakersStates = async () => {
  if (!monitorConf.value){
    console.error('Could not find outputs in config')
    return
  }

  const monitor = await rmeService.getAlsaVolumeStereo(monitorConf.value.controlNameLeft, monitorConf.value.controlNameRight);


  if (!monitor) return;


  rmeStore.setMainVolume(monitorConf.value.controlNameLeft, monitor.left, monitor.right)
}

onMounted(async () => {
  await getHeadphoneStates()
  if (rmeStore.isCompatabilityMode) return
  await getSpeakersStates()
});
</script>

<template>
  <div :class="$style.monitorControl">
    <p :class="$style.label">Monitor</p>
    <div :class="$style.controls">
      <div :class="$style.mainVolume">
        <Fader
          v-if="!rmeStore.isCompatabilityMode && monitorVolume"
          :value="monitorVolume.left" 
          :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
          :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
          :stereo="true"
          :value-right="monitorVolume.right"
          @new-value="value => setOutputVolume(OutputType.SPEAKERS, value)"
        />
      </div>
      <Knob
      v-if="hpVolume"
        icon="headphones.png"
        :value="(hpVolume.left + hpVolume.right) / 2"
        :min="alsaToDB(rmeStore.soundCardConfig.inputRange.min)"
        :max="alsaToDB(rmeStore.soundCardConfig.inputRange.max)"
        :size="80"
        :exponent-curve="2.5"
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
