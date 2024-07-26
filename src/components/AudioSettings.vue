<script setup lang="ts">
import { useRmeStore } from "../stores/rmeStore";
import { inject, ref, computed } from "vue";
import { RmeService } from "../services/RmeService";

const rmeStore = useRmeStore();
const rmePlugin = inject<RmeService>("RmeService");
const bufferSize = ref(256); // Default value

if (!rmePlugin) {
  throw new Error("Could not load rme plugin");
}

const bufferSizes = [32, 64, 128, 256, 512, 1024, 2048];

const handleUpdateProfile = (profile: string) => {
  if (rmeStore.isSupportedProfile(profile)) {
    rmePlugin.setPipewireProfile(profile);
  }
};

const handleSetBufferSize = () => {
  if (rmePlugin) {
    rmePlugin.setBufferSize(bufferSize.value);
  }
};

// Profile Switch Logic
const profileSwitchEnabled = computed(() => {
  return rmeStore.profileDefault && rmeStore.profileProAudio;
});

const toggleProfile = () => {
  if (!rmeStore.profileProAudio || !rmeStore.profileDefault) return;
  if (rmeStore.activeProfile === rmeStore.profileDefault) {
    handleUpdateProfile(rmeStore.profileProAudio);
  } else {
    handleUpdateProfile(rmeStore.profileDefault);
  }
};
</script>

<template>
  <div :class="$style.settingsContainer">
    <div v-if="profileSwitchEnabled" :class="$style.controlGroup">
      <span :class="$style.label">
        Audio profile:
        {{
          rmeStore.activeProfile === rmeStore.profileProAudio
            ? "Pro Audio"
            : "Default"
        }}
      </span>
      <button :class="$style.button" @click="toggleProfile">
        Switch to
        {{
          rmeStore.activeProfile === rmeStore.profileProAudio
            ? "Default"
            : "Pro Audio"
        }}
      </button>
    </div>
    <div :class="$style.controlGroup">
      <label for="bufferSize" :class="$style.label">Set Buffer Size: </label>
      <select
        id="bufferSize"
        v-model.number="bufferSize"
        :class="$style.select"
      >
        <option v-for="size in bufferSizes" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
      <button @click="handleSetBufferSize" :class="$style.button">
        Set Buffer Size
      </button>
    </div>
  </div>
</template>

<style module>
.settingsContainer {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controlGroup {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.label {
  font-size: 14px;
  font-weight: bold;
  margin-right: 1rem;
  color: #3a3a3a;
}

.select {
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 1rem;
  color: #3a3a3a;
  background-color: #4d4d4d; /* Match button color */
  height: 32px; /* Match button height */
}

.button {
  padding: 4px 8px;
  font-size: 14px;
  color: #fff;
  background-color: #3a3a3a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  height: 32px; /* Ensuring consistent height */
}

.button:hover {
  background-color: #000000;
}
</style>
