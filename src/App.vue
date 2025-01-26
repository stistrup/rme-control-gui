<script setup lang="ts">
import { inject, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmeService } from "./services/RmeService.ts";
import { babyfaceProConf, babyfaceProConfCombatabilityMode } from "./config/soundCardConfig.ts";
import { OutputType } from "./types/config.types.ts";
import { useRmeStore } from "./stores/rmeStore.ts";

// Card must match name in aplay -l
const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

if (!rmeService) {
  throw new Error("Could not import rme plugin");
}

const initApp = async () => {

  // const mainOutConf = babyfaceProConfCombatabilityMode.outputs.find(out => out.type === OutputType.HEADPHONES)

  // if (!mainOutConf) {
  //   console.error('No conf for main out !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  //   return
  // } 
  
  // const mainVolTest = await rmeService.getAlsaVolumeStereo(mainOutConf.controlNameLeft, mainOutConf.controlNameRight)
  
  // if (!mainVolTest) {
  //   console.log('No support for main out volume. Using compatibility mode')
  //   rmeStore.setActiveConfig(babyfaceProConfCombatabilityMode)
  // }

  await rmeService.init();
};

onMounted(async () => {
  await initApp();
});
</script>

<template>
  <HomeView v-if="rmeStore.isInitialized"/>
</template>

<style module></style>
