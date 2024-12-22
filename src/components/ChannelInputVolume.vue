<script setup lang="ts">
import Fader from './Fader.vue';
import Knob from './Knob.vue';
import { OutputType } from '../types/config.types';

const props = defineProps<{
  mainVolume: number;
  headphoneVolume: number;
  volumeBoundaries: {
    min: number;
    max: number;
  };
}>();

const emit = defineEmits<{
  'update:mainVolume': [value: number];
  'update:headphoneVolume': [value: number];
}>();
</script>

<template>
    <div :class="$style.volumeControls">
      <Fader
        :value="mainVolume"
        :min="volumeBoundaries.min"
        :max="volumeBoundaries.max"
        :step="1"
        @newValue="value => emit('update:mainVolume', value)"
      />
      <Knob
        :value="headphoneVolume"
        :min="volumeBoundaries.min"
        :max="volumeBoundaries.max"
        :size="60"
        icon="headphones.png"
        @newValue="value => emit('update:headphoneVolume', value)"
      />
    </div>
  </template>
  
  <style module>
  .volumeControls {
    display: flex;
  }
  </style>