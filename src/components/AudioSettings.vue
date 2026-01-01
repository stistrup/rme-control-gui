<script setup lang="ts">
import { useRmeStore } from "../stores/rmeStore";
import { inject, ref, watch, onMounted } from "vue";
import { RmeService } from "../services/RmeService";
import { audioProfilesConfig } from "../config/soundCardConfig";

const rmeStore = useRmeStore();
const rmeService = inject<RmeService>("RmeService");
const selectedClockQuantum = ref(256); // Default value
const selectedAudioProfile = ref<string>(); // Default value
const audioProfiles = ref(audioProfilesConfig)

if (!rmeService) {
  throw new Error("Could not load rme plugin");
}

const clockQuantumSizes = [32, 64, 128, 256, 512, 1024, 2048];

const setAudioProfile = () => {
  if (!selectedAudioProfile.value) return
  rmeService.setActiveProfile(selectedAudioProfile.value)
};

const setClockQuantum = () => {
  console.log(selectedClockQuantum.value)
  rmeService.setClockQuantum(selectedClockQuantum.value);
};

watch(() => rmeStore.activeProfile, () => {
  selectedAudioProfile.value = rmeStore.activeProfile?.profileName
}, {immediate: true})

onMounted(async () => {
  const currentQuantum = await rmeService.getClockQuantum();
  if (currentQuantum !== null) {
    selectedClockQuantum.value = currentQuantum;
  }
});

</script>

<template>
  <div :class="$style.settingsContainer">
    <div v-if="rmeStore.activeProfile" :class="$style.controlGroup">
      <span :class="$style.label">
        Audio profile:
      </span>
      <select
        id="bufferSize"
        v-model="selectedAudioProfile"
        :class="$style.select"
        @change="setAudioProfile"
      >
        <option v-for="profile in audioProfiles" :key="profile.profileName" :value="profile.profileName">
          {{ profile.displayName }}
        </option>
      </select>
    </div>
    <div :class="$style.controlGroup">
      <label for="clockQuantum" :class="$style.label">Buffer Size: </label>
      <select
        id="clockQuantum"
        v-model="selectedClockQuantum"
        :class="$style.select"
        @change="setClockQuantum"
      >
        <option v-for="quantum in clockQuantumSizes" :key="quantum" :value="quantum">
          {{ quantum }}
        </option>
      </select>
    </div>
  </div>
</template>

<style module>
.settingsContainer {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
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
  font-size: 14px;
  margin-right: 1rem;
  color: #ffffff; /* Changed to white for better contrast */
  background-color: #4d4d4d;
  height: 32px;
  min-width: 58px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 8px top 50%;
  background-size: 12px auto;
}

.select {
  /* ... other properties ... */
  padding-right: 24px; /* Make room for the arrow */
  position: relative;
}

.select::after {
  content: '▼';
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #ffffff;
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
