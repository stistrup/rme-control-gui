<script setup lang="ts">
import { onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { getInitialStates, initializeSoundCard } from "./utils/rmeUtils";
import { useRmeStore } from "./store/babyfaceStore";

// Card must match name in aplay -l
const SOUND_CARD = "Babyface Pro";

const rmeStore = useRmeStore();

const initApp = async () => {
  const result = await initializeSoundCard(SOUND_CARD);
  console.log("Result from initializing sound card", result);

  if (result) {
    rmeStore.isInitialized = true;
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
