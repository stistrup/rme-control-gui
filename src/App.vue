<script setup lang="ts">
import { inject, onMounted, watch } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmeService } from "./services/RmeService.ts";
import { useRmeStore } from "./stores/rmeStore.ts";

// Card must match name in aplay -l
const rmePlugin = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

if (!rmePlugin) {
  throw new Error("Could not import rme plugin");
}

const initApp = async () => {
  await rmePlugin.getCurrentStates();
};

onMounted(async () => {
  await initApp();
});
</script>

<template>
  <HomeView />
</template>

<style module></style>
