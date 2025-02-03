<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmeService } from "./services/RmeService.ts";
import { useRmeStore } from "./stores/rmeStore.ts";
import { MqttService } from "./services/MqttService.ts";
import { percentageToDb } from "./utils/alsaValConversion.ts";
import { OutputType } from "./types/config.types.ts";
import { BrokerConfig } from "./types/mqtt.types.ts";

const rmeService = inject<RmeService>("RmeService");
const mqttService = inject<MqttService>("MqttService");
const rmeStore = useRmeStore();

if (!rmeService || !mqttService) {
  throw new Error("Could not import plugins");
}

const initApp = async () => {
  await rmeService.init();

  let mqttConfig: BrokerConfig;

  try {
      // This is not included in release or in source code
      // This is an extra feature for myself to control headphones and phantom power
      // from a custom physical device
      const mqttConfResponse = await fetch("mqttConf.json")
      mqttConfig = await mqttConfResponse.json() as BrokerConfig

      if (mqttConfig) {
        await mqttService.init(mqttConfig.broker)
      }
  } catch (e) {
      console.warn("Not MQTT config. MQTT feature disabled")
  }

  const hpConf = rmeStore.soundCardConfig.outputs.find(out => out.type === OutputType.HEADPHONES)

  mqttService.on("volume", (volume) => {
    if (hpConf) {
      const dbValue = percentageToDb(volume)
      rmeService.setAlsaVolumeStereo(hpConf.controlNameLeft, hpConf.controlNameRight, dbValue)
      rmeStore.setMainVolume(hpConf.controlNameLeft, dbValue, dbValue)
    }
  })

  mqttService.on("phantom", (phantomState) => {
    // index 0 === mic 1
    rmeService.setPhantomPower(0, phantomState)
  })
};

onMounted(async () => {
  await initApp();
});

onBeforeUnmount(() => {
  console.log("shutdown")
})
</script>

<template>
  <HomeView v-if="rmeStore.isInitialized"/>
</template>

<style module></style>
