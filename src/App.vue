<script setup lang="ts">
import { inject, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmeService } from "./services/RmeService.ts";
import { useRmeStore } from "./stores/rmeStore.ts";

// Card must match name in aplay -l
const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

if (!rmeService) {
  throw new Error("Could not import rme plugin");
}

const initApp = async () => {
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
