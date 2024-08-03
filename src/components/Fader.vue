<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { applyExponentialCurve, removeExponentialCurve } from "../utils/expConvertion";

interface FaderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  valueRight?: number;
  stereo?: boolean
}

const props = withDefaults(defineProps<FaderProps>(), {
  stereo: false,
});

const emit = defineEmits(["newValue", "newValueRight"]);

const localValue = ref(props.value);
const localValueRight = ref(props.valueRight);
const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);
const startValueRight = ref(0) 
const stereoLink = ref(true)

const faderPosition = computed(() => {
  const range = props.max - props.min;
  const percentage = (localValue.value - props.min) / range;
  return (1 - percentage) * 100; 
});

const faderPositionRight = computed(() => {
  if (localValueRight.value === undefined) return null
  const range = props.max - props.min;
  const percentage = (localValueRight.value - props.min) / range;
  console.log('????',percentage)
  return (1 - percentage) * 100; 
});

const zeroPosition = computed(() => {
  if (props.min >= 0 || props.max <= 0) {
    return props.min >= 0 ? 100 : 0;
  }
  
  const zeroLinear = (0 - props.min) / (props.max - props.min);
  const zeroCurved = applyExponentialCurve(zeroLinear, 0, 1);
  return (1 - zeroCurved) * 100;
});

function startDrag(event: MouseEvent) {
  isDragging.value = true;
  startY.value = event.clientY;
  startValue.value = localValue.value;

  if (localValueRight.value && stereoLink.value) {
    startValueRight.value = localValueRight.value
  }

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

  let restoredScale = removeExponentialCurve(newLinearValue, props.min, props.max);
  restoredScale = Math.round(restoredScale * 2) / 2; // Round to nearest 0.5

  let newLinearValueRight
  let restoredScaleRight

  if (localValueRight.value && stereoLink) {
    newLinearValueRight = startValueRight.value - (deltaY / faderHeight) * range;
    newLinearValueRight = Math.max(props.min, Math.min(props.max, newLinearValueRight));

    restoredScaleRight = removeExponentialCurve(newLinearValue, props.min, props.max);
    restoredScaleRight = Math.round(restoredScaleRight * 2) / 2; // Round to nearest 0.5
  }

  const snapThreshold = 1; // 1 dB

  if (restoredScale < snapThreshold && restoredScale > -snapThreshold) {
    newLinearValue = applyExponentialCurve(0, props.min, props.max)
  }

  localValue.value = newLinearValue;
  emit("newValue", restoredScale);

  if (localValueRight.value && restoredScaleRight && newLinearValueRight) {
    localValueRight.value = restoredScaleRight
    emit("newValueRight", newLinearValueRight)
  }
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
}

onMounted(() => {
  localValue.value = applyExponentialCurve(props.value, props.min, props.max);

  if (props.valueRight === undefined) return 

  console.error(props.valueRight)

  console.error('Yooo', applyExponentialCurve(props.valueRight, props.min, props.max))

  localValueRight.value = applyExponentialCurve(props.valueRight, props.min, props.max)
  
});

onUnmounted(() => {
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
});

// Watch for changes in the prop value
watch(() => props.value, (newValue) => {
  localValue.value = applyExponentialCurve(newValue, props.min, props.max);
});

watch(() => props.valueRight, (newValue) => {
  if (newValue === undefined) return
  localValueRight.value = applyExponentialCurve(newValue, props.min, props.max);
});

const displayValue = computed(() => {
  return Math.round(removeExponentialCurve(localValue.value, props.min, props.max));
});
</script>

<template>
  
  <div :class="$style.control">
    <div :class="$style.faderContainer">
      <div :class="$style.fader">
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
      <div v-if="stereo && faderPositionRight !== null" :class="[$style.fader, $style.faderRight]">
        <div :class="$style.faderTrack">
          <div
            :class="$style.zeroLine"
            :style="{ top: `${zeroPosition}%` }"
          ></div>
        </div>
        <div
          :class="$style.faderHandle"
          :style="{ top: `${faderPositionRight}%` }"
          @mousedown.prevent="startDrag"
        >
          <div :class="$style.handleLine"></div>
        </div>
      </div>
    </div>
    <div :class="$style.valueContainer">
      <span :class="$style.label">{{ label }}</span>
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
}

.fader {
  position: relative;
  width: 60px;
  height: 300px;

  &.faderRight{
    margin-left: 40px;
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

.valueContainer{
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;

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
}
</style>
