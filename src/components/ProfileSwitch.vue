<script setup lang="ts">
import { computed } from "vue";
import { useRmeStore } from "../stores/rmeStore";

interface ProfileSwitchProps {
  activeProfile: string;
}

const props = defineProps<ProfileSwitchProps>();
const emit = defineEmits(["updateProfile"]);

const rmeStore = useRmeStore();

const profileSwitchEnabled = computed(() => {
  return rmeStore.profileDefault && rmeStore.profileProAudio;
});

const toggleProfile = () => {
  if (rmeStore.activeProfile === rmeStore.profileDefault) {
    emit("updateProfile", rmeStore.profileProAudio);
  } else {
    emit("updateProfile", rmeStore.profileDefault);
  }
};
</script>

<template>
  <div v-if="profileSwitchEnabled" :class="$style.container">
    <span :class="$style.label"
      >Audio profile:
      {{
        props.activeProfile === rmeStore.profileProAudio
          ? "Pro Audio"
          : "Default"
      }}</span
    >
    <button :class="$style.button" @click="toggleProfile">
      Switch to
      {{
        props.activeProfile === rmeStore.profileProAudio
          ? "Default"
          : "Pro Audio"
      }}
    </button>
  </div>
</template>

<style module>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  gap: 10px;
}

.label {
  font-size: 14px;
  color: #303030;
  margin-right: 8px;
}

.button {
  padding: 4px 8px;
  font-size: 14px;
  color: #fff;
  background-color: #4d4d4d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #000000;
}
</style>
