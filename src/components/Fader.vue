<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface FaderProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  modelValue: number;
}

const props = withDefaults(defineProps<FaderProps>(), {
  min: -60,
  max: 12,
  step: 1,
});

const emit = defineEmits(["newValue"]);

const localValue = ref(props.modelValue);
const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);

const faderPosition = computed(() => {
  const range = props.max - props.min;
  const percentage = (localValue.value - props.min) / range;
  return (1 - percentage) * 100; // Invert percentage for Y-axis
});

const zeroPosition = computed(() => {
  const range = props.max - props.min;
  const percentage = (0 - props.min) / range;
  return (1 - percentage) * 100;
});

function startDrag(event: MouseEvent) {
  isDragging.value = true;
  startY.value = event.clientY;
  startValue.value = localValue.value;
  window.addEventListener("mousemove", drag);
  window.addEventListener("mouseup", stopDrag);
}

function drag(event: MouseEvent) {
  event.preventDefault();
  if (!isDragging.value) return;

  const currentY = event.clientY;
  const deltaY = currentY - startY.value;
  const range = props.max - props.min;
  const faderHeight = 300; // Height of the fader track

  let newValue = startValue.value - (deltaY / faderHeight) * range;
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  newValue = Math.round(newValue / props.step) * props.step;

  localValue.value = newValue;
  emit("newValue", newValue);
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
}

onMounted(() => {
  localValue.value = props.modelValue;
});

onUnmounted(() => {
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
});
</script>

<template>
  <div :class="$style.control">
    <div :class="$style.faderContainer">
      <div :class="$style.faderTrack">
        <div
          :class="$style.zeroLine"
          :style="{ top: `${zeroPosition}%` }"
        ></div>
      </div>
      <div
        :class="$style.faderHandle"
        :style="{ top: `${faderPosition}%` }"
        @mousedown.prevent="startDrag"
      >
        <div :class="$style.handleLine"></div>
      </div>
    </div>
    <span :class="$style.label">{{ label }}</span>
    <span :class="$style.value">{{ Math.round(localValue) }}</span>
  </div>
</template>

<style module>
.control {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}
.faderContainer {
  position: relative;
  width: 60px;
  height: 300px;
}
.faderTrack {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background-color: #3a3a3a;
  border-radius: 2px;
}
.faderHandle {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 70px;
  background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  cursor: ns-resize;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  user-select: none;
}
.handleLine {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e0e0e0;
}
.zeroLine {
  position: absolute;
  width: 50px;
  height: 2px;
  background-color: #727272;
  left: 50%;
  transform: translateX(-50%);
}
.label {
  color: #303030;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}
.value {
  color: #505050;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
}
</style>
