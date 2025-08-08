<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted } from "vue";
import HomeView from "./views/HomeView.vue";
import { RmeService } from "./services/RmeService.ts";
import { useRmeStore } from "./stores/rmeStore.ts";
const rmeService = inject<RmeService>("RmeService");
const rmeStore = useRmeStore();

if (!rmeService) {
  throw new Error("Could not import plugin");
}

const initApp = async () => {
  await rmeService.init();
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
