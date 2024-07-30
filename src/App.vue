<script setup lang="ts">
import { inject, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmeService } from "./services/RmeService.ts";

// Card must match name in aplay -l
const rmePlugin = inject<RmeService>("RmeService");

if (!rmePlugin) {
  throw new Error("Could not import rme plugin");
}

const initApp = async () => {
  await rmePlugin.init();
};

onMounted(async () => {
  await initApp();
});
</script>

<template>
  <HomeView />
</template>

<style module></style>
