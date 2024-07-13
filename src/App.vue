<script setup lang="ts">
import { inject, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { findSoundCardNumber, getSoundcardControls } from "./utils/rmeUtils";
import { formatControls } from "./utils/formatAlsaOutput.ts";
import { useRmeStore } from "./stores/rmeStore.ts";
import { RmePlugin } from "./plugins/RmePlugin.ts";

// Card must match name in aplay -l
const SOUND_CARD = "Babyface Pro";

const rmeStore = useRmeStore();
const rmePlugin = inject<RmePlugin>("RmePlugin");

if (!rmePlugin) {
  throw new Error("Could not import rme plugin");
}

const initApp = async () => {
  const soundCardNumber = await findSoundCardNumber(SOUND_CARD);

  if (soundCardNumber) {
    rmeStore.setSoundcardNumber(soundCardNumber);
  }

  const soundCardControlsRaw = await getSoundcardControls(SOUND_CARD);

  if (soundCardControlsRaw) {
    try {
      const formattedControls = formatControls(soundCardControlsRaw);
      rmeStore.setControls(formattedControls);
    } catch (error) {
      console.error(error);
    }
  }
};

onMounted(async () => {
  await initApp();
});
</script>

<template>
  <HomeView />
</template>

<style module></style>
