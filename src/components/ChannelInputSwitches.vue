<script setup lang="ts">

defineProps<{
  phantomEnabled: boolean;
  padEnabled: boolean;
  lineSensValue: string | null;
  hasPhantom: boolean;
  hasPad: boolean;
  isLineInput: boolean;
  inputSwitchValues: {
    lineSensLow: string;
    lineSensHigh: string;
  };
}>();

const emit = defineEmits<{
  'update:phantom': [value: boolean];
  'update:pad': [value: boolean];
  'update:lineSens': [value: string];
}>();
</script>
<template>
    <div :class="$style.inputSwitchesContainer">
      <div :class="$style.buttonGroup">
        <button
          v-if="hasPhantom"
          :class="[$style.switchButton, $style.phantomButton, { [$style.active]: phantomEnabled }]"
          @click="emit('update:phantom', !phantomEnabled)"
        >
          48v
        </button>
        <button
          v-if="hasPad"
          :class="[$style.switchButton, $style.padButton, { [$style.active]: padEnabled }]"
          @click="emit('update:pad', !padEnabled)"
        >
          PAD
        </button>
      </div>
      <select
        v-if="isLineInput"
        :class="$style.lineSensSelect"
        :value="lineSensValue"
        @change="e => emit('update:lineSens', (e.target as HTMLSelectElement).value)"
      >
        <option :value="inputSwitchValues.lineSensLow">+4dBV</option>
        <option :value="inputSwitchValues.lineSensHigh">-10dBu</option>
      </select>
    </div>
  </template>
  
  <style module>
  .inputSwitchesContainer {
    --button-bg-color: #4d4d4d;
    --button-text-color: #ffffff;
    --button-active-color: #ff7676;
    --control-width: 75px;
    --border-radius: 3px;
    --delimiter-color: rgba(255, 255, 255, 0.2);
  
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    margin-bottom: 20px;
    width: var(--control-width);
  }
  
  .buttonGroup {
    display: flex;
    width: 100%;
    position: relative;
  }
  
  .switchButton {
    flex: 1;
    padding: 6px 0;
    background-color: var(--button-bg-color);
    height: 30px;
    border: none;
    color: var(--button-text-color);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  
    &.active {
      color: var(--button-active-color);
      filter: brightness(1.2);
    }
  
    &:hover {
      filter: brightness(1.1);
    }
  }
  
  .phantomButton {
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }
  
  .padButton {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
    position: relative;
  
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 15%;
      height: 70%;
      width: 1px;
      background-color: var(--delimiter-color);
    }
  }
  
  .lineSensSelect {
    width: 100%;
    padding-left: 8px;
    height: 30px;
    background-color: var(--button-bg-color);
    border: none;
    border-radius: var(--border-radius);
    color: var(--button-text-color);
    font-size: 11px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 12px auto;
  }
  </style>