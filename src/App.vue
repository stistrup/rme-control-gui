<script setup lang="ts">
import { inject, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmePlugin } from "./plugins/RmePlugin.ts";

// Card must match name in aplay -l
const rmePlugin = inject<RmePlugin>("RmePlugin");

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
