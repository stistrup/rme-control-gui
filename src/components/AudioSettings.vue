<script setup lang="ts">
import ProfileSwitch from "./ProfileSwitch.vue";
import { useRmeStore } from "../stores/rmeStore";
import { inject } from "vue";

const rmeStore = useRmeStore();
const rmePlugin = inject("RmePlugin");

if (!rmePlugin) {
  throw new Error("Could not load rme plugin");
}

const handleUpdateProfile = (profile: string) => {
  if (rmeStore.isSupportedProfile(profile)) {
    rmePlugin.setPipewireProfile(profile);
  }
};
</script>

<template>
  <div :class="$style.settingsContainer"></div>
  <ProfileSwitch
    v-if="rmeStore.activeProfile"
    :active-profile="rmeStore.activeProfile"
    @update-profile="handleUpdateProfile"
  />
</template>

<style module>
.settingsContainer {
}
</style>
