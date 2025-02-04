<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from "vue";
import { applyExponentialCurve, removeExponentialCurve } from "../utils/expConvertion";

interface KnobProps {
  min: number;
  max: number;
  value: number;
  size?: number;
  step?: number
  label?: string;
  icon?: string;
  exponentCurve?: number;
}

const props = withDefaults(defineProps<KnobProps>(), {
  size: 80,
  step: 1,
  exponentCurve: 1 // 1 is linear
});

if (props.exponentCurve < 1) {
  throw new Error("Cannot set exponent to lower than 1")
}

const emit = defineEmits(["newValue", "knobReleased"]);

const localValue = ref(props.value);
const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);

const rotation = computed(() => {
    // Convert the current value to exponential space for visual rotation
    const exponentialValue = applyExponentialCurve(localValue.value, props.min, props.max, props.exponentCurve);
    const range = props.max - props.min;
    const percentage = (exponentialValue - props.min) / range;
    return percentage * 270 - 135; // -135 to 135 degrees

});

const referenceLines = computed(() => {
  return Array.from({ length: 11 }, (_, i) => ({
    rotation: i * 27 - 135, // -135 to 135 degrees, 11 lines
  }));
});

const componentSize = computed(() => props.size);
const knobSize = computed(() => Math.round(componentSize.value * 0.667));
const indicatorLength = computed(() => Math.round(knobSize.value * 0.4));
const indicatorWidth = computed(() =>
  Math.max(2, Math.round(componentSize.value * 0.033))
);
const referenceLineHeight = computed(() =>
  Math.round(componentSize.value * 0.067)
);
const referenceLineWidth = computed(() =>
  Math.max(1, Math.round(componentSize.value * 0.017))
);
const referenceLineDistance = computed(() => Math.round(knobSize.value * 0.65));

const referenceLineTop = computed(() => {
  const knobCenter = componentSize.value / 2;
  const lineCenter = referenceLineDistance.value;
  return knobCenter - lineCenter;
});

const displayedValue = computed(() => {
  const value = Math.round(localValue.value / props.step) * props.step
  return value === -65 ? "-inf" : value
})

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
  const deltaY = startY.value - currentY;
  const range = props.max - props.min;
  const sensitivity = 300;


  // Convert the start value to its exponential position
  const exponentialStartValue = applyExponentialCurve(startValue.value, props.min, props.max, props.exponentCurve);
  
  // Apply the movement to the exponential position
  let exponentialNewValue = exponentialStartValue + (deltaY / sensitivity) * range;
  exponentialNewValue = Math.max(props.min, Math.min(props.max, exponentialNewValue));
  
  // Convert back to the actual value space
  let newValue = removeExponentialCurve(exponentialNewValue, props.min, props.max, props.exponentCurve);
  newValue = Math.round(newValue / props.step) * props.step;

  localValue.value = newValue;
  emit("newValue", newValue);
  
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
  emit("knobReleased")
}

watchEffect(() => {
  localValue.value = props.value;
});

onMounted(() => {
  localValue.value = props.value;
});

onUnmounted(() => {
  window.removeEventListener("mousemove", drag);
  window.removeEventListener("mouseup", stopDrag);
});
</script>

<template>
  <div :class="$style.control" :style="{ width: `${componentSize}px` }">
    <div :class="$style.topWrapper">
      <div
        :class="$style.knobContainer"
        :style="{ width: `${componentSize}px`, height: `${componentSize}px` }"
      >
        <div
          :class="$style.knob"
          :style="{ width: `${knobSize}px`, height: `${knobSize}px` }"
          @mousedown.prevent="startDrag"
        >
          <div
            :class="$style.indicator"
            :style="{
              transform: `rotate(${rotation}deg)`,
              height: `${indicatorLength}px`,
              width: `${indicatorWidth}px`,
              top: `${knobSize / 2 - indicatorLength}px`,
              left: `calc(50% - ${indicatorWidth / 2}px)`,
            }"
          ></div>
        </div>
        <div
          v-for="line in referenceLines"
          :key="line.rotation"
          :class="$style.referenceLine"
          :style="{
            transform: `rotate(${line.rotation}deg)`,
            height: `${referenceLineHeight}px`,
            width: `${referenceLineWidth}px`,
            top: `${referenceLineTop}px`,
            transformOrigin: `center ${referenceLineDistance}px`,
          }"
        ></div>
      </div>
      <span v-if="label" :class="$style.label">{{ label }}</span>
      <img v-else-if="icon" :class="$style.icon" :src="`images/${icon}`"/>
    </div>
    <span :class="$style.value">{{ displayedValue }} dB</span>
  </div>
</template>

<style module>
.control {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.topWrapper{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.knobContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.knob {
  background: radial-gradient(circle at 30% 30%, 
    #4a4a4a 0%, 
    #3a3a3a 50%, 
    #2a2a2a 100%
  );
  border-radius: 50%;
  position: relative;
  cursor: ns-resize;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  user-select: none;
}
.indicator {
  position: absolute;
  background-color: #e0e0e0;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 2px;
}
.referenceLine {
  position: absolute;
  background-color: #727272;
}
.label {
  color: #303030;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 500;
}
.value {
  color: #505050;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 400;
}

.icon {
  height: 20px;
  filter:opacity(0.7);
}
</style>