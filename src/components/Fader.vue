<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { applyExponentialCurve, removeExponentialCurve } from "../utils/expConvertion";
import FaderThumb from "./FaderThumb.vue";

interface FaderProps {
  min: number;
  max: number;
  value: number;
}

const props = defineProps<FaderProps>();

const emit = defineEmits(["newValue", "newValueRight"]);

const localValue = ref(props.value);
const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);
const exponent = 2.5

const faderPosition = computed(() => {
  const range = props.max - props.min;
  const percentage = (localValue.value - props.min) / range;
  return (1 - percentage) * 100; 
});

const zeroPosition = computed(() => {
  if (props.min >= 0 || props.max <= 0) {
    return props.min >= 0 ? 100 : 0;
  }
  
  const zeroLinear = (0 - props.min) / (props.max - props.min);
  const zeroCurved = applyExponentialCurve(zeroLinear, 0, 1, exponent);
  return (1 - zeroCurved) * 100;
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
  const faderHeight = 300;

  let newLinearValue = startValue.value - (deltaY / faderHeight) * range;
  newLinearValue = Math.max(props.min, Math.min(props.max, newLinearValue));

  let restoredScale = removeExponentialCurve(newLinearValue, props.min, props.max, exponent);
  restoredScale = Math.round(restoredScale * 2) / 2; // Round to nearest 0.5

  const snapThreshold = 1; // 1 dB

  if (restoredScale < snapThreshold && restoredScale > -snapThreshold) {
    newLinearValue = applyExponentialCurve(0, props.min, props.max, exponent)
  }

  localValue.value = newLinearValue;
  emit("newValue", restoredScale);
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
}

onMounted(() => {
  localValue.value = applyExponentialCurve(props.value, props.min, props.max, exponent);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
});

// Watch for changes in the prop value
watch(() => props.value, (newValue) => {
  localValue.value = applyExponentialCurve(newValue, props.min, props.max, exponent);
});

const displayValue = computed(() => {
  return Math.round(removeExponentialCurve(localValue.value, props.min, props.max, exponent));
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
        <FaderThumb
          :class="$style.faderThumbComponent"
          :style="{ top: `${faderPosition}%` }"
          @mousedown.prevent="startDrag"
        />
    </div>
    <div :class="$style.valueContainer">
      <span :class="$style.value">{{ displayValue === -65 ? "-inf" : displayValue }} dB</span>
    </div>
  </div>
</template>

<style module>
.control {
  align-items: center;
  width: 60px;
}

.faderContainer {
  display: flex;
  position: relative;
  width: 60px;
  height: 300px;

  &.faderRight{
    margin-left: 35px;
  }
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
.faderThumbComponent {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  /* width: 40px;
  height: 70px;
  background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
  border-radius: 4px;
  cursor: ns-resize;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  user-select: none; */
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

.valueContainer{
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .value {
    color: #505050;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
